package com.croplink.delivery;

import android.os.Bundle;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.adapters.DeliveryBoyAdapter;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Order;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;
import com.google.android.material.tabs.TabLayout;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DeliveryBoyActivity extends AppCompatActivity implements DeliveryBoyAdapter.OnDeliveryActionListener {

    private RecyclerView recyclerView;
    private DeliveryBoyAdapter adapter;
    private List<Order> displayOrders = new ArrayList<>();
    private List<Order> pendingOrders = new ArrayList<>();
    private List<Order> completedOrders = new ArrayList<>();
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;
    private TabLayout tabLayout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_delivery_boy);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.my_deliveries);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        tabLayout = findViewById(R.id.tabLayout);
        tabLayout.addTab(tabLayout.newTab().setText(R.string.tab_pending));
        tabLayout.addTab(tabLayout.newTab().setText(R.string.tab_completed));

        recyclerView = findViewById(R.id.recyclerViewDeliveries);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new DeliveryBoyAdapter(this, displayOrders, this);
        recyclerView.setAdapter(adapter);

        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                updateDisplayList(tab.getPosition());
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}

            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });

        fetchData();
    }

    private void fetchData() {
        if (currentUser == null || currentUser.getToken() == null) return;
        String token = "Bearer " + currentUser.getToken();

        // Fetch Pending Deliveries
        apiService.getMyDeliveries(token).enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(@NonNull Call<List<Order>> call, @NonNull Response<List<Order>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    pendingOrders.clear();
                    pendingOrders.addAll(response.body());
                    if (tabLayout.getSelectedTabPosition() == 0) {
                        updateDisplayList(0);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Order>> call, @NonNull Throwable t) {
                Toast.makeText(DeliveryBoyActivity.this, "Error fetching pending deliveries", Toast.LENGTH_SHORT).show();
            }
        });

        // Fetch Completed Deliveries
        apiService.getMyCompletedDeliveries(token).enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(@NonNull Call<List<Order>> call, @NonNull Response<List<Order>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    completedOrders.clear();
                    completedOrders.addAll(response.body());
                    if (tabLayout.getSelectedTabPosition() == 1) {
                        updateDisplayList(1);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Order>> call, @NonNull Throwable t) {
                Toast.makeText(DeliveryBoyActivity.this, "Error fetching completed deliveries", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateDisplayList(int position) {
        displayOrders.clear();
        if (position == 0) {
            displayOrders.addAll(pendingOrders);
        } else {
            displayOrders.addAll(completedOrders);
        }
        adapter.notifyDataSetChanged();
    }

    @Override
    public void onMarkDelivered(Order order) {
        if (currentUser == null || currentUser.getToken() == null) return;
        String token = "Bearer " + currentUser.getToken();

        apiService.markAsDelivered(token, order.getId()).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(@NonNull Call<Map<String, Object>> call, @NonNull Response<Map<String, Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(DeliveryBoyActivity.this, "Order marked as Delivered!", Toast.LENGTH_SHORT).show();
                    fetchData();
                } else {
                    Toast.makeText(DeliveryBoyActivity.this, "Failed to update status", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Map<String, Object>> call, @NonNull Throwable t) {
                Toast.makeText(DeliveryBoyActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
