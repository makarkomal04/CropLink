package com.croplink.utils;

import com.croplink.models.Product;
import com.croplink.models.User;
import com.croplink.models.Order;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MockDataGenerator {

    public static List<Product> getMockProducts() {
        List<Product> products = new ArrayList<>();
        
        // Mock products
        products.add(createProduct("1", "Fresh Tomatoes", "Vegetables", "Organic", 5.0, 45.0,
            "Fresh organic tomatoes from local farms", true));
        products.add(createProduct("2", "Green Spinach", "Vegetables", "Organic", 3.0, 30.0,
            "Nutrient-rich organic spinach", true));
        products.add(createProduct("3", "Sweet Mangoes", "Fruits", "Organic", 10.0, 120.0,
            "Delicious Alphonso mangoes", true));
        products.add(createProduct("4", "Bananas", "Fruits", "Conventional", 8.0, 40.0,
            "Fresh yellow bananas", true));
        products.add(createProduct("5", "Basmati Rice", "Grains", "Organic", 50.0, 80.0,
            "Premium quality basmati rice", true));
        products.add(createProduct("6", "Wheat Flour", "Grains", "Conventional", 30.0, 35.0,
            "Whole wheat flour", true));
        products.add(createProduct("7", "Fresh Carrots", "Vegetables", "Organic", 4.0, 38.0,
            "Crunchy and sweet carrots", true));
        products.add(createProduct("8", "Oranges", "Fruits", "Conventional", 6.0, 60.0,
            "Juicy fresh oranges", true));
        products.add(createProduct("9", "Cucumbers", "Vegetables", "Organic", 5.0, 25.0,
            "Fresh crispy cucumbers", true));
        products.add(createProduct("10", "Red Apples", "Fruits", "Organic", 7.0, 150.0,
            "Sweet and crisp red apples", true));
        products.add(createProduct("11", "Green Peas", "Vegetables", "Organic", 2.0, 50.0,
            "Fresh green peas", true));
        products.add(createProduct("12", "Potatoes", "Vegetables", "Conventional", 20.0, 20.0,
            "Fresh farm potatoes", true));
        
        return products;
    }

    private static Product createProduct(String id, String name, String category, 
                                       String type, double quantity, double pricePerKg,
                                       String description, boolean isApproved) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setCategory(category);
        product.setType(type);
        product.setQuantity(quantity);
        product.setPricePerKg(pricePerKg);
        product.setDescription(description);
        product.setApproved(isApproved);
        product.setImages(Arrays.asList("https://via.placeholder.com/300"));
        
        // Set mock farmer
        User farmer = new User();
        farmer.setId("farmer_1");
        farmer.setName("Sample Farmer");
        product.setFarmer(farmer);
        
        return product;
    }

    public static List<Order> getMockOrders() {
        List<Order> orders = new ArrayList<>();
        
        Order order1 = new Order();
        order1.setId("ORD001");
        order1.setTotalPrice(250.0);
        order1.setStatus("delivered");
        order1.setCreatedAt("2024-12-15");
        orders.add(order1);
        
        Order order2 = new Order();
        order2.setId("ORD002");
        order2.setTotalPrice(180.0);
        order2.setStatus("shipped");
        order2.setCreatedAt("2024-12-18");
        orders.add(order2);
        
        Order order3 = new Order();
        order3.setId("ORD003");
        order3.setTotalPrice(320.0);
        order3.setStatus("pending");
        order3.setCreatedAt("2024-12-20");
        orders.add(order3);
        
        return orders;
    }

    public static List<User> getMockUsers() {
        List<User> users = new ArrayList<>();
        
        User user1 = new User();
        user1.setId("user_1");
        user1.setName("John Customer");
        user1.setEmail("john@example.com");
        user1.setRole("customer");
        users.add(user1);
        
        User user2 = new User();
        user2.setId("user_2");
        user2.setName("Ramesh Farmer");
        user2.setEmail("ramesh@example.com");
        user2.setRole("farmer");
        user2.setFarmLocation("Pune, Maharashtra");
        user2.setVerified(true);
        users.add(user2);
        
        User user3 = new User();
        user3.setId("user_3");
        user3.setName("Sarah Farmer");
        user3.setEmail("sarah@example.com");
        user3.setRole("farmer");
        user3.setFarmLocation("Nashik, Maharashtra");
        user3.setVerified(false);
        users.add(user3);
        
        return users;
    }

    /**
     * Get dummy users with credentials for login validation
     * These are the predefined test accounts that can be used to login
     */
    public static List<User> getDummyUsers() {
        List<User> users = new ArrayList<>();
        
        // Customer Account
        User customer = new User();
        customer.setId("customer_001");
        customer.setName("John Customer");
        customer.setEmail("customer@croplink.com");
        customer.setPassword("customer123");
        customer.setRole("customer");
        customer.setVerified(true);
        users.add(customer);
        
        // Farmer Account
        User farmer = new User();
        farmer.setId("farmer_001");
        farmer.setName("Ramesh Farmer");
        farmer.setEmail("farmer@croplink.com");
        farmer.setPassword("farmer123");
        farmer.setRole("farmer");
        farmer.setFarmLocation("Pune, Maharashtra");
        farmer.setVerified(true);
        users.add(farmer);
        
        // Admin Account
        User admin = new User();
        admin.setId("admin_001");
        admin.setName("Admin User");
        admin.setEmail("admin@croplink.com");
        admin.setPassword("admin123");
        admin.setRole("admin");
        admin.setVerified(true);
        users.add(admin);
        
        return users;
    }

    /**
     * Validate user credentials against dummy users
     * @param email User email
     * @param password User password
     * @return true if credentials are valid, false otherwise
     */
    public static boolean validateCredentials(String email, String password) {
        List<User> dummyUsers = getDummyUsers();
        for (User user : dummyUsers) {
            if (user.getEmail().equalsIgnoreCase(email.trim()) && 
                user.getPassword().equals(password)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get user by email from dummy users
     * @param email User email
     * @return User object if found, null otherwise
     */
    public static User getUserByEmail(String email) {
        List<User> dummyUsers = getDummyUsers();
        for (User user : dummyUsers) {
            if (user.getEmail().equalsIgnoreCase(email.trim())) {
                return user;
            }
        }
        return null;
    }
}
