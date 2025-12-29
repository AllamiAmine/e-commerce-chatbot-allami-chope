"""
Configuration for ShopAI Recommendation Service
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Service
    SERVICE_NAME: str = "recommendation-service"
    SERVICE_PORT: int = 8085
    DEBUG: bool = True
    
    # Database - MySQL (same as other services)
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME_ORDERS: str = "shopai_orders"
    DB_NAME_PRODUCTS: str = "shopai_products"
    DB_NAME_USERS: str = "shopai_users"
    
    # Model Configuration
    MODEL_PATH: str = "models/recommender_model.joblib"
    MODEL_FACTORS: int = 64  # Latent factors for ALS
    MODEL_ITERATIONS: int = 30
    MODEL_REGULARIZATION: float = 0.1
    
    # Dataset Configuration
    DATASET_DIR: str = "data/amazon"
    USE_AMAZON_DATA: bool = True
    MIN_INTERACTIONS: int = 5  # Minimum interactions per user
    
    # Recommendation Settings
    DEFAULT_NUM_RECOMMENDATIONS: int = 10
    COLD_START_POPULAR_COUNT: int = 20
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:4200",
        "http://localhost:4201",
        "http://localhost:4202",
        "http://localhost:4203",
        "http://localhost:4205",
        "http://localhost:4300",
        "http://localhost:8080",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


