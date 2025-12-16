package com.shopai.order.controller;

import com.shopai.order.entity.Order;
import com.shopai.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", orders.stream().map(this::mapOrder).toList(),
                "total", orders.size()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok(Map.of("success", true, "data", mapOrder(order))))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByNumber(orderNumber)
                .map(order -> ResponseEntity.ok(Map.of("success", true, "data", mapOrder(order))))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrdersByUser(userId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", orders.stream().map(this::mapOrder).toList()
        ));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderService.getOrdersByStatus(orderStatus);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", orders.stream().map(this::mapOrder).toList()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Statut invalide"));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Order order = Order.builder()
                    .userId(Long.valueOf(request.get("userId").toString()))
                    .userName((String) request.get("userName"))
                    .userEmail((String) request.get("userEmail"))
                    .shippingAddress((String) request.get("shippingAddress"))
                    .paymentMethod((String) request.get("paymentMethod"))
                    .build();
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
            
            Order saved = orderService.createOrder(order, items);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Commande créée avec succès",
                    "data", mapOrder(saved)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Order.OrderStatus status = Order.OrderStatus.valueOf(body.get("status").toUpperCase());
            Order updated = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(Map.of("success", true, "data", mapOrder(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/tracking")
    public ResponseEntity<?> updateTracking(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Order updated = orderService.updateTrackingNumber(id, body.get("trackingNumber"));
            return ResponseEntity.ok(Map.of("success", true, "data", mapOrder(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            Order cancelled = orderService.cancelOrder(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Commande annulée", "data", mapOrder(cancelled)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", orderService.countOrders());
        stats.put("pending", orderService.countOrdersByStatus(Order.OrderStatus.PENDING));
        stats.put("confirmed", orderService.countOrdersByStatus(Order.OrderStatus.CONFIRMED));
        stats.put("shipped", orderService.countOrdersByStatus(Order.OrderStatus.SHIPPED));
        stats.put("delivered", orderService.countOrdersByStatus(Order.OrderStatus.DELIVERED));
        stats.put("cancelled", orderService.countOrdersByStatus(Order.OrderStatus.CANCELLED));
        stats.put("revenue", orderService.getTotalRevenue());
        
        return ResponseEntity.ok(Map.of("success", true, "data", stats));
    }

    private Map<String, Object> mapOrder(Order order) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", order.getId());
        map.put("orderNumber", order.getOrderNumber());
        map.put("userId", order.getUserId());
        map.put("userName", order.getUserName() != null ? order.getUserName() : "");
        map.put("userEmail", order.getUserEmail() != null ? order.getUserEmail() : "");
        map.put("items", order.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("id", item.getId());
            itemMap.put("productId", item.getProductId());
            itemMap.put("productName", item.getProductName() != null ? item.getProductName() : "");
            itemMap.put("productImage", item.getProductImage() != null ? item.getProductImage() : "");
            itemMap.put("price", item.getPrice());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("total", item.getTotal());
            return itemMap;
        }).toList());
        map.put("subtotal", order.getSubtotal());
        map.put("shipping", order.getShipping());
        map.put("total", order.getTotal());
        map.put("status", order.getStatus().name());
        map.put("shippingAddress", order.getShippingAddress() != null ? order.getShippingAddress() : "");
        map.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod() : "");
        map.put("trackingNumber", order.getTrackingNumber() != null ? order.getTrackingNumber() : "");
        map.put("createdAt", order.getCreatedAt());
        map.put("updatedAt", order.getUpdatedAt());
        return map;
    }
}
