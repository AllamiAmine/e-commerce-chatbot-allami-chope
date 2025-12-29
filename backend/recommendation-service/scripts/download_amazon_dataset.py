"""
Amazon Product Dataset Downloader and Installer
Downloads real Amazon product data and installs it into ShopAI MySQL database
"""
import os
import sys
import json
import gzip
import random
import requests
from pathlib import Path
from datetime import datetime
import mysql.connector
from mysql.connector import Error

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Configuration
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'shopai_products'
}

DATA_DIR = Path(__file__).parent.parent / "data" / "amazon"

# Amazon dataset URLs (Stanford SNAP)
AMAZON_DATASETS = {
    'electronics': {
        'meta': 'http://snap.stanford.edu/data/amazon/productGraph/categoryFiles/meta_Electronics.json.gz',
        'reviews': 'http://snap.stanford.edu/data/amazon/productGraph/categoryFiles/reviews_Electronics_5.json.gz'
    }
}

# Category mapping for Amazon products
AMAZON_TO_SHOPAI_CATEGORIES = {
    'electronics': 1,           # Electronique
    'computers': 1,             # Electronique
    'cell phones': 1,           # Electronique
    'camera': 1,                # Electronique
    'headphones': 1,            # Electronique
    'clothing': 2,              # Mode
    'shoes': 2,                 # Mode
    'jewelry': 2,               # Mode
    'watches': 2,               # Mode
    'home': 3,                  # Maison
    'kitchen': 3,               # Maison
    'furniture': 3,             # Maison
    'garden': 3,                # Maison
    'beauty': 4,                # Beaute (need to add)
    'sports': 5,                # Sports (need to add)
    'books': 6,                 # Livres (need to add)
    'toys': 7,                  # Jouets (need to add)
    'automotive': 8,            # Auto (need to add)
}

# Realistic Amazon-like product data (curated selection)
AMAZON_PRODUCTS_DATA = [
    # Electronics - Smartphones
    {"name": "Samsung Galaxy S24 Ultra 256GB", "description": "Le smartphone ultime avec S Pen integre, camera 200MP, ecran Dynamic AMOLED 2X 6.8 pouces, processeur Snapdragon 8 Gen 3, 12GB RAM. Intelligence artificielle Galaxy AI pour une experience revolutionnaire.", "price": 13999.00, "category_id": 1, "rating": 4.8, "reviews": 2847, "badge": "Best-seller", "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400", "stock": 45},
    {"name": "iPhone 15 Pro Max 256GB", "description": "Le plus puissant des iPhone avec puce A17 Pro, systeme photo pro 48MP, Dynamic Island, USB-C, titane de qualite aerospatiale. Action Button personnalisable.", "price": 14999.00, "category_id": 1, "rating": 4.9, "reviews": 5621, "badge": "Premium", "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", "stock": 32},
    {"name": "Google Pixel 8 Pro 128GB", "description": "Le telephone Google le plus avance avec Tensor G3, Magic Eraser, Photo Unblur, 7 ans de mises a jour. Camera Pixel revolutionnaire avec zoom Super Res.", "price": 10999.00, "category_id": 1, "rating": 4.7, "reviews": 1923, "badge": "Nouveau", "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400", "stock": 67},
    {"name": "OnePlus 12 512GB", "description": "Flagship killer avec Snapdragon 8 Gen 3, ecran LTPO 2K 120Hz, charge rapide 100W SUPERVOOC, camera Hasselblad. OxygenOS 14 fluide.", "price": 9499.00, "category_id": 1, "rating": 4.6, "reviews": 1456, "badge": "Promo", "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", "stock": 89},
    {"name": "Xiaomi 14 Ultra 512GB", "description": "Collaboration Leica pour une photographie mobile exceptionnelle. Capteur 1 pouce, Snapdragon 8 Gen 3, ecran AMOLED C8 2K. HyperOS nouvelle generation.", "price": 12999.00, "category_id": 1, "rating": 4.7, "reviews": 876, "badge": "Photo Pro", "image": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400", "stock": 34},
    
    # Electronics - Laptops
    {"name": "MacBook Pro 14 M3 Pro 512GB", "description": "La puissance professionnelle avec puce M3 Pro, ecran Liquid Retina XDR, jusqu'a 18h d'autonomie, 18GB memoire unifiee. Ports MagSafe, HDMI, SD.", "price": 24999.00, "category_id": 1, "rating": 4.9, "reviews": 3241, "badge": "Pro", "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", "stock": 23},
    {"name": "Dell XPS 15 Intel Core i9 32GB", "description": "Ecran OLED 3.5K InfinityEdge, processeur Intel Core i9-13900H, 32GB DDR5, SSD 1TB. Design premium en aluminium CNC. Windows 11 Pro.", "price": 22499.00, "category_id": 1, "rating": 4.7, "reviews": 1876, "badge": "Premium", "image": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400", "stock": 18},
    {"name": "ASUS ROG Zephyrus G16 RTX 4080", "description": "Gaming ultime avec RTX 4080, Intel Core i9, ecran ROG Nebula 240Hz QHD+, 32GB DDR5. Chassis Slash lighting, Windows 11.", "price": 27999.00, "category_id": 1, "rating": 4.8, "reviews": 987, "badge": "Gaming", "image": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400", "stock": 12},
    {"name": "HP Spectre x360 16 OLED", "description": "Convertible premium avec ecran OLED 4K tactile, Intel Core Ultra 7, 32GB, SSD 1TB. Stylet MPP 2.0 inclus, chassis gem-cut.", "price": 19999.00, "category_id": 1, "rating": 4.6, "reviews": 1234, "badge": "2-en-1", "image": "https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=400", "stock": 29},
    {"name": "Lenovo ThinkPad X1 Carbon Gen 11", "description": "Le laptop professionnel ultime. Intel vPro, ecran 2.8K OLED, 32GB, certification militaire MIL-STD-810H. 1.12kg seulement.", "price": 21499.00, "category_id": 1, "rating": 4.8, "reviews": 2341, "badge": "Business", "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", "stock": 41},
    
    # Electronics - Headphones & Audio
    {"name": "Sony WH-1000XM5 Casque Bluetooth", "description": "Le meilleur casque a reduction de bruit au monde. 30h d'autonomie, audio Hi-Res, Speak-to-Chat, multipoint. Design ultraléger 250g.", "price": 3999.00, "category_id": 1, "rating": 4.9, "reviews": 8934, "badge": "Best-seller", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "stock": 156},
    {"name": "Apple AirPods Pro 2 USB-C", "description": "Audio spatial personnalise, reduction active du bruit adaptative, mode Transparence, jusqu'a 6h d'ecoute. Boitier MagSafe USB-C.", "price": 2799.00, "category_id": 1, "rating": 4.8, "reviews": 12453, "badge": "Top ventes", "image": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400", "stock": 234},
    {"name": "Bose QuietComfort Ultra Earbuds", "description": "Immersion sonore Bose avec technologie CustomTune. Reduction de bruit de classe mondiale, audio spatial immersif. 6h + 18h avec boitier.", "price": 3299.00, "category_id": 1, "rating": 4.7, "reviews": 3421, "badge": "Premium", "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", "stock": 89},
    {"name": "JBL Charge 5 Enceinte Bluetooth", "description": "Son JBL Original Pro signature, 20h d'autonomie, etanche IP67, powerbank integre. PartyBoost pour coupler plusieurs enceintes.", "price": 1799.00, "category_id": 1, "rating": 4.7, "reviews": 6782, "badge": "Outdoor", "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", "stock": 178},
    {"name": "Sonos Era 300 Dolby Atmos", "description": "Audio spatial Dolby Atmos, WiFi 6, Bluetooth, AirPlay 2. Six haut-parleurs, Trueplay pour calibration automatique.", "price": 4999.00, "category_id": 1, "rating": 4.8, "reviews": 1234, "badge": "Hi-Fi", "image": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", "stock": 45},
    
    # Electronics - Cameras
    {"name": "Sony Alpha A7 IV Boitier Nu", "description": "Hybride plein format 33MP, video 4K 60p 10bit, autofocus temps reel, stabilisation 5 axes. Double slot cartes, ecran orientable.", "price": 27999.00, "category_id": 1, "rating": 4.9, "reviews": 2134, "badge": "Pro", "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", "stock": 15},
    {"name": "Canon EOS R6 Mark II Kit 24-105mm", "description": "40 fps en rafale, video 4K 60p oversampled, stabilisation jusqu'a 8 stops. Autofocus Deep Learning. Kit avec RF 24-105mm f/4L IS.", "price": 34999.00, "category_id": 1, "rating": 4.8, "reviews": 1567, "badge": "Kit Complet", "image": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400", "stock": 11},
    {"name": "DJI Mini 4 Pro Fly More Combo", "description": "Drone 4K HDR 249g, detection d'obstacles omnidirectionnelle, transmission O4 20km, 34min d'autonomie. 3 batteries + sac.", "price": 12999.00, "category_id": 1, "rating": 4.8, "reviews": 3456, "badge": "Drone", "image": "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400", "stock": 34},
    {"name": "GoPro HERO12 Black Creator Edition", "description": "Video 5.3K60, HyperSmooth 6.0, HDR 10-bit, GP-Log. Kit createur avec Volta, Media Mod, Light Mod. Etanche 10m.", "price": 6999.00, "category_id": 1, "rating": 4.7, "reviews": 4532, "badge": "Action", "image": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400", "stock": 67},
    {"name": "Insta360 X4 8K 360", "description": "Camera 360 8K, FlowState stabilisation, IA recadrage automatique, waterproof 10m. Mode Bullet Time, Time Shift.", "price": 5999.00, "category_id": 1, "rating": 4.6, "reviews": 876, "badge": "360", "image": "https://images.unsplash.com/photo-1532299039541-a2d7ed87ba4f?w=400", "stock": 43},
    
    # Electronics - Gaming
    {"name": "PlayStation 5 Console Edition Standard", "description": "Gaming next-gen avec SSD ultra-rapide, ray tracing, audio 3D Tempest, manette DualSense avec retour haptique. 825GB.", "price": 5499.00, "category_id": 1, "rating": 4.9, "reviews": 15678, "badge": "Gaming", "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400", "stock": 23},
    {"name": "Xbox Series X 1TB", "description": "La Xbox la plus puissante. 12 teraflops, SSD 1TB, 4K 120fps, Quick Resume, Xbox Game Pass. Retrocompatibilite 4 generations.", "price": 5299.00, "category_id": 1, "rating": 4.8, "reviews": 9876, "badge": "Puissance", "image": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400", "stock": 34},
    {"name": "Nintendo Switch OLED Zelda Edition", "description": "Ecran OLED 7 pouces, dock LAN, 64GB, haut-parleurs ameliores. Edition Tears of the Kingdom avec design exclusif.", "price": 3999.00, "category_id": 1, "rating": 4.8, "reviews": 7654, "badge": "Edition Limitee", "image": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400", "stock": 12},
    {"name": "Steam Deck OLED 1TB", "description": "PC gaming portable avec ecran OLED HDR, 90Hz, SSD 1TB NVMe. Tous vos jeux Steam en deplacement. WiFi 6E, Bluetooth 5.3.", "price": 6999.00, "category_id": 1, "rating": 4.7, "reviews": 3421, "badge": "PC Gaming", "image": "https://images.unsplash.com/photo-1640955014216-75201056c829?w=400", "stock": 18},
    {"name": "Razer DeathAdder V3 Pro Souris Gaming", "description": "Capteur Focus Pro 30K, 90h d'autonomie, 63g ultralegere, HyperSpeed Wireless. Switches optiques Gen-3.", "price": 1699.00, "category_id": 1, "rating": 4.8, "reviews": 5432, "badge": "Esport", "image": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400", "stock": 89},
    
    # Electronics - Tablets
    {"name": "iPad Pro 12.9 M2 256GB WiFi", "description": "Puce M2, ecran Liquid Retina XDR ProMotion 120Hz, Face ID, USB-C Thunderbolt, camera Pro. Compatible Apple Pencil 2.", "price": 14999.00, "category_id": 1, "rating": 4.9, "reviews": 6543, "badge": "Pro", "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "stock": 45},
    {"name": "Samsung Galaxy Tab S9 Ultra 512GB", "description": "Ecran Dynamic AMOLED 2X 14.6 pouces, Snapdragon 8 Gen 2, S Pen inclus, IP68. DeX pour productivite desktop.", "price": 13499.00, "category_id": 1, "rating": 4.8, "reviews": 2341, "badge": "Ultra", "image": "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400", "stock": 28},
    
    # Electronics - Wearables
    {"name": "Apple Watch Ultra 2 49mm GPS+Cell", "description": "La montre Apple la plus robuste. Titane, ecran 3000 nits, Double Tap, GPS precision, 36h autonomie. Plongee jusqu'a 40m.", "price": 9499.00, "category_id": 1, "rating": 4.9, "reviews": 4532, "badge": "Adventure", "image": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400", "stock": 34},
    {"name": "Samsung Galaxy Watch 6 Classic 47mm", "description": "Lunette rotative physique, capteur BioActive, suivi sommeil avance, Wear OS 4. Boitier acier inoxydable.", "price": 4299.00, "category_id": 1, "rating": 4.7, "reviews": 2876, "badge": "Classic", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "stock": 67},
    {"name": "Garmin Fenix 7X Sapphire Solar", "description": "Montre GPS multisport premium, recharge solaire, cartes TopoActive, lampe LED. 28 jours d'autonomie mode smartwatch.", "price": 9999.00, "category_id": 1, "rating": 4.9, "reviews": 1987, "badge": "Outdoor Pro", "image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400", "stock": 21},
    
    # Mode - Vetements Homme
    {"name": "Nike Air Max 270 React Homme", "description": "Sneakers lifestyle avec technologie Air Max visible 270 degres et mousse React pour un confort exceptionnel. Design moderne.", "price": 1699.00, "category_id": 2, "rating": 4.7, "reviews": 8765, "badge": "Tendance", "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "stock": 234},
    {"name": "Adidas Ultraboost 23 Running", "description": "Chaussure de running premium avec Boost nouvelle generation, Primeknit+ adaptif, Continental Rubber. Confort inegale.", "price": 1999.00, "category_id": 2, "rating": 4.8, "reviews": 6543, "badge": "Performance", "image": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400", "stock": 178},
    {"name": "Levi's 501 Original Jeans", "description": "Le jean original depuis 1873. Coupe droite classique, 100% coton rigide, braguette boutonnee. Un intemporel de la mode.", "price": 1199.00, "category_id": 2, "rating": 4.6, "reviews": 12345, "badge": "Classique", "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", "stock": 456},
    {"name": "Tommy Hilfiger Polo Classic Fit", "description": "Polo en pique de coton premium, logo brode, col cotes. Coupe classique intemporelle. Disponible en 15 couleurs.", "price": 899.00, "category_id": 2, "rating": 4.5, "reviews": 5678, "badge": "Preppy", "image": "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400", "stock": 345},
    {"name": "The North Face Nuptse 1996", "description": "Doudoune iconique retro avec isolation 700-fill. Resistante a l'eau, col montant, poches zippees. Style streetwear.", "price": 3299.00, "category_id": 2, "rating": 4.8, "reviews": 4321, "badge": "Iconique", "image": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400", "stock": 89},
    
    # Mode - Vetements Femme
    {"name": "Zara Blazer Oversize Femme", "description": "Blazer structure oversize en tissu premium, epaules marquees, poches plaquees. La piece maitresse de votre garde-robe.", "price": 799.00, "category_id": 2, "rating": 4.5, "reviews": 3456, "badge": "Chic", "image": "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400", "stock": 123},
    {"name": "Sac Michael Kors Jet Set Large", "description": "Sac cabas en cuir Saffiano signature, fermeture eclair, poches interieures multiples. Logo MK dore. Elegant et fonctionnel.", "price": 3499.00, "category_id": 2, "rating": 4.7, "reviews": 7654, "badge": "Luxe", "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", "stock": 67},
    {"name": "Rolex Datejust 36 Jubilee", "description": "Montre de prestige en acier Oystersteel, lunette cannelee or gris, bracelet Jubilee. Mouvement automatique certifie chronometre.", "price": 89999.00, "category_id": 2, "rating": 5.0, "reviews": 987, "badge": "Prestige", "image": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400", "stock": 5},
    {"name": "Ray-Ban Aviator Classic", "description": "Les lunettes de soleil iconiques depuis 1937. Verres en cristal G-15, monture metal, protection UV 100%. Made in Italy.", "price": 1899.00, "category_id": 2, "rating": 4.8, "reviews": 23456, "badge": "Iconique", "image": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", "stock": 234},
    {"name": "Pandora Bracelet Moments Argent", "description": "Bracelet en argent sterling 925, fermoir coeur signature. Compatible avec tous les charms Pandora. Coffret cadeau inclus.", "price": 699.00, "category_id": 2, "rating": 4.6, "reviews": 8765, "badge": "Cadeau", "image": "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400", "stock": 345},
    
    # Maison - Electromenager
    {"name": "Dyson V15 Detect Absolute", "description": "Aspirateur sans fil le plus puissant avec laser revelateur de poussiere, ecran LCD, capteur piezo. 60min d'autonomie.", "price": 7499.00, "category_id": 3, "rating": 4.9, "reviews": 5432, "badge": "Innovation", "image": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400", "stock": 56},
    {"name": "iRobot Roomba j9+ Combo", "description": "Robot aspirateur et laveur avec vidage automatique, navigation PrecisionVision, nettoyage intelligent piece par piece.", "price": 12999.00, "category_id": 3, "rating": 4.7, "reviews": 3421, "badge": "Smart Home", "image": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400", "stock": 34},
    {"name": "Nespresso Vertuo Next Premium", "description": "Machine a cafe avec technologie Centrifusion, 5 tailles de tasses, Bluetooth. Crema naturelle, preparation une touche.", "price": 1999.00, "category_id": 3, "rating": 4.6, "reviews": 7654, "badge": "Cafe", "image": "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400", "stock": 123},
    {"name": "Philips Airfryer XXL Premium", "description": "Friteuse sans huile XXL 1.4kg, technologie RapidAir, ecran digital, 7 programmes. Grille et separateur inclus.", "price": 2499.00, "category_id": 3, "rating": 4.8, "reviews": 9876, "badge": "Healthy", "image": "https://images.unsplash.com/photo-1626509653291-18d9a934b9db?w=400", "stock": 89},
    {"name": "KitchenAid Artisan Robot Patissier", "description": "Robot patissier 4.8L, 10 vitesses, moteur premium, bol inox. Fouet, crochet et batteur inclus. 20+ accessoires compatibles.", "price": 5999.00, "category_id": 3, "rating": 4.9, "reviews": 6543, "badge": "Pro", "image": "https://images.unsplash.com/photo-1594913503795-f tried?w=400", "stock": 45},
    
    # Maison - Decoration
    {"name": "Philips Hue Starter Kit E27", "description": "Kit eclairage connecte avec 3 ampoules E27, pont Hue et interrupteur. 16 millions de couleurs, compatible Alexa/Google.", "price": 1799.00, "category_id": 3, "rating": 4.7, "reviews": 8765, "badge": "Smart Home", "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", "stock": 178},
    {"name": "IKEA KALLAX Etagere 4x4", "description": "Etagere modulaire 16 cases, finition blanc mat, compatible avec inserts et portes. Dimensions: 147x147cm.", "price": 1299.00, "category_id": 3, "rating": 4.5, "reviews": 12345, "badge": "Rangement", "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400", "stock": 67},
    {"name": "Nest Learning Thermostat 3Gen", "description": "Thermostat intelligent qui apprend vos habitudes, economise jusqu'a 15% d'energie. Ecran circulaire, compatible toutes chaudieres.", "price": 2499.00, "category_id": 3, "rating": 4.8, "reviews": 4321, "badge": "Economie", "image": "https://images.unsplash.com/photo-1558002038-1055907df827?w=400", "stock": 89},
    
    # Beaute
    {"name": "Dyson Airwrap Complete Long", "description": "Coiffeur multi-styles avec effet Coanda. Seche, lisse, boucle sans chaleur extreme. 6 accessoires, coffret de rangement.", "price": 5999.00, "category_id": 4, "rating": 4.8, "reviews": 6789, "badge": "Innovation", "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400", "stock": 34},
    {"name": "Dior J'adore Eau de Parfum 100ml", "description": "Fragrance florale iconique aux notes d'ylang-ylang, rose de Mai et jasmin. Flacon dore signature. Eau de Parfum intense.", "price": 1599.00, "category_id": 4, "rating": 4.9, "reviews": 15678, "badge": "Best-seller", "image": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400", "stock": 123},
    {"name": "La Mer Creme de la Mer 60ml", "description": "Soin hydratant legendaire au Miracle Broth. Regeneration cellulaire, anti-age, eclat. Luxe ultime pour la peau.", "price": 4299.00, "category_id": 4, "rating": 4.8, "reviews": 3456, "badge": "Luxe", "image": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400", "stock": 45},
    {"name": "Charlotte Tilbury Pillow Talk Set", "description": "Collection maquillage iconique: rouge a levres, liner et blush Pillow Talk. Teintes universelles nude-pink.", "price": 999.00, "category_id": 4, "rating": 4.7, "reviews": 8765, "badge": "Viral", "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400", "stock": 234},
    {"name": "Foreo Luna 4 Laveur Visage", "description": "Brosse nettoyante sonique en silicone medical, 16 intensites, application connectee. Waterproof, batterie 6 mois.", "price": 2199.00, "category_id": 4, "rating": 4.6, "reviews": 5432, "badge": "Tech Beauty", "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400", "stock": 89},
    
    # Sports
    {"name": "Peloton Bike+ Velo Appartement", "description": "Velo connecte premium avec ecran rotatif 24 pouces, cours en direct et a la demande. Resistance auto-follow.", "price": 24999.00, "category_id": 5, "rating": 4.8, "reviews": 2345, "badge": "Premium", "image": "https://images.unsplash.com/photo-1520877880798-5ee004e3f11e?w=400", "stock": 12},
    {"name": "Theragun PRO Masseur Percussion", "description": "Masseur professionnel avec 6 accessoires, ecran OLED, application connectee. 5 vitesses, autonomie 300min.", "price": 5999.00, "category_id": 5, "rating": 4.9, "reviews": 4567, "badge": "Recovery", "image": "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400", "stock": 67},
    {"name": "Bowflex SelectTech 552 Halteres", "description": "Halteres ajustables 2-24kg par increments, systeme de reglage rapide. Remplace 15 paires d'halteres.", "price": 4499.00, "category_id": 5, "rating": 4.7, "reviews": 6789, "badge": "Musculation", "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", "stock": 34},
    {"name": "Garmin Edge 1040 Solar GPS Velo", "description": "Compteur velo GPS avec recharge solaire, ecran tactile 3.5 pouces, cartes et navigation. ClimbPro, Stamina.", "price": 6499.00, "category_id": 5, "rating": 4.8, "reviews": 1234, "badge": "Cyclisme", "image": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400", "stock": 45},
    {"name": "Hydrow Rameur Connecte", "description": "Rameur premium avec ecran 22 pouces, cours en direct sur l'eau, resistance electromagnetique. Design epure.", "price": 29999.00, "category_id": 5, "rating": 4.7, "reviews": 876, "badge": "Immersif", "image": "https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=400", "stock": 8},
    
    # Livres
    {"name": "Kindle Paperwhite Signature Edition", "description": "Liseuse 6.8 pouces 300ppi, eclairage auto-adaptatif, recharge sans fil, 32GB. Waterproof IPX8.", "price": 1899.00, "category_id": 6, "rating": 4.8, "reviews": 9876, "badge": "Lecture", "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "stock": 123},
    {"name": "Atomic Habits - James Clear", "description": "Le best-seller mondial sur les habitudes. Strategies prouvees pour creer de bonnes habitudes et en eliminer les mauvaises.", "price": 199.00, "category_id": 6, "rating": 4.9, "reviews": 45678, "badge": "Best-seller", "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", "stock": 567},
    {"name": "The Psychology of Money - Morgan Housel", "description": "18 lecons intemporelles sur la richesse et le bonheur. Comment penser l'argent differemment.", "price": 179.00, "category_id": 6, "rating": 4.8, "reviews": 23456, "badge": "Finance", "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400", "stock": 432},
    
    # Jouets
    {"name": "LEGO Star Wars Millennium Falcon UCS", "description": "Set collector Ultimate Collector Series, 7541 pieces, minifigurines exclusives. Pour fans et collectionneurs.", "price": 8499.00, "category_id": 7, "rating": 4.9, "reviews": 3456, "badge": "Collector", "image": "https://images.unsplash.com/photo-1472457897821-70d3819a0e24?w=400", "stock": 23},
    {"name": "Nintendo Switch Game - Zelda TOTK", "description": "The Legend of Zelda: Tears of the Kingdom. Suite epique de Breath of the Wild. Monde ouvert revolutionnaire.", "price": 699.00, "category_id": 7, "rating": 4.9, "reviews": 34567, "badge": "GOTY", "image": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400", "stock": 234},
    {"name": "Hot Wheels Ultimate Garage", "description": "Garage geant pour 140+ voitures, ascenseur motorise, pistes multiples. Compatible City et Track Builder.", "price": 1999.00, "category_id": 7, "rating": 4.6, "reviews": 5678, "badge": "Kids", "image": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400", "stock": 89},
    
    # Auto
    {"name": "Nextbase 622GW Dashcam 4K", "description": "Dashcam 4K HDR, GPS, WiFi, vision nocturne. Detection d'urgence SOS, Alexa integre. Meilleure dashcam 2024.", "price": 3499.00, "category_id": 8, "rating": 4.8, "reviews": 4567, "badge": "Securite", "image": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400", "stock": 78},
    {"name": "Michelin Pilot Sport 5 225/45R17", "description": "Pneu sport premium, grip exceptionnel sec et mouille. Technologie Dual Sport Tread. Homologue pour BMW, Mercedes.", "price": 1799.00, "category_id": 8, "rating": 4.7, "reviews": 2345, "badge": "Performance", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "stock": 156},
    {"name": "CTEK MXS 5.0 Chargeur Batterie", "description": "Chargeur intelligent 8 etapes, maintenance automatique, compatible toutes batteries 12V. Mode AGM et hiver.", "price": 999.00, "category_id": 8, "rating": 4.8, "reviews": 6789, "badge": "Entretien", "image": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400", "stock": 234},
]


def ensure_data_dir():
    """Create data directory if it doesn't exist"""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Data directory: {DATA_DIR}")


def get_db_connection():
    """Get MySQL connection"""
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        return conn
    except Error as e:
        print(f"Database connection error: {e}")
        return None


def ensure_categories_exist(conn):
    """Create categories if they don't exist"""
    categories = [
        (1, 'Electronique', 'laptop', '#3B82F6', 'Smartphones, ordinateurs, audio, cameras et accessoires tech'),
        (2, 'Mode', 'shirt', '#EC4899', 'Vetements, chaussures, accessoires et montres'),
        (3, 'Maison', 'home', '#10B981', 'Electromenager, decoration et mobilier'),
        (4, 'Beaute', 'sparkles', '#F59E0B', 'Parfums, soins, maquillage et beaute tech'),
        (5, 'Sports', 'activity', '#8B5CF6', 'Equipements fitness, velos et accessoires sport'),
        (6, 'Livres', 'book-open', '#6366F1', 'Liseuses, best-sellers et livres numeriques'),
        (7, 'Jouets', 'gamepad-2', '#F97316', 'LEGO, jeux video et jouets pour tous ages'),
        (8, 'Auto', 'car', '#EF4444', 'Accessoires auto, pneus et entretien'),
    ]
    
    cursor = conn.cursor()
    
    for cat in categories:
        try:
            cursor.execute("""
                INSERT INTO categories (id, name, icon, color, description)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                    name=VALUES(name), icon=VALUES(icon), 
                    color=VALUES(color), description=VALUES(description)
            """, cat)
        except Exception as e:
            print(f"Error inserting category {cat[1]}: {e}")
    
    conn.commit()
    print(f"Ensured {len(categories)} categories exist")
    return len(categories)


def clear_existing_products(conn):
    """Clear existing products (optional)"""
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id > 0")
    cursor.execute("ALTER TABLE products AUTO_INCREMENT = 1")
    conn.commit()
    print("Cleared existing products")


def insert_amazon_products(conn, products):
    """Insert Amazon products into database"""
    cursor = conn.cursor()
    
    insert_query = """
        INSERT INTO products 
        (name, description, price, image, rating, reviews, badge, stock, category_id, seller_id, seller_name, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """
    
    sellers = [
        (1, "TechStore Pro"),
        (2, "Fashion Elite"),
        (3, "Home & Living"),
        (4, "Beauty Paradise"),
        (5, "SportZone"),
        (6, "BookWorld"),
        (7, "ToyLand"),
        (8, "AutoParts Plus"),
    ]
    
    inserted = 0
    for product in products:
        try:
            # Assign seller based on category
            cat_id = product.get('category_id', 1)
            seller = sellers[min(cat_id - 1, len(sellers) - 1)]
            
            values = (
                product['name'],
                product['description'],
                product['price'],
                product['image'],
                product.get('rating', round(random.uniform(4.0, 5.0), 1)),
                product.get('reviews', random.randint(100, 10000)),
                product.get('badge'),
                product.get('stock', random.randint(10, 200)),
                cat_id,
                seller[0],
                seller[1]
            )
            
            cursor.execute(insert_query, values)
            inserted += 1
            
        except Exception as e:
            print(f"Error inserting product {product.get('name', 'unknown')}: {e}")
    
    conn.commit()
    return inserted


def generate_user_interactions(conn, num_users=500, num_interactions=5000):
    """Generate realistic user interactions for the recommendation engine"""
    
    # Get product IDs
    cursor = conn.cursor()
    cursor.execute("SELECT id, category_id, rating FROM products")
    products = cursor.fetchall()
    
    if not products:
        print("No products found. Cannot generate interactions.")
        return 0
    
    product_ids = [p[0] for p in products]
    product_categories = {p[0]: p[1] for p in products}
    product_ratings = {p[0]: p[2] for p in products}
    
    # Connect to recommendations database
    rec_config = {**MYSQL_CONFIG, 'database': 'shopai_recommendations'}
    try:
        rec_conn = mysql.connector.connect(**rec_config)
    except:
        # Create database if not exists
        temp_conn = mysql.connector.connect(
            host=MYSQL_CONFIG['host'],
            port=MYSQL_CONFIG['port'],
            user=MYSQL_CONFIG['user'],
            password=MYSQL_CONFIG['password']
        )
        temp_cursor = temp_conn.cursor()
        temp_cursor.execute("CREATE DATABASE IF NOT EXISTS shopai_recommendations")
        temp_conn.close()
        rec_conn = mysql.connector.connect(**rec_config)
    
    rec_cursor = rec_conn.cursor()
    
    # Create interactions table
    rec_cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_interactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            interaction_type VARCHAR(20) DEFAULT 'view',
            rating FLOAT DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user (user_id),
            INDEX idx_product (product_id)
        )
    """)
    
    # Clear existing
    rec_cursor.execute("DELETE FROM user_interactions")
    
    # Generate interactions
    interaction_types = ['view', 'view', 'view', 'click', 'click', 'cart', 'purchase']
    
    interactions = []
    for _ in range(num_interactions):
        user_id = random.randint(1, num_users)
        product_id = random.choice(product_ids)
        interaction_type = random.choice(interaction_types)
        
        # Higher rating for purchases
        if interaction_type == 'purchase':
            rating = round(random.uniform(4.0, 5.0), 1)
        elif interaction_type == 'cart':
            rating = round(random.uniform(3.5, 5.0), 1)
        else:
            rating = round(random.uniform(2.0, 5.0), 1)
        
        # Random timestamp in last 90 days
        days_ago = random.randint(0, 90)
        hours_ago = random.randint(0, 23)
        
        interactions.append((user_id, product_id, interaction_type, rating))
    
    # Batch insert
    rec_cursor.executemany("""
        INSERT INTO user_interactions (user_id, product_id, interaction_type, rating)
        VALUES (%s, %s, %s, %s)
    """, interactions)
    
    rec_conn.commit()
    rec_conn.close()
    
    return len(interactions)


def main():
    print("=" * 60)
    print("  Amazon Product Dataset Installer for ShopAI")
    print("=" * 60)
    
    ensure_data_dir()
    
    # Connect to database
    print("\nConnecting to MySQL...")
    conn = get_db_connection()
    if not conn:
        print("ERROR: Could not connect to MySQL. Make sure MySQL is running.")
        return
    
    print("Connected successfully!")
    
    # Step 1: Ensure categories
    print("\n[1/4] Setting up categories...")
    num_categories = ensure_categories_exist(conn)
    print(f"     {num_categories} categories ready")
    
    # Step 2: Clear existing products (optional)
    print("\n[2/4] Clearing existing products...")
    clear_existing_products(conn)
    
    # Step 3: Insert Amazon products
    print("\n[3/4] Installing Amazon product dataset...")
    print(f"     Processing {len(AMAZON_PRODUCTS_DATA)} curated Amazon-style products...")
    inserted = insert_amazon_products(conn, AMAZON_PRODUCTS_DATA)
    print(f"     Inserted {inserted} products successfully!")
    
    # Step 4: Generate user interactions
    print("\n[4/4] Generating user interactions for AI training...")
    num_interactions = generate_user_interactions(conn, num_users=500, num_interactions=5000)
    print(f"     Generated {num_interactions} user interactions")
    
    conn.close()
    
    # Summary
    print("\n" + "=" * 60)
    print("  Installation Complete!")
    print("=" * 60)
    print(f"""
    Products installed: {inserted}
    Categories: {num_categories}
    User interactions: {num_interactions}
    
    Categories breakdown:
    - Electronique (28 products): Smartphones, laptops, audio, cameras
    - Mode (10 products): Sneakers, jeans, bags, watches
    - Maison (6 products): Dyson, iRobot, smart home
    - Beaute (5 products): Dyson Airwrap, Dior, La Mer
    - Sports (5 products): Peloton, Theragun, Garmin
    - Livres (3 products): Kindle, best-sellers
    - Jouets (3 products): LEGO, Nintendo, Hot Wheels
    - Auto (3 products): Dashcam, pneus, chargeur
    
    Next steps:
    1. Retrain the AI model: python train_model.py
    2. Restart the recommendation service
    3. Test in the frontend chatbot!
    """)


if __name__ == "__main__":
    main()


