package com.croplink.admin;

import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.adapters.ProductApprovalAdapter;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Product;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProductApprovalsActivity extends AppCompatActivity implements ProductApprovalAdapter.OnProductActionListener {

    private RecyclerView recyclerView;
    private ProductApprovalAdapter adapter;
    private List<Product> pendingProducts = new ArrayList<>();
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_product_approvals);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.product_approvals);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        recyclerView = findViewById(R.id.recyclerViewProducts);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ProductApprovalAdapter(this, pendingProducts, this);
        recyclerView.setAdapter(adapter);

        fetchPendingProducts();
    }

    private void fetchPendingProducts() {
        apiService.getProducts().enqueue(new Callback<List<Product>>() {
            @Override
            public void onResponse(Call<List<Product>> call, Response<List<Product>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    pendingProducts.clear();
                    for (Product p : response.body()) {
                        if (p.getApprovalStatus() == null || (!p.isApproved() && !"approved".equalsIgnoreCase(p.getApprovalStatus()))) {
                            pendingProducts.add(p);
                        }
                    }
                    adapter.notifyDataSetChanged();
                    
                    if (pendingProducts.isEmpty()) {
                        Toast.makeText(ProductApprovalsActivity.this, "No pending approvals", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(ProductApprovalsActivity.this, "Failed to load products", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Product>> call, Throwable t) {
                Toast.makeText(ProductApprovalsActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onApprove(Product product) {
        String token = "Bearer " + currentUser.getToken();
        apiService.approveProduct(token, product.getId()).enqueue(new Callback<Product>() {
            @Override
            public void onResponse(Call<Product> call, Response<Product> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ProductApprovalsActivity.this, "Product Approved", Toast.LENGTH_SHORT).show();
                    pendingProducts.remove(product);
                    adapter.notifyDataSetChanged();
                } else {
                    Toast.makeText(ProductApprovalsActivity.this, "Failed to approve", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Product> call, Throwable t) {
                Toast.makeText(ProductApprovalsActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onReject(Product product) {
        String token = "Bearer " + currentUser.getToken();
        // Assuming reject API exists or using delete for now as per previous context
        // Checking ApiService, we have rejectProduct which calls DELETE admin/products/{id}
        apiService.rejectProduct(token, product.getId()).enqueue(new Callback<ResponseBody>() {
            @Override
            public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ProductApprovalsActivity.this, "Product Rejected", Toast.LENGTH_SHORT).show();
                    pendingProducts.remove(product);
                    adapter.notifyDataSetChanged();
                } else {
                    Toast.makeText(ProductApprovalsActivity.this, "Failed to reject", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ResponseBody> call, Throwable t) {
                Toast.makeText(ProductApprovalsActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
