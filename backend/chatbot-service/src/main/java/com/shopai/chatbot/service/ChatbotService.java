package com.shopai.chatbot.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final NLPService nlpService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${services.product-service:http://localhost:8082}")
    private String productServiceUrl;

    public Map<String, Object> processMessage(String message, Long userId) {
        // Analyze the message with NLP
        Map<String, Object> analysis = nlpService.analyzeMessage(message);
        String intent = (String) analysis.get("intent");
        @SuppressWarnings("unchecked")
        Map<String, Object> entities = (Map<String, Object>) analysis.get("entities");

        // Generate response based on intent
        Map<String, Object> response = generateResponse(intent, entities, userId);
        response.put("analysis", analysis);
        
        return response;
    }

    private Map<String, Object> generateResponse(String intent, Map<String, Object> entities, Long userId) {
        return switch (intent) {
            case "GREETING" -> handleGreeting();
            case "PRODUCT_SEARCH" -> handleProductSearch(entities);
            case "CATEGORY_BROWSE" -> handleCategoryBrowse(entities);
            case "RECOMMENDATION" -> handleRecommendation(entities);
            case "ORDER_STATUS" -> handleOrderStatus(userId);
            case "DELIVERY_TRACKING" -> handleDeliveryTracking(userId);
            case "PRICE_INQUIRY" -> handlePriceInquiry(entities);
            case "HELP" -> handleHelp();
            case "PAYMENT" -> handlePayment();
            case "RETURN" -> handleReturn();
            case "THANKS" -> handleThanks();
            default -> handleUnknown(entities);
        };
    }

    private Map<String, Object> handleGreeting() {
        List<String> greetings = List.of(
                "Bonjour ! 😊 Bienvenue sur ShopAI. Comment puis-je vous aider ?",
                "Salut ! 👋 Je suis votre assistant IA. Que recherchez-vous ?",
                "Hello ! 🌟 Prêt à vous aider. Que puis-je faire pour vous ?"
        );
        return Map.of(
                "text", greetings.get(new Random().nextInt(greetings.size())),
                "suggestions", List.of("Voir les produits", "Recommandations", "Mes commandes")
        );
    }

    private Map<String, Object> handleProductSearch(Map<String, Object> entities) {
        String category = (String) entities.get("category");
        List<Object> products = fetchProducts(category);
        
        String text = category != null 
                ? String.format("🔍 Voici les produits en <strong>%s</strong> :", category)
                : "🔍 Voici nos produits disponibles :";
        
        return Map.of(
                "text", text,
                "products", products,
                "suggestions", List.of("Plus de produits", "Filtrer par prix", "Autres catégories")
        );
    }

    private Map<String, Object> handleCategoryBrowse(Map<String, Object> entities) {
        String category = (String) entities.get("category");
        
        if (category != null) {
            List<Object> products = fetchProducts(category);
            return Map.of(
                    "text", String.format("📂 <strong>Catégorie %s</strong><br>Découvrez notre sélection :", category),
                    "products", products
            );
        }
        
        return Map.of(
                "text", "📂 <strong>Nos catégories :</strong><br>• 📱 Électronique<br>• 🎧 Accessoires<br>• 🏠 Maison<br>• 👕 Mode<br>• ⚽ Sports<br>• 💄 Beauté",
                "suggestions", List.of("Électronique", "Accessoires", "Mode")
        );
    }

    private Map<String, Object> handleRecommendation(Map<String, Object> entities) {
        List<Object> products = fetchTopProducts();
        return Map.of(
                "text", "💡 <strong>Recommandations personnalisées</strong><br>Voici nos produits les mieux notés :",
                "products", products,
                "suggestions", List.of("Voir plus", "Promotions", "Nouveautés")
        );
    }

    private Map<String, Object> handleOrderStatus(Long userId) {
        return Map.of(
                "text", "📦 <strong>Vos commandes récentes :</strong><br><br>" +
                        "• Commande #12458 - En cours de livraison 🚚<br>" +
                        "• Commande #12445 - Livrée ✅<br><br>" +
                        "Voulez-vous plus de détails ?",
                "suggestions", List.of("Détails commande", "Suivre livraison", "Historique")
        );
    }

    private Map<String, Object> handleDeliveryTracking(Long userId) {
        return Map.of(
                "text", "🚚 <strong>Suivi de livraison</strong><br><br>" +
                        "📦 Commande #12458<br>" +
                        "📍 Statut: En transit<br>" +
                        "🏢 Centre de distribution Casablanca<br>" +
                        "📅 Livraison prévue: Demain avant 18h",
                "suggestions", List.of("Détails", "Contacter livreur", "Autre commande")
        );
    }

    private Map<String, Object> handlePriceInquiry(Map<String, Object> entities) {
        Integer maxPrice = (Integer) entities.get("maxPrice");
        List<Object> products = maxPrice != null ? fetchProductsByPrice(maxPrice) : fetchPromotions();
        
        String text = maxPrice != null 
                ? String.format("💰 Produits à moins de %d MAD :", maxPrice)
                : "💰 <strong>Promotions actuelles :</strong><br>🔥 -20% sur l'électronique<br>🎁 Livraison gratuite dès 500 MAD";
        
        return Map.of(
                "text", text,
                "products", products,
                "suggestions", List.of("Moins de 500 MAD", "Moins de 1000 MAD", "Promotions")
        );
    }

    private Map<String, Object> handleHelp() {
        return Map.of(
                "text", "🤝 <strong>Comment puis-je vous aider ?</strong><br><br>" +
                        "🔍 Rechercher des produits<br>" +
                        "📂 Explorer les catégories<br>" +
                        "💡 Obtenir des recommandations<br>" +
                        "📦 Suivre vos commandes<br>" +
                        "💳 Infos paiement & livraison",
                "suggestions", List.of("Produits", "Commandes", "Paiement")
        );
    }

    private Map<String, Object> handlePayment() {
        return Map.of(
                "text", "💳 <strong>Modes de paiement :</strong><br><br>" +
                        "• Carte bancaire (Visa, Mastercard)<br>" +
                        "• PayPal<br>" +
                        "• Paiement à la livraison<br>" +
                        "• Virement bancaire<br><br>" +
                        "🔒 Paiements 100% sécurisés",
                "suggestions", List.of("Carte bancaire", "PayPal", "À la livraison")
        );
    }

    private Map<String, Object> handleReturn() {
        return Map.of(
                "text", "🔄 <strong>Politique de retour :</strong><br><br>" +
                        "✅ Retour gratuit sous 30 jours<br>" +
                        "✅ Remboursement sous 5-7 jours<br>" +
                        "✅ Échange possible<br><br>" +
                        "Avez-vous un produit à retourner ?",
                "suggestions", List.of("Retourner un produit", "Conditions", "Contact")
        );
    }

    private Map<String, Object> handleThanks() {
        List<String> responses = List.of(
                "De rien ! 😊 N'hésitez pas si vous avez d'autres questions !",
                "Avec plaisir ! 🌟 Je suis là 24/7 pour vous aider.",
                "Merci à vous ! 😄 Bons achats sur ShopAI !"
        );
        return Map.of(
                "text", responses.get(new Random().nextInt(responses.size())),
                "suggestions", List.of("Voir produits", "Accueil", "Autre question")
        );
    }

    private Map<String, Object> handleUnknown(Map<String, Object> entities) {
        List<Object> products = fetchTopProducts();
        return Map.of(
                "text", "🤔 Je ne suis pas sûr de comprendre. Voici ce que je peux faire :<br><br>" +
                        "• 🔍 Rechercher des produits<br>" +
                        "• 📂 Explorer les catégories<br>" +
                        "• 💡 Recommandations<br>" +
                        "• 📦 Suivre commandes",
                "products", products,
                "suggestions", List.of("Produits", "Aide", "Catégories")
        );
    }

    // Helper methods to fetch data from Product Service
    @SuppressWarnings("unchecked")
    private List<Object> fetchProducts(String category) {
        try {
            String url = category != null 
                    ? productServiceUrl + "/api/products/search?q=" + category
                    : productServiceUrl + "/api/products";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response != null ? (List<Object>) response.get("data") : List.of();
        } catch (Exception e) {
            log.error("Error fetching products: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Object> fetchTopProducts() {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    productServiceUrl + "/api/products/top-rated", Map.class);
            return response != null ? (List<Object>) response.get("data") : List.of();
        } catch (Exception e) {
            log.error("Error fetching top products: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Object> fetchPromotions() {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    productServiceUrl + "/api/products/promotions", Map.class);
            return response != null ? (List<Object>) response.get("data") : List.of();
        } catch (Exception e) {
            log.error("Error fetching promotions: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Object> fetchProductsByPrice(int maxPrice) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                    productServiceUrl + "/api/products/price-range?min=0&max=" + maxPrice, Map.class);
            return response != null ? (List<Object>) response.get("data") : List.of();
        } catch (Exception e) {
            log.error("Error fetching products by price: {}", e.getMessage());
            return List.of();
        }
    }
}

