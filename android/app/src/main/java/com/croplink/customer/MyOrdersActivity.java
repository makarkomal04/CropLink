package com.croplink.customer;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.adapters.OrderAdapter;
import com.croplink.models.Order;
import android.widget.Toast;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MyOrdersActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private OrderAdapter adapter;
    private TextView tvNoOrders;
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;
    private List<Order> orderList = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_orders);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.my_orders);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        recyclerView = findViewById(R.id.recyclerViewOrders);
        tvNoOrders = findViewById(R.id.tvNoOrders);

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new OrderAdapter(this, orderList);
        recyclerView.setAdapter(adapter);

        loadOrders();
    }

    private void loadOrders() {
        if (currentUser == null || currentUser.getToken() == null) {
            Log.e("MyOrdersActivity", "User or token is null");
            return;
        }
        String token = "Bearer " + currentUser.getToken();
        Log.d("MyOrdersActivity", "Loading orders with token: " + token);

        apiService.getMyOrders(token).enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(Call<List<Order>> call, Response<List<Order>> response) {
                Log.d("MyOrdersActivity", "Response Code: " + response.code());
                if (response.isSuccessful() && response.body() != null) {
                    List<Order> orders = response.body();
                    Log.d("MyOrdersActivity", "Orders received: " + orders.size());
                    
                    orderList.clear();
                    orderList.addAll(orders);
                    adapter.notifyDataSetChanged();

                    if (orderList.isEmpty()) {
                        Log.d("MyOrdersActivity", "Order list is empty");
                        tvNoOrders.setVisibility(View.VISIBLE);
                        recyclerView.setVisibility(View.GONE);
                    } else {
                        Log.d("MyOrdersActivity", "Showing " + orderList.size() + " orders");
                        tvNoOrders.setVisibility(View.GONE);
                        recyclerView.setVisibility(View.VISIBLE);
                    }
                } else {
                    try {
                        String error = response.errorBody() != null ? response.errorBody().string() : "Unknown error";
                        Log.e("MyOrdersActivity", "Failed to load orders: " + error);
                    } catch (Exception e) {
                        Log.e("MyOrdersActivity", "Error parsing error", e);
                    }
                    Toast.makeText(MyOrdersActivity.this, "Failed: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Order>> call, Throwable t) {
                Log.e("MyOrdersActivity", "Network Error loading orders", t);
                Toast.makeText(MyOrdersActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
