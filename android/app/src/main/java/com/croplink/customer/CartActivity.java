package com.croplink.customer;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.adapters.CartAdapter;
import com.croplink.models.CartItem;
import com.croplink.utils.CartManager;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Order;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;
import com.croplink.LoginActivity;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CartActivity extends AppCompatActivity implements CartAdapter.OnCartItemListener {

    private RecyclerView recyclerView;
    private CartAdapter adapter;
    private TextView tvSubtotal, tvTotal, tvEmptyCart;
    private Button btnCheckout;
    private LinearLayout layoutCheckout;
    private CartManager cartManager;
    private List<CartItem> cartItems;
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cart);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();
        cartManager = new CartManager(this);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.my_cart);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        recyclerView = findViewById(R.id.recyclerViewCart);
        tvSubtotal = findViewById(R.id.tvSubtotal);
        tvTotal = findViewById(R.id.tvTotal);
        tvEmptyCart = findViewById(R.id.tvEmptyCart);
        btnCheckout = findViewById(R.id.btnCheckout);
        layoutCheckout = findViewById(R.id.layoutCheckout);

        loadCartItems();

        btnCheckout.setOnClickListener(v -> checkout());
    }

    private void loadCartItems() {
        cartItems = cartManager.getCartItems();

        if (cartItems.isEmpty()) {
            tvEmptyCart.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.GONE);
            layoutCheckout.setVisibility(View.GONE);
        } else {
            tvEmptyCart.setVisibility(View.GONE);
            recyclerView.setVisibility(View.VISIBLE);
            layoutCheckout.setVisibility(View.VISIBLE);

            recyclerView.setLayoutManager(new LinearLayoutManager(this));
            adapter = new CartAdapter(this, cartItems, this);
            recyclerView.setAdapter(adapter);

            updateTotals();
        }
    }

    private void updateTotals() {
        double total = cartManager.getTotalAmount();
        tvSubtotal.setText(String.format("%s%.2f", getString(R.string.rupee_symbol), total));
        tvTotal.setText(String.format("%s%.2f", getString(R.string.rupee_symbol), total));
    }

    @Override
    public void onQuantityChanged(CartItem item, int newQuantity) {
        cartManager.updateQuantity(item.getProduct(), newQuantity);
        loadCartItems();
    }

    @Override
    public void onRemoveItem(CartItem item) {
        cartManager.removeFromCart(item.getProduct());
        Toast.makeText(this, getString(R.string.item_removed), Toast.LENGTH_SHORT).show();
        loadCartItems();
    }

    private void checkout() {
        if (currentUser == null || currentUser.getToken() == null) {
            Toast.makeText(this, "Please login to checkout", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, LoginActivity.class));
            return;
        }

        if (cartItems.isEmpty()) return;

        Intent intent = new Intent(this, PaymentActivity.class);
        intent.putExtra("TOTAL_AMOUNT", cartManager.getTotalAmount());
        startActivity(intent);
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
