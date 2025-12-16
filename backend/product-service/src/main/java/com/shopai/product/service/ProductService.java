package com.shopai.product.service;

import com.shopai.product.entity.Category;
import com.shopai.product.entity.Product;
import com.shopai.product.repository.CategoryRepository;
import com.shopai.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // ==================== CATEGORIES ====================

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"));
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(Objects.requireNonNull(category, "Catégorie ne doit pas être null"));
    }

    public Category updateCategory(Long id, Category updated) {
        if (id == null || updated == null) {
            throw new IllegalArgumentException("Id et catégorie ne doivent pas être null");
        }

        return categoryRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"))
                .map(category -> {
                    category.setName(updated.getName());
                    category.setIcon(updated.getIcon());
                    category.setColor(updated.getColor());
                    category.setDescription(updated.getDescription());
                    return categoryRepository.save(category);
                })
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
    }

    public void deleteCategory(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Id ne doit pas être null");
        }
        categoryRepository.deleteById(Objects.requireNonNull(id, "Id ne doit pas être null"));
    }

    // ==================== PRODUCTS ====================

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        if (categoryId == null) {
            return List.of();
        }
        return productRepository.findByCategoryId(Objects.requireNonNull(categoryId, "categoryId ne doit pas être null"));
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        if (sellerId == null) {
            return List.of();
        }
        return productRepository.findBySellerId(Objects.requireNonNull(sellerId, "sellerId ne doit pas être null"));
    }

    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    public List<Product> getProductsByPriceRange(BigDecimal min, BigDecimal max) {
        return productRepository.findByPriceRange(min, max);
    }

    public List<Product> getPromotionalProducts() {
        return productRepository.findByBadgeIsNotNull();
    }

    public List<Product> getTopRatedProducts() {
        return productRepository.findTop10ByOrderByRatingDesc();
    }

    public List<Product> getNewProducts() {
        return productRepository.findTop10ByOrderByCreatedAtDesc();
    }

    public Product createProduct(Product product) {
        if (product.getCategory() != null) {
            Long categoryId = product.getCategory().getId();
            if (categoryId != null) {
                Category category = categoryRepository.findById(Objects.requireNonNull(categoryId, "categoryId ne doit pas être null"))
                        .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
                product.setCategory(category);
            }
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updated) {
        if (id == null || updated == null) {
            throw new IllegalArgumentException("Id et produit ne doivent pas être null");
        }

        return productRepository.findById(id)
                .map(product -> {
                    product.setName(updated.getName());
                    product.setDescription(updated.getDescription());
                    product.setPrice(updated.getPrice());
                    product.setImage(updated.getImage());
                    product.setBadge(updated.getBadge());
                    product.setStock(updated.getStock());
                    if (updated.getCategory() != null) {
                        Long categoryId = updated.getCategory().getId();
                        if (categoryId != null) {
                            Category category = categoryRepository.findById(Objects.requireNonNull(categoryId, "categoryId ne doit pas être null"))
                                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
                            product.setCategory(category);
                        }
                    }
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    }

    public Product updateStock(Long id, Integer quantity) {
        if (id == null) {
            throw new IllegalArgumentException("Id ne doit pas être null");
        }

        int safeQuantity = quantity != null ? quantity : 0;

        return productRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"))
                .map(product -> {
                    Integer currentStock = product.getStock() != null ? product.getStock() : 0;
                    product.setStock(currentStock + safeQuantity);
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
    }

    public void deleteProduct(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Id ne doit pas être null");
        }
        productRepository.deleteById(Objects.requireNonNull(id, "Id ne doit pas être null"));
    }

    public long countProducts() {
        return productRepository.count();
    }

    public long countCategories() {
        return categoryRepository.count();
    }
}

