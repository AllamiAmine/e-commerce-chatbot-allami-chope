#!/bin/bash

echo "============================================"
echo "   ShopAI Backend - Starting Microservices"
echo "============================================"
echo ""

echo "[1/6] Building project..."
mvn clean install -DskipTests

echo ""
echo "[2/6] Starting User Service (port 8081)..."
cd user-service && mvn spring-boot:run &
sleep 10

echo "[3/6] Starting Product Service (port 8082)..."
cd ../product-service && mvn spring-boot:run &
sleep 5

echo "[4/6] Starting Order Service (port 8083)..."
cd ../order-service && mvn spring-boot:run &
sleep 5

echo "[5/6] Starting ChatBot Service (port 8084)..."
cd ../chatbot-service && mvn spring-boot:run &
sleep 5

echo "[6/6] Starting API Gateway (port 8080)..."
cd ../api-gateway && mvn spring-boot:run &

echo ""
echo "============================================"
echo "   All services are starting..."
echo "============================================"
echo ""
echo "Services:"
echo " - API Gateway:     http://localhost:8080"
echo " - User Service:    http://localhost:8081"
echo " - Product Service: http://localhost:8082"
echo " - Order Service:   http://localhost:8083"
echo " - ChatBot Service: http://localhost:8084"
echo ""
echo "Test users:"
echo " - admin@shopai.com / admin123"
echo " - seller@shopai.com / seller123"
echo " - client@shopai.com / client123"
echo ""

wait

