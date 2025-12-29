-- =====================================================
-- ShopAI Product Database - Initial Data
-- =====================================================

-- Clear existing data (optional - comment out in production)
-- DELETE FROM products;
-- DELETE FROM categories;

-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO categories (id, name, icon, color, description) VALUES
(1, 'Électronique', '📱', '#3B82F6', 'Smartphones, tablettes, gadgets et accessoires électroniques'),
(2, 'Accessoires', '🎧', '#8B5CF6', 'Câbles, chargeurs, coques et accessoires tech'),
(3, 'Maison Connectée', '🏠', '#10B981', 'Domotique, objets connectés pour la maison'),
(4, 'Mode & Style', '👜', '#F59E0B', 'Montres, sacs, lunettes et accessoires de mode'),
(5, 'Sports & Fitness', '⚽', '#EF4444', 'Équipements sportifs et accessoires fitness'),
(6, 'Gaming', '🎮', '#6366F1', 'Consoles, jeux et accessoires gaming'),
(7, 'Photo & Vidéo', '📸', '#EC4899', 'Caméras, drones et équipement photo/vidéo'),
(8, 'Audio', '🔊', '#14B8A6', 'Écouteurs, casques et enceintes')
ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon), color=VALUES(color);

-- =====================================================
-- PRODUCTS - Électronique (category_id = 1)
-- =====================================================
INSERT INTO products (id, name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name) VALUES
(1, 'iPhone 17 Pro Max 1 To', 'Le dernier iPhone avec puce A17 Pro, écran Super Retina XDR 6.7", titane naturel, USB-C, autonomie exceptionnelle', 13999.90, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', 4.9, 87, 'Nouveau', 50, 1, 1, 'Apple Store'),
(2, 'iPhone 17 Pro Max Titanium', 'Édition limitée titane noir, 1 To stockage, Triple caméra 48MP, Vision Pro ready', 14999.90, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500', 5.0, 42, 'Premium', 25, 1, 1, 'Apple Store'),
(3, 'Samsung Galaxy Z Fold 6', 'Smartphone pliable révolutionnaire, écran 7.6" AMOLED, S Pen inclus, 512 Go', 12999.90, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500', 4.7, 65, 'Nouveau', 40, 1, 2, 'Samsung Shop'),
(4, 'Xiaomi 14 Pro', 'Snapdragon 8 Gen 3, caméra Leica 50MP, charge 120W, écran LTPO 2K', 9999.90, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500', 4.6, 58, 'Nouveau', 80, 1, 3, 'Xiaomi Store'),
(5, 'Huawei Pura 70 Ultra', 'Design premium, caméra rétractable, Kirin 9010, 1 To stockage', 11999.90, 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=500', 4.5, 39, 'Flash', 35, 1, 4, 'Huawei Shop'),
(6, 'MacBook Air 13" M4', 'Puce Apple M4, 16 Go RAM, 512 Go SSD, écran Liquid Retina, autonomie 18h', 10999.90, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', 4.8, 73, 'Populaire', 60, 1, 1, 'Apple Store'),
(7, 'MacBook Pro 16" M3 Max', 'Puce M3 Max, 36 Go RAM, 1 To SSD, écran Liquid Retina XDR, pour professionnels', 34999.00, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', 4.9, 45, 'Best Seller', 30, 1, 1, 'Apple Store'),
(8, 'Lenovo ThinkPad X1 Carbon Gen 13', 'Intel Core Ultra 9, 32 Go RAM, 1 To SSD, écran OLED 2.8K, ultraléger', 17999.00, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500', 4.7, 44, 'Best seller', 45, 1, 5, 'Lenovo Pro'),
(9, 'Dell Alienware m16 R3', 'RTX 4090, Intel i9-14900HX, 64 Go RAM, écran 240Hz, gaming ultime', 23999.90, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500', 4.6, 29, 'Flash', 20, 1, 6, 'Dell Gaming'),
(10, 'iPad Pro 13" M4', 'Puce M4, écran Ultra Retina XDR, 1 To, Wi-Fi + Cellular, Apple Pencil Pro', 15999.90, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', 4.8, 52, 'Nouveau', 55, 1, 1, 'Apple Store'),
(11, 'Huawei MatePad Pro 13.2"', 'Écran OLED 13.2", Kirin 9000s, M-Pencil 3, productivité mobile', 7999.90, 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500', 4.5, 54, 'En promotion', 70, 1, 4, 'Huawei Shop')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- =====================================================
-- PRODUCTS - Audio (category_id = 8)
-- =====================================================
INSERT INTO products (id, name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name) VALUES
(12, 'Écouteurs Bluetooth Premium', 'Réduction de bruit active, autonomie 30h, son Hi-Res, étui de charge sans fil', 1499.90, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', 4.5, 328, 'Populaire', 150, 8, 7, 'Audio Plus'),
(13, 'AirPods Pro 3', 'ANC avancé, audio spatial, puce H2, étui MagSafe, résistant à l''eau', 2499.99, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500', 4.7, 320, 'En promotion', 100, 8, 1, 'Apple Store'),
(14, 'Sony WH-1000XM6', 'Meilleure réduction de bruit au monde, 40h autonomie, LDAC, multipoint', 4999.90, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 4.9, 412, 'Top', 85, 8, 8, 'Sony Audio'),
(15, 'Casque Audio Confort Pro', 'Son studio, coussinets mémoire de forme, pliable, câble détachable', 1699.90, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 4.3, 190, NULL, 120, 8, 7, 'Audio Plus'),
(16, 'Enceinte Portable Bluetooth', 'Son 360°, étanche IP67, 24h autonomie, basses profondes', 899.90, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 4.4, 310, 'Populaire', 200, 8, 9, 'JBL Store'),
(17, 'Enceinte Connectée Smart Home', 'Assistant vocal IA, son multiroom, contrôle domotique, écran tactile', 1299.90, 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500', 4.2, 112, NULL, 90, 8, 10, 'Google Shop')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- =====================================================
-- PRODUCTS - Accessoires (category_id = 2)
-- =====================================================
INSERT INTO products (id, name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name) VALUES
(18, 'Batterie Externe 100W', 'Capacité 20000mAh, charge rapide 100W, 3 ports USB-C, affichage LED', 799.90, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', 4.3, 189, 'En promotion', 180, 2, 11, 'Power Tech'),
(19, 'Câble USB-C Premium', 'Câble tressé 2m, 240W, transfert 40Gbps, certifié USB4', 299.90, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', 4.2, 156, NULL, 500, 2, 11, 'Power Tech'),
(20, 'Support Téléphone Ajustable', 'Aluminium premium, rotation 360°, compatible bureau et lit', 199.90, 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=500', 4.1, 92, NULL, 250, 2, 12, 'Tech Accessories'),
(21, 'Coque Protectrice Renforcée', 'MagSafe, protection militaire, transparente, anti-jaunissement', 149.90, 'https://images.unsplash.com/photo-1601593346740-925612772716?w=500', 4.3, 135, NULL, 300, 2, 12, 'Tech Accessories'),
(22, 'Protection Écran Verre Trempé', 'Pack de 3, dureté 9H, anti-traces, installation facile', 99.90, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 4.4, 260, 'Best price', 400, 2, 12, 'Tech Accessories'),
(23, 'Station de Charge 3-en-1', 'iPhone + Apple Watch + AirPods, MagSafe 15W, design élégant', 799.90, 'https://images.unsplash.com/photo-1618577066126-c6e4fedf53d5?w=500', 4.5, 90, 'Best price', 75, 2, 11, 'Power Tech'),
(24, 'Pack Accessoires Premium iPhone', 'Coque + verre + câble + chargeur 20W, tout-en-un', 999.90, 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=500', 4.4, 150, 'En promotion', 60, 2, 12, 'Tech Accessories')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- =====================================================
-- PRODUCTS - Maison Connectée (category_id = 3)
-- =====================================================
INSERT INTO products (id, name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name) VALUES
(25, 'Lampe LED Intelligente', 'WiFi + Bluetooth, 16M couleurs, compatible Alexa/Google, programmable', 499.90, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', 4.3, 234, 'Nouveau', 150, 3, 13, 'Smart Home Pro'),
(26, 'Thermostat Connecté', 'Économie énergie 30%, apprentissage IA, écran tactile, géolocalisation', 1999.90, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500', 4.6, 421, NULL, 80, 3, 14, 'Nest Store'),
(27, 'Serrure Intelligente Sécurisée', 'Code + empreinte + app, historique accès, batterie 1 an', 1599.90, 'https://images.unsplash.com/photo-1558002038-bb4237bb5a7f?w=500', 4.4, 140, NULL, 65, 3, 13, 'Smart Home Pro'),
(28, 'Détecteur de Fumée Connecté', 'Alertes smartphone, test auto, interconnexion, batterie 10 ans', 399.90, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 4.5, 120, NULL, 200, 3, 14, 'Nest Store'),
(29, 'Kit Smart Home Sécurité', 'Caméra + détecteurs + sirène + hub, surveillance 24/7', 2599.90, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', 4.5, 77, 'Pack', 45, 3, 13, 'Smart Home Pro'),
(30, 'Caméra Surveillance WiFi', '4K Ultra HD, vision nocturne couleur, détection IA, stockage cloud', 1299.90, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', 4.4, 185, NULL, 95, 3, 15, 'Security Plus')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- =====================================================
-- PRODUCTS - Mode & Style (category_id = 4)
-- =====================================================
INSERT INTO products (id, name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name) VALUES
(31, 'Montre Intelligente Ultra', 'GPS, ECG, SpO2, 14 jours autonomie, étanche 100m, titane', 2999.90, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 4.6, 245, 'Nouveau', 100, 4, 1, 'Apple Store'),
(32, 'Montre de Luxe Classique', 'Mouvement automatique suisse, verre saphir, bracelet cuir', 2499.90, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500', 4.8, 567, 'Populaire', 40, 4, 16, 'Watch Gallery'),
(33, 'Sac à Dos Urbain', 'Anti-vol, compartiment laptop 17", USB intégré, imperméable', 899.90, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 4.5, 289, NULL, 120, 4, 17, 'Urban Style'),
(34, 'Ceinture Cuir Élégante', 'Cuir italien véritable, boucle acier brossé, réversible', 349.90, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500', 4.4, 98, NULL, 180, 4, 17, 'Urban Style'),
(35, 'Lunettes de Soleil Premium', 'Verres polarisés, protection UV400, monture légère titane', 1299.90, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 4.5, 201, NULL, 90, 4, 18, 'Vision Pro'),
(36, 'Portefeuille RFID Sécurisé', 'Cuir premium, protection RFID, 12 emplacements cartes', 249.90, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', 4.3, 175, NULL, 220, 4, 17, 'Urban Style')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- =====================================================
-- PRODUCTS - Sports & Fitness (category_id = 5)
-- =====================================================
INSERT INTO products (id, name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name) VALUES
(37, 'Ballon de Football Pro', 'FIFA Quality Pro, coutures thermosoudées, aéro sculpture', 399.90, 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=500', 4.5, 180, NULL, 150, 5, 19, 'Sport Elite'),
(38, 'Raquette de Tennis Graphite', 'Cadre graphite, cordage 16x19, équilibrée, avec housse', 699.90, 'https://images.unsplash.com/photo-1617083934555-ac7f3da27e6c?w=500', 4.4, 145, 'Nouveau', 80, 5, 19, 'Sport Elite'),
(39, 'Gants de Boxe Entraînement', 'Cuir synthétique premium, 12oz, rembourrage gel, velcro', 499.90, 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=500', 4.3, 110, NULL, 100, 5, 20, 'Fight Gear'),
(40, 'Tapis de Yoga Premium', 'Éco-responsable, antidérapant, 6mm épaisseur, avec sangle', 349.90, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 4.6, 230, 'Populaire', 200, 5, 21, 'Yoga Life'),
(41, 'Haltères Ajustables 24kg', 'Set complet 2-24kg, changement rapide, compact', 1999.90, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', 4.7, 95, NULL, 50, 5, 22, 'Home Gym'),
(42, 'Montre Sport GPS', 'GPS multi-GNSS, cardio optique, 100+ sports, autonomie 2 semaines', 2499.90, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500', 4.6, 178, 'Best seller', 75, 5, 23, 'Garmin Store')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- =====================================================
-- PRODUCTS - Gaming (category_id = 6)
-- =====================================================
INSERT INTO products (id, name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name) VALUES
(43, 'PlayStation 5 Slim', 'Console nouvelle génération, SSD 1To, DualSense, 4K 120fps', 7499.90, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500', 4.8, 260, 'Populaire', 40, 6, 8, 'Sony Audio'),
(44, 'Xbox Series X', 'Puissance 12 téraflops, SSD 1To, rétrocompatibilité, Game Pass', 6999.90, 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500', 4.7, 195, NULL, 55, 6, 24, 'Xbox Store'),
(45, 'Nintendo Switch OLED', 'Écran OLED 7", 64Go, dock inclus, Joy-Con améliorés', 4499.90, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500', 4.6, 340, 'Populaire', 70, 6, 25, 'Nintendo Shop'),
(46, 'Manette Pro Gaming', 'Sans fil, paddles programmables, trigger locks, RGB', 1299.90, 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500', 4.5, 210, NULL, 120, 6, 26, 'Pro Gaming'),
(47, 'Casque Gaming 7.1', 'Son surround 7.1, micro rétractable, RGB, confort longue durée', 899.90, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', 4.4, 285, NULL, 150, 6, 26, 'Pro Gaming'),
(48, 'Clavier Mécanique RGB', 'Switches optiques, macro, anti-ghosting, repose-poignet', 1499.90, 'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=500', 4.5, 175, NULL, 85, 6, 26, 'Pro Gaming')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- =====================================================
-- PRODUCTS - Photo & Vidéo (category_id = 7)
-- =====================================================
INSERT INTO products (id, name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name) VALUES
(49, 'Caméra Numérique 4K', 'Capteur 24MP, vidéo 4K 60fps, stabilisation 5 axes, écran tactile', 5999.90, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500', 4.7, 512, NULL, 60, 7, 27, 'Photo Pro'),
(50, 'Drone 4K Professionnel', 'Capteur 1", vidéo 5.4K, autonomie 46min, évitement obstacles 360°', 7499.90, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500', 4.8, 210, 'Premium', 35, 7, 28, 'DJI Store'),
(51, 'Sony Bravia XR A95L 55" QD-OLED', 'QD-OLED 4K, processeur XR, HDMI 2.1, Dolby Vision IQ', 20999.90, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500', 4.9, 31, 'Premium', 20, 7, 8, 'Sony Audio'),
(52, 'GoPro Hero 12 Black', 'Capteur 27MP, vidéo 5.3K, HyperSmooth 6.0, étanche 10m', 3999.90, 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=500', 4.6, 290, NULL, 90, 7, 29, 'Action Cam'),
(53, 'Objectif 50mm f/1.4', 'Portrait pro, bokeh crémeux, autofocus rapide, construction métal', 4499.90, 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=500', 4.7, 145, NULL, 45, 7, 27, 'Photo Pro'),
(54, 'Trépied Carbone Pro', 'Charge 15kg, hauteur 180cm, rotule fluide, sac transport', 1299.90, 'https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?w=500', 4.5, 88, NULL, 70, 7, 27, 'Photo Pro')
ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price);

-- =====================================================
-- Update sequences
-- =====================================================
-- Auto-increment will continue from the highest ID

SELECT 'Dataset loaded successfully! Total products:' as Message, COUNT(*) as Count FROM products;
SELECT 'Categories:' as Message, COUNT(*) as Count FROM categories;


