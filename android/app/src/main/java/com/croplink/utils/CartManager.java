package com.croplink.utils;

import android.content.Context;
import com.croplink.models.CartItem;
import com.croplink.models.Product;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import android.content.SharedPreferences;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class CartManager {
    private static final String PREF_NAME = "CartPreferences";
    private static final String KEY_CART_ITEMS = "cartItems";
    
    private SharedPreferences pref;
    private SharedPreferences.Editor editor;
    private Gson gson;

    public CartManager(Context context) {
        pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = pref.edit();
        gson = new Gson();
    }

    // Add product to cart
    public void addToCart(Product product, int quantity) {
        if (product == null || product.getId() == null) return;

        List<CartItem> cartItems = getCartItems();
        
        // Check if product already exists in cart
        boolean found = false;
        for (CartItem item : cartItems) {
            if (item.getProduct() != null && item.getProduct().getId() != null &&
                item.getProduct().getId().equals(product.getId())) {
                item.setQuantity(item.getQuantity() + quantity);
                found = true;
                break;
            }
        }
        
        // If not found, add new item
        if (!found) {
            cartItems.add(new CartItem(product, quantity));
        }
        
        saveCartItems(cartItems);
    }

    // Remove product from cart
    public void removeFromCart(Product product) {
        if (product == null || product.getId() == null) return;

        List<CartItem> cartItems = getCartItems();
        cartItems.removeIf(item -> item.getProduct() != null && 
                                 item.getProduct().getId() != null && 
                                 item.getProduct().getId().equals(product.getId()));
        saveCartItems(cartItems);
    }

    // Update quantity
    public void updateQuantity(Product product, int quantity) {
        if (product == null || product.getId() == null) return;

        List<CartItem> cartItems = getCartItems();
        for (CartItem item : cartItems) {
            if (item.getProduct() != null && item.getProduct().getId() != null &&
                item.getProduct().getId().equals(product.getId())) {
                item.setQuantity(quantity);
                break;
            }
        }
        saveCartItems(cartItems);
    }

    // Get all cart items
    public List<CartItem> getCartItems() {
        String json = pref.getString(KEY_CART_ITEMS, null);
        if (json == null) {
            return new ArrayList<>();
        }
        
        Type type = new TypeToken<List<CartItem>>(){}.getType();
        List<CartItem> items = gson.fromJson(json, type);
        
        if (items == null) return new ArrayList<>();
        
        // Filter out invalid items
        items.removeIf(item -> item.getProduct() == null || item.getProduct().getId() == null);
        
        return items;
    }

    // Get cart count
    public int getCartCount() {
        return getCartItems().size();
    }

    // Get total amount
    public double getTotalAmount() {
        List<CartItem> items = getCartItems();
        double total = 0;
        for (CartItem item : items) {
            total += item.getTotalPrice();
        }
        return total;
    }

    // Clear cart
    public void clearCart() {
        editor.remove(KEY_CART_ITEMS);
        editor.apply();
    }

    // Save cart items
    private void saveCartItems(List<CartItem> items) {
        String json = gson.toJson(items);
        editor.putString(KEY_CART_ITEMS, json);
        editor.apply();
    }
}
