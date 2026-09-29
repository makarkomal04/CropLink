package com.croplink.customer;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.croplink.R;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.CartItem;
import com.croplink.models.Order;
import com.croplink.models.OrderRequest;
import com.croplink.models.User;
import com.croplink.utils.CartManager;
import com.croplink.utils.SessionManager;
import com.croplink.LoginActivity;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PaymentActivity extends AppCompatActivity {

    private TextView tvTotalAmount;
    private RadioGroup radioGroupPayment;
    private LinearLayout layoutCardDetails;
    private Button btnPayNow;
    private ProgressBar progressBar;
    
    private CartManager cartManager;
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;
    private double totalAmount;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        sessionManager = new SessionManager(this);
        cartManager = new CartManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        if (currentUser == null) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        totalAmount = getIntent().getDoubleExtra("TOTAL_AMOUNT", 0.0);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.payment);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        tvTotalAmount = findViewById(R.id.tvTotalAmount);
        radioGroupPayment = findViewById(R.id.radioGroupPayment);
        layoutCardDetails = findViewById(R.id.layoutCardDetails);
        btnPayNow = findViewById(R.id.btnPayNow);
        progressBar = findViewById(R.id.progressBar);

        tvTotalAmount.setText(String.format("%s%.2f", getString(R.string.rupee_symbol), totalAmount));

        radioGroupPayment.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.rbCreditCard) {
                layoutCardDetails.setVisibility(View.VISIBLE);
                btnPayNow.setText(R.string.pay_now);
            } else {
                layoutCardDetails.setVisibility(View.GONE);
                if (checkedId == R.id.rbCOD) {
                    btnPayNow.setText(R.string.place_order);
                } else {
                    btnPayNow.setText(R.string.pay_now);
                }
            }
        });

        btnPayNow.setOnClickListener(v -> processPayment());
    }

    private void processPayment() {
        btnPayNow.setEnabled(false);
        progressBar.setVisibility(View.VISIBLE);

        // Simulate payment processing delay
        new Handler().postDelayed(() -> {
            createOrder();
        }, 2000);
    }

    private void createOrder() {
        List<CartItem> cartItems = cartManager.getCartItems();
        if (cartItems.isEmpty()) {
            Toast.makeText(this, "Cart is empty", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        OrderRequest order = new OrderRequest();
        order.setCustomer(currentUser.getId());
        order.setTotalPrice(totalAmount);
        
        // Determine payment method
        int selectedId = radioGroupPayment.getCheckedRadioButtonId();
        if (selectedId == R.id.rbCreditCard) order.setPaymentMethod("Credit Card");
        else if (selectedId == R.id.rbUPI) order.setPaymentMethod("UPI");
        else order.setPaymentMethod("Cash on Delivery");

        List<OrderRequest.OrderItemRequest> orderItems = new ArrayList<>();
        for (CartItem item : cartItems) {
            OrderRequest.OrderItemRequest orderItem = new OrderRequest.OrderItemRequest();
            orderItem.setProduct(item.getProduct().getId());
            orderItem.setQty(item.getQuantity());
            orderItem.setPrice(item.getProduct().getPricePerKg());
            orderItem.setName(item.getProduct().getName()); 
            // Set farmer ID for revenue tracking
            if (item.getProduct().getFarmer() != null) {
                orderItem.setFarmer(item.getProduct().getFarmer().getId());
            } else if (item.getProduct().getFarmerId() != null) {
                orderItem.setFarmer(item.getProduct().getFarmerId());
            }
            orderItems.add(orderItem);
        }
        order.setOrderItems(orderItems);

        OrderRequest.ShippingAddressRequest address = new OrderRequest.ShippingAddressRequest();
        address.setAddress("123 Main St, Market Area"); 
        address.setCity("Pune");
        address.setPostalCode("411001");
        address.setCountry("India");
        order.setShippingAddress(address);

        String token = "Bearer " + currentUser.getToken();

        Log.d("PaymentActivity", "Creating order...");
        apiService.createOrder(token, order).enqueue(new Callback<Order>() {
            @Override
            public void onResponse(Call<Order> call, Response<Order> response) {
                progressBar.setVisibility(View.GONE);
                btnPayNow.setEnabled(true);
                Log.d("PaymentActivity", "Response Code: " + response.code());

                if (response.isSuccessful()) {
                    Log.d("PaymentActivity", "Order Created Successfully");
                    cartManager.clearCart();
                    Toast.makeText(PaymentActivity.this, getString(R.string.order_placed_successfully), Toast.LENGTH_LONG).show();
                    
                    Intent intent = new Intent(PaymentActivity.this, MyOrdersActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                } else {
                    try {
                        String errorBody = response.errorBody() != null ? response.errorBody().string() : "Unknown error";
                        Log.e("PaymentActivity", "Order Creation Failed: " + errorBody);
                        Toast.makeText(PaymentActivity.this, "Failed: " + response.message(), Toast.LENGTH_SHORT).show();
                    } catch (Exception e) {
                        Log.e("PaymentActivity", "Error parsing error body", e);
                    }
                }
            }

            @Override
            public void onFailure(Call<Order> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnPayNow.setEnabled(true);
                Log.e("PaymentActivity", "Network Error: ", t);
                Toast.makeText(PaymentActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    public void setPaymentMethod(String method) {
        // Helper for testing or future expansion
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
