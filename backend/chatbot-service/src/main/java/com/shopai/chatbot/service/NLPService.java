package com.shopai.chatbot.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
@Slf4j
public class NLPService {

    // Intent patterns using HashMap
    private final Map<String, List<String>> intentPatterns;
    private final Map<String, List<String>> categoryKeywords;

    public NLPService() {
        // Initialize intent patterns
        intentPatterns = new HashMap<>();
        intentPatterns.put("GREETING", List.of("bonjour", "salut", "hello", "hey", "coucou", "bonsoir", "hi", "salam"));
        intentPatterns.put("PRODUCT_SEARCH", List.of("cherche", "recherche", "trouve", "trouver", "où", "avoir", "acheter", "besoin", "veux", "voudrais"));
        intentPatterns.put("CATEGORY_BROWSE", List.of("catégorie", "categories", "électronique", "accessoires", "maison", "mode", "sports", "beauté"));
        intentPatterns.put("RECOMMENDATION", List.of("recommand", "suggér", "conseil", "proposer", "idée", "meilleur", "populaire", "tendance"));
        intentPatterns.put("ORDER_STATUS", List.of("commande", "commandes", "mes commandes", "historique", "statut", "état"));
        intentPatterns.put("DELIVERY_TRACKING", List.of("livraison", "suivre", "suivi", "tracking", "colis", "expédition"));
        intentPatterns.put("PRICE_INQUIRY", List.of("prix", "coût", "combien", "tarif", "promotion", "solde", "réduction"));
        intentPatterns.put("HELP", List.of("aide", "help", "problème", "question", "support", "comment"));
        intentPatterns.put("PAYMENT", List.of("paiement", "carte", "payer", "cb", "paypal", "visa"));
        intentPatterns.put("RETURN", List.of("retour", "rembours", "échanger", "annuler"));
        intentPatterns.put("THANKS", List.of("merci", "super", "parfait", "génial", "excellent"));

        // Initialize category keywords
        categoryKeywords = new HashMap<>();
        categoryKeywords.put("Électronique", List.of("électronique", "electronique", "tech", "gadget", "écouteur", "montre", "caméra", "drone", "bluetooth"));
        categoryKeywords.put("Accessoires", List.of("accessoire", "câble", "cable", "batterie", "chargeur", "support", "housse"));
        categoryKeywords.put("Maison", List.of("maison", "lampe", "thermostat", "sonnette", "serrure", "connecté", "smart home"));
        categoryKeywords.put("Mode", List.of("mode", "montre luxe", "sac", "lunettes", "portefeuille", "ceinture"));
        categoryKeywords.put("Sports", List.of("sport", "ballon", "football", "tennis", "raquette", "boxe", "fitness"));
        categoryKeywords.put("Beauté", List.of("beauté", "maquillage", "sérum", "cosmétique", "soin"));
    }

    public Map<String, Object> analyzeMessage(String message) {
        String normalized = message.toLowerCase().trim();
        String[] words = normalized.split("\\s+");

        // Detect intent
        String intent = detectIntent(normalized, words);
        
        // Extract entities
        Map<String, Object> entities = extractEntities(normalized);
        
        // Calculate confidence
        double confidence = calculateConfidence(normalized, intent);

        Map<String, Object> result = new HashMap<>();
        result.put("intent", intent);
        result.put("entities", entities);
        result.put("confidence", confidence);
        result.put("originalMessage", message);
        return result;
    }

    private String detectIntent(String input, String[] words) {
        Map<String, Integer> scores = new HashMap<>();

        for (Map.Entry<String, List<String>> entry : intentPatterns.entrySet()) {
            int score = 0;
            for (String pattern : entry.getValue()) {
                if (input.contains(pattern)) {
                    score += 2;
                }
            }
            scores.put(entry.getKey(), score);
        }

        return scores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .filter(e -> e.getValue() > 0)
                .map(Map.Entry::getKey)
                .orElse("UNKNOWN");
    }

    private Map<String, Object> extractEntities(String input) {
        Map<String, Object> entities = new HashMap<>();
        List<String> keywords = new ArrayList<>();

        // Detect category
        for (Map.Entry<String, List<String>> entry : categoryKeywords.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (input.contains(keyword)) {
                    entities.put("category", entry.getKey());
                    keywords.add(keyword);
                    break;
                }
            }
            if (entities.containsKey("category")) break;
        }

        // Extract price range
        Pattern pricePattern = Pattern.compile("(\\d+)\\s*(mad|dh|dirhams?)?", Pattern.CASE_INSENSITIVE);
        var matcher = pricePattern.matcher(input);
        if (matcher.find()) {
            int price = Integer.parseInt(matcher.group(1));
            if (input.contains("moins") || input.contains("max") || input.contains("budget")) {
                entities.put("maxPrice", price);
            } else if (input.contains("plus") || input.contains("min")) {
                entities.put("minPrice", price);
            }
        }

        entities.put("keywords", keywords);
        return entities;
    }

    private double calculateConfidence(String input, String intent) {
        if ("UNKNOWN".equals(intent)) return 0.3;
        
        List<String> patterns = intentPatterns.getOrDefault(intent, List.of());
        long matchCount = patterns.stream().filter(input::contains).count();
        
        return Math.min(0.5 + (matchCount * 0.15), 0.95);
    }
}
