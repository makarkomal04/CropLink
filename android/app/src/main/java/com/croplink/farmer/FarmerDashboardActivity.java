package com.croplink.farmer;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.LoginActivity;
import com.croplink.adapters.ProductAdapter;
import com.croplink.models.Product;
import com.croplink.utils.SessionManager;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import java.util.List;

import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.customer.WalletActivity;
import com.croplink.models.User;
import java.util.ArrayList;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FarmerDashboardActivity extends AppCompatActivity implements ProductAdapter.OnProductClickListener {

    private RecyclerView recyclerView;
    private ProductAdapter adapter;
    private TextView tvTotalProducts, tvRevenue;
    private FloatingActionButton fabAddProduct;
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;
    private List<Product> productList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_farmer_dashboard);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.farmer_dashboard);

        tvTotalProducts = findViewById(R.id.tvTotalProducts);
        tvRevenue = findViewById(R.id.tvRevenue);
        recyclerView = findViewById(R.id.recyclerViewProducts);
        fabAddProduct = findViewById(R.id.fabAddProduct);

        setupRecyclerView();
        fetchProducts();
        fetchRevenue();

        fabAddProduct.setOnClickListener(v -> {
            startActivity(new Intent(this, AddProductActivity.class));
        });
    }

    private void setupRecyclerView() {
        recyclerView.setLayoutManager(new GridLayoutManager(this, 2));
        adapter = new ProductAdapter(this, productList, this, true);
        recyclerView.setAdapter(adapter);
    }

    private void fetchProducts() {
        apiService.getProducts().enqueue(new Callback<List<Product>>() {
            @Override
            public void onResponse(Call<List<Product>> call, Response<List<Product>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    productList.clear();
                    // Filter products for this farmer
                    for (Product p : response.body()) {
                        if (p.getFarmer() != null && p.getFarmer().getId().equals(currentUser.getId())) {
                            productList.add(p);
                        } else if (p.getFarmerId() != null && p.getFarmerId().equals(currentUser.getId())) {
                            productList.add(p);
                        }
                    }
                    adapter.updateData(productList);
                    tvTotalProducts.setText(String.valueOf(productList.size()));
                }
            }

            @Override
            public void onFailure(Call<List<Product>> call, Throwable t) {
                Toast.makeText(FarmerDashboardActivity.this, "Failed to fetch products", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void fetchRevenue() {
        String token = "Bearer " + currentUser.getToken();
        apiService.getFarmerRevenue(token).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Object totalRev = response.body().get("totalRevenue");
                    tvRevenue.setText(String.format("%s%.2f", getString(R.string.rupee_symbol), Double.parseDouble(totalRev.toString())));
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                // Silently fail or log
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchProducts();
        fetchRevenue();
    }

    @Override
    public void onAddToCart(Product product) {
        new androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle(R.string.delete)
            .setMessage(R.string.confirm_delete)
            .setPositiveButton(R.string.yes, (dialog, which) -> deleteProduct(product))
            .setNegativeButton(R.string.no, null)
            .show();
    }

    private void deleteProduct(Product product) {
        String token = "Bearer " + currentUser.getToken();
        apiService.deleteProduct(token, product.getId()).enqueue(new Callback<okhttp3.ResponseBody>() {
            @Override
            public void onResponse(Call<okhttp3.ResponseBody> call, Response<okhttp3.ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(FarmerDashboardActivity.this, R.string.product_deleted, Toast.LENGTH_SHORT).show();
                    fetchProducts();
                } else {
                    Toast.makeText(FarmerDashboardActivity.this, "Failed to delete product", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<okhttp3.ResponseBody> call, Throwable t) {
                Toast.makeText(FarmerDashboardActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_farmer, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        
        if (id == R.id.action_orders) {
            startActivity(new Intent(this, FarmerOrdersActivity.class));
            return true;
        } else if (id == R.id.action_revenue) {
            startActivity(new Intent(this, FarmerRevenueActivity.class));
            return true;
        } else if (id == R.id.action_wallet) {
            startActivity(new Intent(this, WalletActivity.class));
            return true;
        } else if (id == R.id.action_logout) {
            sessionManager.logoutUser();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return true;
        }
        
        return super.onOptionsItemSelected(item);
    }
}
