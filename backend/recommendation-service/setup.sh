#!/bin/bash
# ShopAI Recommendation Service - Linux/Mac Setup Script
# Run this script to set up and train the recommendation model

echo "============================================"
echo "  ShopAI AI Recommendation Service Setup"
echo "============================================"
echo

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.10+ first"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "Found Python $PYTHON_VERSION"

# Create virtual environment
echo "[1/5] Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
echo "[2/5] Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "[3/5] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
echo "[4/5] Creating directories..."
mkdir -p models data/amazon logs

# Train the model
echo "[5/5] Training the AI model..."
echo
echo "Choose training option:"
echo "  1. Amazon dataset (recommended, ~5 min download + training)"
echo "  2. Synthetic data (faster, for testing)"
echo "  3. Skip training (configure manually later)"
echo
read -p "Enter your choice (1/2/3): " choice

case $choice in
    1)
        echo
        echo "Training with Amazon dataset..."
        python train.py --evaluate
        ;;
    2)
        echo
        echo "Training with synthetic data..."
        python train.py --synthetic --evaluate
        ;;
    *)
        echo
        echo "Skipping training. Run 'python train.py' manually later."
        ;;
esac

echo
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo
echo "To start the service:"
echo "  1. Activate venv: source venv/bin/activate"
echo "  2. Run: python -m uvicorn app.main:app --reload --port 8085"
echo
echo "API will be available at: http://localhost:8085"
echo "API docs at: http://localhost:8085/docs"
echo


