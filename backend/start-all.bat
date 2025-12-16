@echo off
echo ============================================
echo    ShopAI Backend - Starting Microservices
echo ============================================
echo.

echo [1/6] Building project...
call mvn clean install -DskipTests
if %ERRORLEVEL% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo [2/6] Starting User Service (port 8081)...
start "User Service" cmd /c "cd user-service && mvn spring-boot:run"

timeout /t 10 /nobreak > nul

echo [3/6] Starting Product Service (port 8082)...
start "Product Service" cmd /c "cd product-service && mvn spring-boot:run"

timeout /t 5 /nobreak > nul

echo [4/6] Starting Order Service (port 8083)...
start "Order Service" cmd /c "cd order-service && mvn spring-boot:run"

timeout /t 5 /nobreak > nul

echo [5/6] Starting ChatBot Service (port 8084)...
start "ChatBot Service" cmd /c "cd chatbot-service && mvn spring-boot:run"

timeout /t 5 /nobreak > nul

echo [6/6] Starting API Gateway (port 8080)...
start "API Gateway" cmd /c "cd api-gateway && mvn spring-boot:run"

echo.
echo ============================================
echo    All services are starting...
echo ============================================
echo.
echo Services:
echo  - API Gateway:     http://localhost:8080
echo  - User Service:    http://localhost:8081
echo  - Product Service: http://localhost:8082
echo  - Order Service:   http://localhost:8083
echo  - ChatBot Service: http://localhost:8084
echo.
echo Test users:
echo  - admin@shopai.com / admin123
echo  - seller@shopai.com / seller123
echo  - client@shopai.com / client123
echo.
pause

