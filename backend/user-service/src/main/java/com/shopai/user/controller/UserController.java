package com.shopai.user.controller;

import com.shopai.user.entity.User;
import com.shopai.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // ==================== PUBLIC ENDPOINTS ====================

    @GetMapping("/public/count")
    public ResponseEntity<?> getPublicStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userService.countUsers(),
                "clients", userService.countUsersByRole(User.Role.CLIENT),
                "sellers", userService.countUsersByRole(User.Role.SELLER)
        ));
    }

    // ==================== AUTHENTICATED ENDPOINTS ====================

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "name", user.getName(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "role", user.getRole().name(),
                        "status", user.getStatus().name(),
                        "createdAt", user.getCreatedAt()
                )
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            @AuthenticationPrincipal User currentUser,
            @RequestBody User updatedData
    ) {
        try {
            // Users can only update their own profile info, not role/status
            User user = userService.getUserById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            user.setName(updatedData.getName());
            user.setPhone(updatedData.getPhone());
            user.setAddress(updatedData.getAddress());
            user.setAvatar(updatedData.getAvatar());
            
            User saved = userService.updateUser(user.getId(), user);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profil mis à jour",
                    "data", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", users.stream().map(this::mapUserToResponse).toList(),
                "total", users.size()
        ));
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", mapUserToResponse(user)
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            List<User> users = userService.getUsersByRole(User.Role.valueOf(role.toUpperCase()));
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", users.stream().map(this::mapUserToResponse).toList()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Rôle invalide"
            ));
        }
    }

    @GetMapping("/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        List<User> users = userService.searchUsers(query);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", users.stream().map(this::mapUserToResponse).toList()
        ));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            User user = userService.updateUser(id, updatedUser);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Utilisateur mis à jour",
                    "data", mapUserToResponse(user)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User.Status status = User.Status.valueOf(body.get("status").toUpperCase());
            User user = userService.updateUserStatus(id, status);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Statut mis à jour",
                    "data", mapUserToResponse(user)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Utilisateur supprimé"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData) {
        try {
            String name = (String) userData.get("name");
            String email = (String) userData.get("email");
            String phone = (String) userData.getOrDefault("phone", "");
            String roleStr = (String) userData.getOrDefault("role", "CLIENT");
            String statusStr = (String) userData.getOrDefault("status", "ACTIVE");
            String password = (String) userData.getOrDefault("password", null);

            User.Role role;
            try {
                role = User.Role.valueOf(roleStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Rôle invalide: " + roleStr
                ));
            }

            User.Status status;
            try {
                status = User.Status.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                status = User.Status.ACTIVE;
            }

            User user = userService.createUser(name, email, phone, role, status, password);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Utilisateur créé avec succès",
                    "data", mapUserToResponse(user)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminStats() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "total", userService.countUsers(),
                        "active", userService.countActiveUsers(),
                        "admins", userService.countUsersByRole(User.Role.ADMIN),
                        "sellers", userService.countUsersByRole(User.Role.SELLER),
                        "clients", userService.countUsersByRole(User.Role.CLIENT)
                )
        ));
    }

    // Helper method
    private Map<String, Object> mapUserToResponse(User user) {
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole().name(),
                "status", user.getStatus().name(),
                "createdAt", user.getCreatedAt()
        );
    }
}

