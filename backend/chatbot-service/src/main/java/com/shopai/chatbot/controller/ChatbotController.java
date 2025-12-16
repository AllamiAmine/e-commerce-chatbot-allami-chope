package com.shopai.chatbot.controller;

import com.shopai.chatbot.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<?> processMessage(@RequestBody Map<String, Object> request) {
        try {
            String message = (String) request.get("message");
            Long userId = request.get("userId") != null 
                    ? Long.valueOf(request.get("userId").toString()) 
                    : null;

            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Le message est requis"
                ));
            }

            Map<String, Object> response = chatbotService.processMessage(message, userId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", response
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Erreur lors du traitement du message: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ChatBot NLP Service",
                "version", "1.0.0"
        ));
    }
}

