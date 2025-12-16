package com.shopai.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String role; // ADMIN, SELLER, CLIENT
    private String status; // ACTIVE, INACTIVE, BANNED
    private String avatar;
    private LocalDateTime createdAt;
}

