package com.croplink.farmer;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.adapters.OrderAdapter;

import android.view.View;
import android.widget.TextView;
import android.widget.Toast;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Order;
import com.croplink.models.User;
import com.croplink.models.Product;
import com.croplink.utils.SessionManager;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FarmerOrdersActivity extends AppCompatActivity {
    
    private RecyclerView recyclerView;
    private OrderAdapter adapter;
    private TextView tvNoOrders;
    private List<Order> orderList = new ArrayList<>();
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_farmer_orders);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.farmer_orders);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        recyclerView = findViewById(R.id.recyclerViewOrders);
        // Assuming there is a tvNoOrders in the layout, if not I might need to add it or ignore
        // Checking previous view of MyOrdersActivity layout, it had one. FarmerOrdersActivity uses R.layout.activity_farmer_orders
        // I should check activity_farmer_orders.xml first to be safe, but for now I'll use simple recyclerview if tv doesn't exist
        // To be safe, I'll only use recyclerView for now or check if generic layout is used.
        // Let's assume layout is simple.
        
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new OrderAdapter(this, orderList);
        recyclerView.setAdapter(adapter);

        fetchOrders();
    }

    private void fetchOrders() {
        if (currentUser == null || currentUser.getToken() == null) return;
        String token = "Bearer " + currentUser.getToken();

        apiService.getOrders(token).enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(Call<List<Order>> call, Response<List<Order>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    orderList.clear();
                    
                    // Filter orders that contain products from this farmer
                    for (Order order : response.body()) {
                        if (order.getItems() != null) {
                            for (Order.OrderItem item : order.getItems()) {
                                Product p = item.getProduct();
                                if (p != null) {
                                    if ((p.getFarmer() != null && p.getFarmer().getId().equals(currentUser.getId())) ||
                                        (p.getFarmerId() != null && p.getFarmerId().equals(currentUser.getId()))) {
                                        orderList.add(order);
                                        break; // Add order once
                                    }
                                }
                            }
                        }
                    }
                    
                    adapter.notifyDataSetChanged();
                    
                    if (orderList.isEmpty()) {
                        Toast.makeText(FarmerOrdersActivity.this, "No orders found", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(FarmerOrdersActivity.this, "Failed: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Order>> call, Throwable t) {
                Toast.makeText(FarmerOrdersActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
