package com.shopai.user.config;

import com.shopai.user.entity.User;
import com.shopai.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfNotExists("admin@shopai.com", "admin123", "Admin ShopAI", User.Role.ADMIN, "+212 600 000 001");
        createUserIfNotExists("seller@shopai.com", "seller123", "Vendeur Demo", User.Role.SELLER, "+212 600 000 002");
        createUserIfNotExists("client@shopai.com", "client123", "Client Demo", User.Role.CLIENT, "+212 600 000 003");
        
        log.info("✅ Demo users initialized successfully!");
        log.info("📧 Admin: admin@shopai.com / admin123");
        log.info("📧 Seller: seller@shopai.com / seller123");
        log.info("📧 Client: client@shopai.com / client123");
    }

    private void createUserIfNotExists(String email, String password, String name, User.Role role, String phone) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .name(name)
                    .role(role)
                    .phone(phone)
                    .status(User.Status.ACTIVE)
                    .build();
            userRepository.save(Objects.requireNonNull(user, "User ne doit pas être null"));
            log.info("Created user: {} with role {}", email, role);
        }
    }
}

