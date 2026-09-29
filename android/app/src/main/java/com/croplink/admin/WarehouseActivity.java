package com.croplink.admin;

import android.os.Bundle;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.adapters.WarehouseOrderAdapter;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Order;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;
import com.google.android.material.tabs.TabLayout;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class WarehouseActivity extends AppCompatActivity implements WarehouseOrderAdapter.OnOrderActionListener {

    private RecyclerView recyclerView;
    private WarehouseOrderAdapter adapter;
    private List<Order> allOrders = new ArrayList<>();
    private List<Order> displayOrders = new ArrayList<>();
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;
    private TabLayout tabLayout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_warehouse);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.warehouse_management);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        tabLayout = findViewById(R.id.tabLayout);
        tabLayout.addTab(tabLayout.newTab().setText(R.string.tab_pending));
        tabLayout.addTab(tabLayout.newTab().setText(R.string.tab_accepted));
        tabLayout.addTab(tabLayout.newTab().setText(R.string.tab_rejected));

        recyclerView = findViewById(R.id.recyclerViewOrders);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new WarehouseOrderAdapter(this, displayOrders, this);
        recyclerView.setAdapter(adapter);

        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                filterOrders(tab.getPosition());
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}

            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });

        fetchOrders();
    }

    private void fetchOrders() {
        if (currentUser == null || currentUser.getToken() == null) return;
        String token = "Bearer " + currentUser.getToken();

        apiService.getWarehouseAllOrders(token).enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(@NonNull Call<List<Order>> call, @NonNull Response<List<Order>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allOrders.clear();
                    allOrders.addAll(response.body());
                    filterOrders(tabLayout.getSelectedTabPosition());
                } else {
                    Toast.makeText(WarehouseActivity.this, "Failed to fetch orders", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Order>> call, @NonNull Throwable t) {
                Toast.makeText(WarehouseActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void filterOrders(int position) {
        displayOrders.clear();
        for (Order order : allOrders) {
            String status = order.getStatus() != null ? order.getStatus().toLowerCase() : "";
            String wStatus = order.getWarehouseStatus() != null ? order.getWarehouseStatus().toLowerCase() : "";

            switch (position) {
                case 0: // Pending
                    if (status.equals("pending")) displayOrders.add(order);
                    break;
                case 1: // Accepted
                    if (wStatus.equals("passed") || wStatus.equals("quality passed")) displayOrders.add(order);
                    break;
                case 2: // Rejected
                    if (wStatus.equals("failed") || wStatus.equals("rejected")) displayOrders.add(order);
                    break;
            }
        }
        adapter.notifyDataSetChanged();
    }

    @Override
    public void onAccept(Order order) {
        performOrderAction(order, "accept");
    }

    @Override
    public void onReject(Order order) {
        performOrderAction(order, "reject");
    }

    @Override
    public void onShip(Order order) {
        // Handled by Shipment Manager now, but keeping for compatibility if admin wants to ship
        performOrderAction(order, "ship");
    }

    @Override
    public void onDeliver(Order order) {
        performOrderAction(order, "deliver");
    }

    private void performOrderAction(Order order, String action) {
        String token = "Bearer " + currentUser.getToken();
        Call<Map<String, Object>> call;
        Map<String, String> body = new HashMap<>();
        
        switch (action) {
            case "accept":
                call = apiService.acceptOrder(token, order.getId(), body);
                break;
            case "reject":
                body.put("reason", "Rejected via Android Warehouse");
                call = apiService.rejectOrder(token, order.getId(), body);
                break;
            case "ship":
                call = apiService.markForShipping(token, order.getId(), body);
                break;
            case "deliver":
                call = apiService.confirmDelivery(token, order.getId());
                break;
            default:
                return;
        }

        String successMsg;
        switch (action) {
            case "accept": successMsg = "Order accepted successfully"; break;
            case "reject": successMsg = "Order rejected successfully"; break;
            case "ship":   successMsg = "Order marked for shipping"; break;
            case "deliver": successMsg = "Delivery confirmed"; break;
            default: successMsg = "Action completed"; break;
        }
        final String finalSuccessMsg = successMsg;

        call.enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(@NonNull Call<Map<String, Object>> call, @NonNull Response<Map<String, Object>> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(WarehouseActivity.this, finalSuccessMsg, Toast.LENGTH_SHORT).show();
                    fetchOrders();
                } else {
                    Toast.makeText(WarehouseActivity.this, "Failed to " + action + " order (code: " + response.code() + ")", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Map<String, Object>> call, @NonNull Throwable t) {
                Toast.makeText(WarehouseActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
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
