import os
import sys
from pathlib import Path
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from loguru import logger

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import settings
from app.models.recommender import HybridRecommender
from app.data.database import DatabaseLoader


class ProductRecommendation(BaseModel):
    product_id: str
    score: float = Field(..., description="Recommendation score (higher = better)")
    strategy: str = Field(..., description="Strategy used: collaborative_filtering, item_similarity, popularity")


class UserRecommendationsResponse(BaseModel):
    user_id: str
    recommendations: List[ProductRecommendation]
    total: int
    strategy_used: str


class SimilarProductsResponse(BaseModel):
    product_id: str
    similar_products: List[ProductRecommendation]
    total: int


class PopularProductsResponse(BaseModel):
    products: List[ProductRecommendation]
    total: int


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str = "1.0.0"


class StatsResponse(BaseModel):
    is_trained: bool
    n_users: int
    n_products: int
    n_factors: int
    has_content_features: bool


recommender: Optional[HybridRecommender] = None
db_loader: Optional[DatabaseLoader] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global recommender, db_loader
    
    logger.info("🚀 Starting ShopAI Recommendation Service...")
    
    db_loader = DatabaseLoader()
    
    model_path = Path(settings.MODEL_PATH)
    
    if model_path.exists():
        try:
            recommender = HybridRecommender.load(str(model_path))
            logger.info(f"✅ Model loaded successfully from {model_path}")
            logger.info(f"   Stats: {recommender.get_stats()}")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            recommender = None
    else:
        logger.warning(f"⚠️ Model file not found at {model_path}")
        logger.warning("   Run 'python train.py' to train a model first")
        recommender = None
    
    yield
    
    logger.info("Shutting down recommendation service...")


app = FastAPI(
    title="ShopAI Recommendation Service",
    description="AI-powered product recommendation engine for e-commerce",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return HealthResponse(
        status="healthy" if recommender else "degraded",
        model_loaded=recommender is not None,
        version="1.0.0"
    )


@app.get("/stats", response_model=StatsResponse, tags=["Health"])
async def get_stats():
    if recommender is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    stats = recommender.get_stats()
    return StatsResponse(**stats)


@app.get(
    "/api/recommendations/user/{user_id}",
    response_model=UserRecommendationsResponse,
    tags=["Recommendations"]
)
async def get_user_recommendations(
    user_id: str,
    limit: int = Query(default=10, ge=1, le=50, description="Number of recommendations")
):
    if recommender is None:
        popular = await get_popular_products(limit=limit)
        return UserRecommendationsResponse(
            user_id=user_id,
            recommendations=popular.products,
            total=popular.total,
            strategy_used="popularity_fallback"
        )
    
    try:
        try:
            user_id_parsed = int(user_id)
        except ValueError:
            user_id_parsed = user_id
        
        recommendations = recommender.recommend_for_user(
            user_id_parsed,
            n_recommendations=limit,
            filter_already_bought=True
        )
        
        if recommendations:
            strategy = recommendations[0].get('strategy', 'unknown')
        else:
            strategy = 'no_recommendations'
        
        return UserRecommendationsResponse(
            user_id=user_id,
            recommendations=[
                ProductRecommendation(
                    product_id=str(r['product_id']),
                    score=r['score'],
                    strategy=r['strategy']
                )
                for r in recommendations
            ],
            total=len(recommendations),
            strategy_used=strategy
        )
        
    except Exception as e:
        logger.error(f"Error getting recommendations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/recommendations/product/{product_id}/similar",
    response_model=SimilarProductsResponse,
    tags=["Recommendations"]
)
async def get_similar_products(
    product_id: str,
    limit: int = Query(default=5, ge=1, le=20, description="Number of similar products")
):
    if recommender is None:
        raise HTTPException(status_code=503, detail="Recommendation model not loaded")
    
    try:
        try:
            product_id_parsed = int(product_id)
        except ValueError:
            product_id_parsed = product_id
        
        similar = recommender.recommend_similar_products(
            product_id_parsed,
            n_recommendations=limit
        )
        
        return SimilarProductsResponse(
            product_id=product_id,
            similar_products=[
                ProductRecommendation(
                    product_id=str(s['product_id']),
                    score=s.get('similarity', s.get('score', 0)),
                    strategy=s.get('strategy', 'item_similarity')
                )
                for s in similar
            ],
            total=len(similar)
        )
        
    except Exception as e:
        logger.error(f"Error getting similar products for {product_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get(
    "/api/recommendations/popular",
    response_model=PopularProductsResponse,
    tags=["Recommendations"]
)
async def get_popular_products(
    limit: int = Query(default=20, ge=1, le=50, description="Number of popular products")
):
    if recommender is not None and recommender.popularity_scores is not None:
        popular = recommender._get_popular_recommendations(limit)
        return PopularProductsResponse(
            products=[
                ProductRecommendation(
                    product_id=str(p['product_id']),
                    score=p['score'],
                    strategy='popularity'
                )
                for p in popular
            ],
            total=len(popular)
        )
    
    if db_loader:
        popular_df = db_loader.get_popular_products(limit=limit)
        
        if not popular_df.empty:
            return PopularProductsResponse(
                products=[
                    ProductRecommendation(
                        product_id=str(row['product_id']),
                        score=float(row['order_count']),
                        strategy='popularity_database'
                    )
                    for _, row in popular_df.iterrows()
                ],
                total=len(popular_df)
            )
    
    return PopularProductsResponse(products=[], total=0)


@app.get(
    "/api/recommendations/user/{user_id}/history",
    tags=["User Data"]
)
async def get_user_purchase_history(
    user_id: int,
    limit: int = Query(default=20, ge=1, le=100)
):
    if db_loader is None:
        raise HTTPException(status_code=503, detail="Database not available")
    
    history = db_loader.get_user_history(user_id)
    
    if history.empty:
        return {"user_id": user_id, "purchases": [], "total": 0}
    
    return {
        "user_id": user_id,
        "purchases": history.head(limit).to_dict(orient='records'),
        "total": len(history)
    }


@app.post("/api/recommendations/refresh", tags=["Admin"])
async def refresh_model():
    global recommender
    
    model_path = Path(settings.MODEL_PATH)
    
    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Model file not found")
    
    try:
        recommender = HybridRecommender.load(str(model_path))
        logger.info(f"Model refreshed from {model_path}")
        return {"status": "success", "message": "Model reloaded", "stats": recommender.get_stats()}
    except Exception as e:
        logger.error(f"Failed to refresh model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.SERVICE_PORT,
        reload=settings.DEBUG
    )


