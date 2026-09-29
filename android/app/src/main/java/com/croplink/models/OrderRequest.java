package com.croplink.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class OrderRequest {
    @SerializedName("customer")
    private String customer;
    @SerializedName("orderItems")
    private List<OrderItemRequest> orderItems;
    @SerializedName("shippingAddress")
    private ShippingAddressRequest shippingAddress;
    @SerializedName("totalPrice")
    private double totalPrice;
    @SerializedName("paymentMethod")
    private String paymentMethod = "Cash on Delivery";

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }

    public List<OrderItemRequest> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItemRequest> orderItems) { this.orderItems = orderItems; }

    public ShippingAddressRequest getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(ShippingAddressRequest shippingAddress) { this.shippingAddress = shippingAddress; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public static class OrderItemRequest {
        @SerializedName("product")
        private String product;
        @SerializedName("name")
        private String name;
        @SerializedName("qty")
        private int qty;
        @SerializedName("price")
        private double price;
        @SerializedName("farmer")
        private String farmer;

        public String getProduct() { return product; }
        public void setProduct(String product) { this.product = product; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public int getQty() { return qty; }
        public void setQty(int qty) { this.qty = qty; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }

        public String getFarmer() { return farmer; }
        public void setFarmer(String farmer) { this.farmer = farmer; }
    }

    public static class ShippingAddressRequest {
        @SerializedName("address")
        private String address;
        @SerializedName("city")
        private String city;
        @SerializedName("postalCode")
        private String postalCode;
        @SerializedName("country")
        private String country;

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
    }
}
