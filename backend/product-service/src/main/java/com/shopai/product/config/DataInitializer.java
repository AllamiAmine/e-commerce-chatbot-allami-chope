package com.shopai.product.config;

import com.shopai.product.entity.Category;
import com.shopai.product.entity.Product;
import com.shopai.product.repository.CategoryRepository;
import com.shopai.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            initializeCategories();
        }
        if (productRepository.count() == 0) {
            initializeProducts();
        }
        log.info("✅ Product data initialized! {} categories, {} products", 
                categoryRepository.count(), productRepository.count());
    }

    private void initializeCategories() {
        List<Category> categories = List.of(
                Category.builder().name("Électronique").icon("📱").color("from-blue-500 to-blue-600").build(),
                Category.builder().name("Accessoires").icon("🎧").color("from-purple-500 to-purple-600").build(),
                Category.builder().name("Maison").icon("🏠").color("from-green-500 to-green-600").build(),
                Category.builder().name("Mode").icon("👕").color("from-pink-500 to-pink-600").build(),
                Category.builder().name("Sports").icon("⚽").color("from-orange-500 to-orange-600").build(),
                Category.builder().name("Beauté").icon("💄").color("from-red-500 to-red-600").build()
        );
        categoryRepository.saveAll(Objects.requireNonNull(categories, "La liste des catégories ne doit pas être nulle"));
    }

    private void initializeProducts() {
        Category electronics = categoryRepository.findByName("Électronique").orElse(null);
        Category accessories = categoryRepository.findByName("Accessoires").orElse(null);
        Category home = categoryRepository.findByName("Maison").orElse(null);
        Category fashion = categoryRepository.findByName("Mode").orElse(null);
        Category sports = categoryRepository.findByName("Sports").orElse(null);
        Category beauty = categoryRepository.findByName("Beauté").orElse(null);

        List<Product> products = List.of(
                Product.builder()
                        .name("Écouteurs Bluetooth Premium")
                        .description("Écouteurs sans fil avec réduction de bruit active et autonomie de 30h.")
                        .price(BigDecimal.valueOf(1499.90))
                        .image("assets/wireless-headphones.jpg")
                        .rating(4.8).reviews(328).badge("Populaire").stock(50)
                        .category(electronics).build(),
                Product.builder()
                        .name("Montre Intelligente Ultra")
                        .description("Smartwatch avec GPS, moniteur cardiaque et écran AMOLED.")
                        .price(BigDecimal.valueOf(2999.90))
                        .image("assets/modern-smartwatch.png")
                        .rating(4.6).reviews(245).badge("Nouveau").stock(30)
                        .category(electronics).build(),
                Product.builder()
                        .name("Caméra Numérique 4K")
                        .description("Caméra professionnelle 4K avec stabilisation optique.")
                        .price(BigDecimal.valueOf(5999.90))
                        .image("assets/4k-camera.jpg")
                        .rating(4.9).reviews(512).stock(20)
                        .category(electronics).build(),
                Product.builder()
                        .name("Drone 4K avec Caméra")
                        .description("Drone professionnel avec caméra 4K et 30min d'autonomie.")
                        .price(BigDecimal.valueOf(8999.90))
                        .image("assets/4k-drone.jpg")
                        .rating(4.8).reviews(198).stock(15)
                        .category(electronics).build(),
                
                Product.builder()
                        .name("Batterie Externe 100W")
                        .description("Power bank haute capacité avec charge rapide 100W.")
                        .price(BigDecimal.valueOf(799.90))
                        .image("assets/power-bank.jpg")
                        .rating(4.7).reviews(189).badge("En promotion").stock(100)
                        .category(accessories).build(),
                Product.builder()
                        .name("Câble USB-C Premium")
                        .description("Câble tressé USB-C haute vitesse, 2m.")
                        .price(BigDecimal.valueOf(299.90))
                        .image("assets/usb-c-cable.jpg")
                        .rating(4.5).reviews(156).stock(200)
                        .category(accessories).build(),
                Product.builder()
                        .name("Support Téléphone Ajustable")
                        .description("Support en bois naturel pour smartphone et tablette.")
                        .price(BigDecimal.valueOf(199.90))
                        .image("assets/minimalist-wooden-phone-stand.png")
                        .rating(4.3).reviews(92).stock(80)
                        .category(accessories).build(),
                
                Product.builder()
                        .name("Lampe LED Intelligente")
                        .description("Lampe connectée avec 16 millions de couleurs.")
                        .price(BigDecimal.valueOf(499.90))
                        .image("assets/smart-led-lamp.jpg")
                        .rating(4.6).reviews(234).badge("Nouveau").stock(60)
                        .category(home).build(),
                Product.builder()
                        .name("Thermostat Connecté")
                        .description("Thermostat intelligent avec contrôle via application.")
                        .price(BigDecimal.valueOf(1999.90))
                        .image("assets/smart-thermostat.jpg")
                        .rating(4.8).reviews(421).stock(40)
                        .category(home).build(),
                Product.builder()
                        .name("Sonnette Vidéo HD")
                        .description("Sonnette connectée avec caméra HD et détection de mouvement.")
                        .price(BigDecimal.valueOf(1499.90))
                        .image("assets/video-doorbell.jpg")
                        .rating(4.7).reviews(178).stock(35)
                        .category(home).build(),
                
                Product.builder()
                        .name("Montre de Luxe")
                        .description("Montre classique avec bracelet en cuir italien.")
                        .price(BigDecimal.valueOf(2499.90))
                        .image("assets/luxury-watch.jpg")
                        .rating(4.9).reviews(567).badge("Populaire").stock(25)
                        .category(fashion).build(),
                Product.builder()
                        .name("Sac à Dos Urbain")
                        .description("Sac à dos imperméable avec compartiment laptop.")
                        .price(BigDecimal.valueOf(899.90))
                        .image("assets/urban-backpack.jpg")
                        .rating(4.6).reviews(289).stock(70)
                        .category(fashion).build()

                ,

                Product.builder()
                        .name("Ballon de Football Premium")
                        .description("Ballon taille 5 cousu main, revêtement microfibre pour un contrôle précis.")
                        .price(BigDecimal.valueOf(299.90))
                        .image("assets/soccer-ball.jpg")
                        .rating(4.7).reviews(142).badge("Populaire").stock(120)
                        .category(sports).build(),
                Product.builder()
                        .name("Raquette de Tennis Carbone")
                        .description("Raquette légère en fibre de carbone, tamis 100 in², équilibre neutre.")
                        .price(BigDecimal.valueOf(1299.90))
                        .image("assets/tennis-racket.jpg")
                        .rating(4.5).reviews(88).stock(45)
                        .category(sports).build(),
                Product.builder()
                        .name("Gants de Boxe Pro")
                        .description("Gants 12 oz en cuir synthétique, mousse triple densité.")
                        .price(BigDecimal.valueOf(499.90))
                        .image("assets/boxing-gloves.jpg")
                        .rating(4.6).reviews(73).stock(55)
                        .category(sports).build(),

                Product.builder()
                        .name("Lunettes de Soleil Premium")
                        .description("Monture légère, verres polarisés UV400.")
                        .price(BigDecimal.valueOf(699.90))
                        .image("assets/premium-sunglasses.jpg")
                        .rating(4.8).reviews(165).badge("En promotion").stock(90)
                        .category(beauty).build(),
                Product.builder()
                        .name("Parfum Élégance 50ml")
                        .description("Notes boisées et florales, tenue longue durée.")
                        .price(BigDecimal.valueOf(549.90))
                        .image("assets/placeholder.jpg")
                        .rating(4.4).reviews(97).stock(60)
                        .category(beauty).build(),
                Product.builder()
                        .name("Crème Hydratante Jour")
                        .description("Formule légère avec SPF 30, adaptée à tous types de peau.")
                        .price(BigDecimal.valueOf(249.90))
                        .image("assets/placeholder-user.jpg")
                        .rating(4.3).reviews(112).stock(150)
                        .category(beauty).build(),

                Product.builder()
                        .name("Casque Audio Studio")
                        .description("Casque filaire circum-aural avec réduction passive du bruit.")
                        .price(BigDecimal.valueOf(1199.90))
                        .image("assets/headphones-angle.jpg")
                        .rating(4.7).reviews(214).stock(65)
                        .category(electronics).build(),
                Product.builder()
                        .name("Enceinte Portable Étanche")
                        .description("Enceinte Bluetooth IP67, 20h d'autonomie, charge USB-C.")
                        .price(BigDecimal.valueOf(599.90))
                        .image("assets/portable-speaker.jpg")
                        .rating(4.6).reviews(176).badge("Nouveau").stock(110)
                        .category(accessories).build()
        );

        productRepository.saveAll(Objects.requireNonNull(products, "La liste des produits ne doit pas être nulle"));
    }
}

