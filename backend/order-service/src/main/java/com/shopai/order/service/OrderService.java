package com.shopai.order.service;

import com.shopai.order.entity.Order;
import com.shopai.order.entity.OrderItem;
import com.shopai.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAllOrderByCreatedAtDesc();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"));
    }

    public Optional<Order> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(Objects.requireNonNull(userId, "userId ne doit pas être null"));
    }

    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(Objects.requireNonNull(status, "status ne doit pas être null"));
    }

    @Transactional
    public Order createOrder(Order order, List<Map<String, Object>> items) {
        Order newOrder = Order.builder()
                .userId(order.getUserId())
                .userName(order.getUserName())
                .userEmail(order.getUserEmail())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .shipping(order.getShipping() != null ? order.getShipping() : BigDecimal.valueOf(50))
                .build();

        for (Map<String, Object> item : items) {
            OrderItem orderItem = OrderItem.builder()
                    .productId(Long.valueOf(item.get("productId").toString()))
                    .productName((String) item.get("productName"))
                    .productImage((String) item.get("productImage"))
                    .price(new BigDecimal(item.get("price").toString()))
                    .quantity(Integer.valueOf(item.get("quantity").toString()))
                    .build();
            newOrder.addItem(orderItem);
        }

        newOrder.calculateTotals();
        return orderRepository.save(newOrder);
    }

    public Order updateOrderStatus(Long id, Order.OrderStatus status) {
        return orderRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"))
                .map(order -> {
                    order.setStatus(status);
                    return orderRepository.save(order);
                })
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
    }

    public Order updateTrackingNumber(Long id, String trackingNumber) {
        return orderRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"))
                .map(order -> {
                    order.setTrackingNumber(trackingNumber);
                    if (order.getStatus() == Order.OrderStatus.CONFIRMED) {
                        order.setStatus(Order.OrderStatus.SHIPPED);
                    }
                    return orderRepository.save(order);
                })
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
    }

    public Order cancelOrder(Long id) {
        return orderRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"))
                .map(order -> {
                    if (order.getStatus() == Order.OrderStatus.SHIPPED || 
                        order.getStatus() == Order.OrderStatus.DELIVERED) {
                        throw new RuntimeException("Impossible d'annuler une commande expédiée ou livrée");
                    }
                    order.setStatus(Order.OrderStatus.CANCELLED);
                    return orderRepository.save(order);
                })
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
    }

    public long countOrders() {
        return orderRepository.count();
    }

    public long countOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.countByStatus(Objects.requireNonNull(status, "status ne doit pas être null"));
    }

    public BigDecimal getTotalRevenue() {
        BigDecimal revenue = orderRepository.getTotalRevenue();
        return revenue != null ? revenue : BigDecimal.ZERO;
    }
}

