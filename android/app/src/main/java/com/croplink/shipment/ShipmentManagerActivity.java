package com.croplink.shipment;

import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.adapters.ShipmentManagerAdapter;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Order;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ShipmentManagerActivity extends AppCompatActivity implements ShipmentManagerAdapter.OnShipmentActionListener {

    private RecyclerView recyclerView;
    private ShipmentManagerAdapter adapter;
    private List<Order> acceptedOrders = new ArrayList<>();
    private List<User> deliveryBoys = new ArrayList<>();
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_shipment_manager);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.shipment_management);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

//        progressBar = findViewById(R.id.progressBar); // If exists in layout

        recyclerView = findViewById(R.id.recyclerViewShipments);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ShipmentManagerAdapter(this, acceptedOrders, deliveryBoys, this);
        recyclerView.setAdapter(adapter);

        fetchData();
    }

    private void fetchData() {
        if (currentUser == null || currentUser.getToken() == null) return;
        String token = "Bearer " + currentUser.getToken();

        // Fetch Accepted Orders
        apiService.getAcceptedOrders(token).enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(@NonNull Call<List<Order>> call, @NonNull Response<List<Order>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    acceptedOrders.clear();
                    acceptedOrders.addAll(response.body());
                    adapter.notifyDataSetChanged();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Order>> call, @NonNull Throwable t) {
                Toast.makeText(ShipmentManagerActivity.this, "Error fetching orders", Toast.LENGTH_SHORT).show();
            }
        });

        // Fetch Delivery Boys
        apiService.getDeliveryBoys(token).enqueue(new Callback<List<User>>() {
            @Override
            public void onResponse(@NonNull Call<List<User>> call, @NonNull Response<List<User>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    deliveryBoys.clear();
                    deliveryBoys.addAll(response.body());
                    adapter.updateDeliveryBoys(deliveryBoys);
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<User>> call, @NonNull Throwable t) {
                Toast.makeText(ShipmentManagerActivity.this, "Error fetching delivery boys", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onAssign(Order order, String deliveryBoyId) {
        if (currentUser == null || currentUser.getToken() == null) return;
        String token = "Bearer " + currentUser.getToken();

        Map<String, String> body = new HashMap<>();
        body.put("deliveryBoyId", deliveryBoyId);

        apiService.assignDeliveryBoy(token, order.getId(), body).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(@NonNull Call<Map<String, Object>> call, @NonNull Response<Map<String, Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ShipmentManagerActivity.this, "Delivery boy assigned", Toast.LENGTH_SHORT).show();
                    fetchData();
                } else {
                    Toast.makeText(ShipmentManagerActivity.this, "Failed to assign", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Map<String, Object>> call, @NonNull Throwable t) {
                Toast.makeText(ShipmentManagerActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onShip(Order order) {
        if (currentUser == null || currentUser.getToken() == null) return;
        String token = "Bearer " + currentUser.getToken();

        apiService.markAsShipped(token, order.getId()).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(@NonNull Call<Map<String, Object>> call, @NonNull Response<Map<String, Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ShipmentManagerActivity.this, "Order marked as Shipped", Toast.LENGTH_SHORT).show();
                    fetchData();
                } else {
                    Toast.makeText(ShipmentManagerActivity.this, "Failed to mark as shipped", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Map<String, Object>> call, @NonNull Throwable t) {
                Toast.makeText(ShipmentManagerActivity.this, "Network error", Toast.LENGTH_SHORT).show();
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
