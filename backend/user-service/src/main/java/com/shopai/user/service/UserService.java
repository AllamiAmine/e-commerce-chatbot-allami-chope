package com.shopai.user.service;

import com.shopai.user.dto.AuthRequest;
import com.shopai.user.dto.AuthResponse;
import com.shopai.user.dto.RegisterRequest;
import com.shopai.user.entity.User;
import com.shopai.user.repository.UserRepository;
import com.shopai.user.security.JwtService;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Objects;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public UserService(
            UserRepository userRepository,
            @Lazy PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Lazy AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public User loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(Objects.requireNonNull(username, "username ne doit pas être null"))
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(User.Role.valueOf(request.getRole().toUpperCase()))
                .status(User.Status.ACTIVE)
                .build();

        userRepository.save(Objects.requireNonNull(user, "User ne doit pas être null"));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (user.getStatus() == User.Status.BANNED) {
            throw new RuntimeException("Votre compte a été banni");
        }

        if (user.getStatus() == User.Status.INACTIVE) {
            throw new RuntimeException("Votre compte est inactif");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"));
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(Objects.requireNonNull(email, "email ne doit pas être null"));
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(Objects.requireNonNull(role, "role ne doit pas être null"));
    }

    public List<User> searchUsers(String query) {
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"))
                .map(user -> {
                    user.setName(updatedUser.getName());
                    user.setPhone(updatedUser.getPhone());
                    user.setAddress(updatedUser.getAddress());
                    user.setAvatar(updatedUser.getAvatar());
                    if (updatedUser.getRole() != null) {
                        user.setRole(updatedUser.getRole());
                    }
                    if (updatedUser.getStatus() != null) {
                        user.setStatus(updatedUser.getStatus());
                    }
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public User updateUserStatus(Long id, User.Status status) {
        return userRepository.findById(Objects.requireNonNull(id, "Id ne doit pas être null"))
                .map(user -> {
                    user.setStatus(status);
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(Objects.requireNonNull(id, "Id ne doit pas être null"))) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        userRepository.deleteById(id);
    }

    public long countUsers() {
        return userRepository.count();
    }

    public long countUsersByRole(User.Role role) {
        return userRepository.findByRole(role).size();
    }

    public long countActiveUsers() {
        return userRepository.findByStatus(User.Status.ACTIVE).size();
    }

    public User createUser(String name, String email, String phone, User.Role role, User.Status status, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        String finalPassword = password != null && !password.isEmpty() 
            ? password 
            : "TempPass123!";

        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(finalPassword))
                .phone(phone)
                .role(role)
                .status(status != null ? status : User.Status.ACTIVE)
                .build();

        return userRepository.save(user);
    }
}
