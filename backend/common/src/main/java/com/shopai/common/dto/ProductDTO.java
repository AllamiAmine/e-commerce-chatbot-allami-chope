package com.shopai.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String image;
    private Double rating;
    private Integer reviews;
    private String badge;
    private Long categoryId;
    private String categoryName;
    private Integer stock;
    private Long sellerId;
    private String sellerName;
}

