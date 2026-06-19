package com.uade.tpo.demo.config;

import com.uade.tpo.demo.domain.ProductStatus;
import com.uade.tpo.demo.entity.Category;
import com.uade.tpo.demo.entity.CustomerInfo;
import com.uade.tpo.demo.entity.Product;
import com.uade.tpo.demo.entity.ProductImage;
import com.uade.tpo.demo.entity.User;
import com.uade.tpo.demo.entity.enums.Role;
import com.uade.tpo.demo.repository.CategoryRepository;
import com.uade.tpo.demo.repository.ProductRepository;
import com.uade.tpo.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCatalog();
    }

    // -------------------------------------------------------------------------
    // Users
    // -------------------------------------------------------------------------

    private void seedUsers() {
        seedUser("admin",  "admin@tempus.local",  "admin123", "Admin", "Tempus", Role.ADMIN);
        seedUser("buyer1", "buyer1@tempus.local", "buyer123", "Juan",  "Pérez",  Role.BUYER);
        seedUser("IDDQD",  "iddqd@tempus.local",  "IDKFA",   "Doom",  "Slayer", Role.DOOM_SLAYER);
    }

    private void seedUser(String username, String email, String rawPassword,
                          String name, String lastName, Role role) {
        User user = userRepository.findByEmail(email).orElseGet(() -> User.builder()
            .username(username)
            .email(email)
            .password(passwordEncoder.encode(rawPassword))
            .name(name)
            .lastName(lastName)
            .role(role)
            .createdAt(new Date())
            .build());

        if (user.getCustomerInfo() == null) {
            user.setCustomerInfo(CustomerInfo.builder()
                .user(user)
                .firstName(name)
                .lastName(lastName)
                .phone("+54 11 1234 5678")
                .line1("Av. Corrientes 1234")
                .line2("")
                .city("Buenos Aires")
                .region("CABA")
                .postalCode("C1043")
                .countryCode("AR")
                .createdAt(new Date())
                .updatedAt(new Date())
                .build());
        }

        userRepository.save(user);
    }

    // -------------------------------------------------------------------------
    // Catalog
    // -------------------------------------------------------------------------

    private void seedCatalog() {
        Category luxury  = seedCategory("LUXURY",  "Relojes de Lujo",    "lujo",
                "Piezas de alta relojería suiza, ediciones limitadas y complicaciones.");
        Category sport   = seedCategory("SPORT",   "Relojes Deportivos", "deporte",
                "Relojes robustos para deporte, buceo y uso diario intenso.");
        Category vintage = seedCategory("VINTAGE", "Relojes Vintage",    "vintage",
                "Modelos clásicos y piezas de colección con historia.");
        Category dress   = seedCategory("DRESS",   "Relojes de Vestir",  "vestir",
                "Relojes elegantes y discretos, ideales para ocasiones formales.");

        seedProduct(
                "ROLEX-001", "Rolex Submariner", "rolex-submariner",
                "Icono de la relojería deportiva, sumergible hasta 300m.",
                new BigDecimal("9500.00"), null, 5, luxury,
                "Calibre 3235", "41mm", "Acero Oystersteel",
                new String[]{
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
                        "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=80"
                },
                new String[]{
                        "Rolex Submariner - vista frontal",
                        "Rolex Submariner - vista lateral"
                });

        seedProduct(
                "OMEGA-001", "Omega Speedmaster", "omega-speedmaster",
                "El legendario Moonwatch, cronógrafo manual profesional.",
                new BigDecimal("7200.00"), new BigDecimal("7800.00"), 4, luxury,
                "Calibre 3861", "42mm", "Acero inoxidable",
                new String[]{
                        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
                        "https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800&q=80"
                },
                new String[]{
                        "Omega Speedmaster - vista frontal",
                        "Omega Speedmaster - detalle del dial"
                });

        seedProduct(
                "SEIKO-001", "Seiko Prospex Diver", "seiko-prospex-diver",
                "Reloj buzo automático con resistencia 200m, ideal deportes.",
                new BigDecimal("450.00"), null, 20, sport,
                "Calibre 4R36", "42.7mm", "Caucho",
                new String[]{
                        "https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80",
                        "https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?w=800&q=80"
                },
                new String[]{
                        "Seiko Prospex Diver - vista frontal",
                        "Seiko Prospex Diver - bisel"
                });

        seedProduct(
                "CASIO-001", "Casio G-Shock GA-2100", "casio-g-shock-ga-2100",
                "El \"CasiOak\", resistente, ligero y con diseño octogonal.",
                new BigDecimal("120.00"), null, 50, sport,
                "Módulo 5611", "45.4mm", "Resina",
                new String[]{
                        "https://images.unsplash.com/photo-1495704907664-81f74a7efd9b?w=800&q=80",
                        "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80"
                },
                new String[]{
                        "Casio G-Shock GA-2100 - vista frontal",
                        "Casio G-Shock GA-2100 - en muñeca"
                });

        seedProduct(
                "TISSOT-001", "Tissot Visodate Vintage", "tissot-visodate-vintage",
                "Reedición vintage con estética de los años 50.",
                new BigDecimal("850.00"), new BigDecimal("950.00"), 3, vintage,
                "ETA 2836-2", "40mm", "Cuero marrón",
                new String[]{
                        "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&q=80",
                        "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&q=80"
                },
                new String[]{
                        "Tissot Visodate - vista frontal",
                        "Tissot Visodate - correa de cuero"
                });

        seedProduct(
                "LONGINES-001", "Longines La Grande Classique", "longines-la-grande-classique",
                "Reloj de vestir ultrafino, elegancia atemporal.",
                new BigDecimal("1600.00"), null, 8, dress,
                "L209.2", "36mm", "Cuero negro",
                new String[]{
                        "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
                        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80"
                },
                new String[]{
                        "Longines La Grande Classique - vista frontal",
                        "Longines La Grande Classique - perfil"
                });
    }

    private Category seedCategory(String code, String name, String slug, String description) {
        return categoryRepository.findByCode(code).orElseGet(() ->
                categoryRepository.save(Category.builder()
                        .code(code)
                        .name(name)
                        .slug(slug)
                        .description(description)
                        .active(true)
                        .build()));
    }

    private void seedProduct(String sku, String name, String slug, String description,
                             BigDecimal price, BigDecimal compareAtPrice, int stock,
                             Category category, String caliber, String caseSize,
                             String strapMaterial, String[] imageUrls, String[] imageAlts) {
        if (productRepository.findBySku(sku).isPresent()) return;

        Product product = Product.builder()
                .sku(sku)
                .name(name)
                .slug(slug)
                .description(description)
                .price(price)
                .compareAtPrice(compareAtPrice)
                .stock(stock)
                .status(ProductStatus.ACTIVE)
                .category(category)
                .caliber(caliber)
                .caseSize(caseSize)
                .strapMaterial(strapMaterial)
                .build();

        for (int i = 0; i < imageUrls.length; i++) {
            product.addImage(ProductImage.builder()
                    .url(imageUrls[i])
                    .sortOrder(i + 1)
                    .altText(imageAlts[i])
                    .build());
        }

        productRepository.save(product);
    }
}
