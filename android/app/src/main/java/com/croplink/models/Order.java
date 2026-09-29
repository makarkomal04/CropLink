package com.croplink.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class Order {
    @SerializedName("_id")
    private String id;
    private com.google.gson.JsonElement customer;
    private String customerId;
    
    @SerializedName("orderItems")
    private List<OrderItem> items;
    private double totalPrice;
    private String status; // pending, processing, shipped, delivered, cancelled
    private String warehouseStatus;
    private ShippingAddress shippingAddress;
    private boolean isPaid;
    private String paidAt;
    private boolean isDelivered;
    private String deliveredAt;
    
    // Shipment & Delivery fields
    private com.google.gson.JsonElement assignedDeliveryBoy;
    private String shippedAt;
    private String rejectionReason;
    
    // Blockchain fields
    private String blockchainTxHash;
    private String blockchainOrderId;
    private boolean onBlockchain;
    
    private String createdAt;
    private String updatedAt;

    // Constructors
    public Order() {
    }

    public Order(String id, String customerId, double totalPrice, String status) {
        this.id = id;
        this.customerId = customerId;
        this.totalPrice = totalPrice;
        this.status = status;
    }

    // Inner class for order items
    public static class OrderItem {
        private com.google.gson.JsonElement product;
        private String productId;
        private String name;
        @SerializedName("qty")
        private int quantity;
        private double price;

        public OrderItem() {
        }

        public OrderItem(Product product, int quantity, double price) {
            this.product = new com.google.gson.Gson().toJsonTree(product);
            this.productId = product != null ? product.getId() : null;
            this.name = product != null ? product.getName() : null;
            this.quantity = quantity;
            this.price = price;
        }

        // Getters and Setters
        public Product getProduct() {
            if (product != null && product.isJsonObject()) {
                return new com.google.gson.Gson().fromJson(product, Product.class);
            }
            return null;
        }

        public void setProduct(com.google.gson.JsonElement product) {
            this.product = product;
        }

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public double getPrice() {
            return price;
        }

        public void setPrice(double price) {
            this.price = price;
        }
    }
    
    public static class ShippingAddress {
        private String address;
        private String city;
        private String postalCode;
        private String country;
        
        // Getters and Setters
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getCustomer() {
        if (customer != null && customer.isJsonObject()) {
            return new com.google.gson.Gson().fromJson(customer, User.class);
        }
        return null;
    }

    public void setCustomer(com.google.gson.JsonElement customer) {
        this.customer = customer;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getWarehouseStatus() {
        return warehouseStatus;
    }

    public void setWarehouseStatus(String warehouseStatus) {
        this.warehouseStatus = warehouseStatus;
    }

    public ShippingAddress getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(ShippingAddress shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public boolean isPaid() {
        return isPaid;
    }

    public void setPaid(boolean paid) {
        isPaid = paid;
    }

    public String getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(String paidAt) {
        this.paidAt = paidAt;
    }

    public boolean isDelivered() {
        return isDelivered;
    }

    public void setDelivered(boolean delivered) {
        isDelivered = delivered;
    }

    public String getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(String deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getBlockchainTxHash() {
        return blockchainTxHash;
    }

    public void setBlockchainTxHash(String blockchainTxHash) {
        this.blockchainTxHash = blockchainTxHash;
    }

    public String getBlockchainOrderId() {
        return blockchainOrderId;
    }

    public void setBlockchainOrderId(String blockchainOrderId) {
        this.blockchainOrderId = blockchainOrderId;
    }

    public boolean isOnBlockchain() {
        return onBlockchain;
    }

    public void setOnBlockchain(boolean onBlockchain) {
        this.onBlockchain = onBlockchain;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getAssignedDeliveryBoy() {
        if (assignedDeliveryBoy != null && assignedDeliveryBoy.isJsonObject()) {
            return new com.google.gson.Gson().fromJson(assignedDeliveryBoy, User.class);
        }
        return null;
    }

    public void setAssignedDeliveryBoy(com.google.gson.JsonElement assignedDeliveryBoy) {
        this.assignedDeliveryBoy = assignedDeliveryBoy;
    }

    public String getShippedAt() {
        return shippedAt;
    }

    public void setShippedAt(String shippedAt) {
        this.shippedAt = shippedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
