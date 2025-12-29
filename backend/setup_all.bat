@echo off
echo ========================================
echo ShopAI Complete Setup Script
echo ========================================
echo.

:: Check if MySQL is running
echo [1/5] Checking MySQL...
mysql -u root -e "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not running or not accessible!
    echo Please start MySQL and try again.
    pause
    exit /b 1
)
echo MySQL is running.
echo.

:: Create databases
echo [2/5] Creating databases...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS shopai_users;"
mysql -u root -e "CREATE DATABASE IF NOT EXISTS shopai_products;"
mysql -u root -e "CREATE DATABASE IF NOT EXISTS shopai_orders;"
mysql -u root -e "CREATE DATABASE IF NOT EXISTS shopai_recommendations;"
echo Databases created.
echo.

:: Initialize products database with data
echo [3/5] Loading product data...
cd product-service\src\main\resources
if exist data.sql (
    mysql -u root shopai_products < data.sql
    echo Product data loaded.
) else (
    echo data.sql not found, products will be loaded by Spring Boot.
)
cd ..\..\..\..
echo.

:: Setup Python environment for recommendation service
echo [4/5] Setting up Recommendation Service...
cd recommendation-service

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment and installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet

:: Initialize recommendation database and train model
echo Initializing database and training model...
python setup_and_train.py

cd ..
echo.

:: Summary
echo [5/5] Setup Complete!
echo ========================================
echo.
echo To start the services:
echo.
echo 1. Start backend services (user-service, product-service, order-service):
echo    Open each in IntelliJ/VSCode and run, or use:
echo    cd user-service ^&^& mvn spring-boot:run
echo.
echo 2. Start recommendation service:
echo    cd recommendation-service
echo    venv\Scripts\activate
echo    python -m uvicorn app.main:app --host 0.0.0.0 --port 8085
echo.
echo 3. Start frontend:
echo    cd ..\frontend
echo    npm start
echo.
echo Then open http://localhost:4200 and use the chatbot!
echo ========================================
pause


