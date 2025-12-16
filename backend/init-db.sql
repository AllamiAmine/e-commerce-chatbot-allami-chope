-- ============================================
-- ShopAI Database Initialization Script
-- Run this script in MySQL to create databases
-- ============================================

-- Create databases for each microservice
CREATE DATABASE IF NOT EXISTS shopai_users CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS shopai_products CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS shopai_orders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Show created databases
SHOW DATABASES LIKE 'shopai%';

-- ============================================
-- Note: Tables will be created automatically 
-- by Spring JPA Hibernate (ddl-auto: update)
-- ============================================
