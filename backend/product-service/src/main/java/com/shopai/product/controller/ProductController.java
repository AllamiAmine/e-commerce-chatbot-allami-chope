package com.shopai.product.controller;

import com.shopai.product.entity.Category;
import com.shopai.product.entity.Product;
import com.shopai.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    // ==================== CATEGORIES ====================

    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories() {
        List<Category> categories = productService.getAllCategories();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", categories.stream().map(c -> Map.of(
                        "id", c.getId(),
                        "name", c.getName(),
                        "icon", c.getIcon() != null ? c.getIcon() : "",
                        "color", c.getColor() != null ? c.getColor() : ""
                )).toList()
        ));
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        return productService.getCategoryById(id)
                .map(category -> ResponseEntity.ok(Map.of("success", true, "data", category)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        Category saved = productService.createCategory(category);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Catégorie créée",
                "data", saved
        ));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            Category updated = productService.updateCategory(id, category);
            return ResponseEntity.ok(Map.of("success", true, "data", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        productService.deleteCategory(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Catégorie supprimée"));
    }

    // ==================== PRODUCTS ====================

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products.stream().map(this::mapProduct).toList(),
                "total", products.size()
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(product -> ResponseEntity.ok(Map.of("success", true, "data", mapProduct(product))))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products.stream().map(this::mapProduct).toList()
        ));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<?> getProductsBySeller(@PathVariable Long sellerId) {
        List<Product> products = productService.getProductsBySeller(sellerId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products.stream().map(this::mapProduct).toList()
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(@RequestParam String q) {
        List<Product> products = productService.searchProducts(q);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products.stream().map(this::mapProduct).toList()
        ));
    }

    @GetMapping("/price-range")
    public ResponseEntity<?> getProductsByPriceRange(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max
    ) {
        List<Product> products = productService.getProductsByPriceRange(min, max);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products.stream().map(this::mapProduct).toList()
        ));
    }

    @GetMapping("/promotions")
    public ResponseEntity<?> getPromotionalProducts() {
        List<Product> products = productService.getPromotionalProducts();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products.stream().map(this::mapProduct).toList()
        ));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<?> getTopRatedProducts() {
        List<Product> products = productService.getTopRatedProducts();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products.stream().map(this::mapProduct).toList()
        ));
    }

    @GetMapping("/new")
    public ResponseEntity<?> getNewProducts() {
        List<Product> products = productService.getNewProducts();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products.stream().map(this::mapProduct).toList()
        ));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        Product saved = productService.createProduct(product);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Produit créé",
                "data", mapProduct(saved)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product updated = productService.updateProduct(id, product);
            return ResponseEntity.ok(Map.of("success", true, "data", mapProduct(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        try {
            Product updated = productService.updateStock(id, body.get("quantity"));
            return ResponseEntity.ok(Map.of("success", true, "data", mapProduct(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Produit supprimé"));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalProducts", productService.countProducts(),
                        "totalCategories", productService.countCategories()
                )
        ));
    }

    // Helper method using HashMap to avoid Map.of() limitations
    private Map<String, Object> mapProduct(Product p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("description", p.getDescription() != null ? p.getDescription() : "");
        map.put("price", p.getPrice());
        map.put("image", p.getImage() != null ? p.getImage() : "");
        map.put("rating", p.getRating() != null ? p.getRating() : 0.0);
        map.put("reviews", p.getReviews() != null ? p.getReviews() : 0);
        map.put("badge", p.getBadge() != null ? p.getBadge() : "");
        map.put("stock", p.getStock() != null ? p.getStock() : 0);
        map.put("categoryId", p.getCategory() != null ? p.getCategory().getId() : null);
        map.put("categoryName", p.getCategory() != null ? p.getCategory().getName() : "");
        return map;
    }
}
