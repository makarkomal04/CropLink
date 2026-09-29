package com.croplink.admin;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.croplink.R;
import com.croplink.LoginActivity;

import com.croplink.utils.SessionManager;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.User;
import com.croplink.models.Product;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AdminDashboardActivity extends AppCompatActivity {
    
    private TextView tvTotalUsers, tvTotalOrders, tvPendingProducts;
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_dashboard);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.admin_dashboard);

        tvTotalUsers = findViewById(R.id.tvTotalUsers);
        tvTotalOrders = findViewById(R.id.tvTotalOrders);
        tvPendingProducts = findViewById(R.id.tvPendingProducts);

        findViewById(R.id.cardUsers).setOnClickListener(v -> 
            startActivity(new Intent(this, UserManagementActivity.class)));
        findViewById(R.id.cardProducts).setOnClickListener(v -> 
            startActivity(new Intent(this, ProductApprovalsActivity.class)));
        findViewById(R.id.cardWarehouse).setOnClickListener(v -> 
            startActivity(new Intent(this, WarehouseActivity.class)));
        
        fetchStats();
    }

    private void fetchStats() {
        if (currentUser == null || currentUser.getToken() == null) return;
        String token = "Bearer " + currentUser.getToken();

        // Fetch users count
        apiService.getAllUsers(token).enqueue(new Callback<List<User>>() {
            @Override
            public void onResponse(Call<List<User>> call, Response<List<User>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    tvTotalUsers.setText(String.valueOf(response.body().size()));
                }
            }
            @Override
            public void onFailure(Call<List<User>> call, Throwable t) {}
        });

        // Fetch products for pending count
        apiService.getProducts().enqueue(new Callback<List<Product>>() {
            @Override
            public void onResponse(Call<List<Product>> call, Response<List<Product>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    int pendingCount = 0;
                    for (Product p : response.body()) {
                        if (p.getApprovalStatus() == null || (!p.isApproved() && !"approved".equalsIgnoreCase(p.getApprovalStatus()))) {
                            pendingCount++;
                        }
                    }
                    tvPendingProducts.setText(String.valueOf(pendingCount));
                }
            }
            @Override
            public void onFailure(Call<List<Product>> call, Throwable t) {}
        });

        // Fetch warehouse stats for total orders
        apiService.getWarehouseStats(token).enqueue(new Callback<Map<String, Integer>>() {
            @Override
            public void onResponse(Call<Map<String, Integer>> call, Response<Map<String, Integer>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    int total = 0;
                    for (Integer val : response.body().values()) total += val;
                    tvTotalOrders.setText(String.valueOf(total));
                }
            }
            @Override
            public void onFailure(Call<Map<String, Integer>> call, Throwable t) {}
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchStats();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_admin, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.action_logout) {
            new SessionManager(this).logoutUser();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
