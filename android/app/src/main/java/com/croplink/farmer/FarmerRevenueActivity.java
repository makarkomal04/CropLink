package com.croplink.farmer;

import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.croplink.R;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;

import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class FarmerRevenueActivity extends AppCompatActivity {

    private TextView tvTotalRevenue, tvTotalOrders, tvAvgOrderValue, tvNoTopProducts, tvNoChartData;
    private LinearLayout layoutTopProducts, layoutMonthlyRevenue;
    private ProgressBar progressBar;
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_farmer_revenue);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Revenue & Statistics");
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        // Initialize views
        tvTotalRevenue = findViewById(R.id.tvTotalRevenue);
        tvTotalOrders = findViewById(R.id.tvTotalOrders);
        tvAvgOrderValue = findViewById(R.id.tvAvgOrderValue);
        tvNoTopProducts = findViewById(R.id.tvNoTopProducts);
        tvNoChartData = findViewById(R.id.tvNoChartData);
        layoutTopProducts = findViewById(R.id.layoutTopProducts);
        layoutMonthlyRevenue = findViewById(R.id.layoutMonthlyRevenue);
        progressBar = findViewById(R.id.progressBar);

        fetchRevenueData();
    }

    private void fetchRevenueData() {
        progressBar.setVisibility(View.VISIBLE);
        String token = "Bearer " + currentUser.getToken();

        apiService.getFarmerRevenue(token).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> data = response.body();
                    displayData(data);
                } else {
                    Toast.makeText(FarmerRevenueActivity.this, "Failed to fetch revenue data", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(FarmerRevenueActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void displayData(Map<String, Object> data) {
        String currency = getString(R.string.rupee_symbol);
        
        Object totalRev = data.get("totalRevenue");
        Object totalOrders = data.get("totalOrders");
        Object avgOrder = data.get("averageOrderValue");

        tvTotalRevenue.setText(String.format("%s%.2f", currency, Double.parseDouble(totalRev.toString())));
        tvTotalOrders.setText(String.valueOf(((Double) totalOrders).intValue()));
        tvAvgOrderValue.setText(String.format("%s%.2f", currency, Double.parseDouble(avgOrder.toString())));

        List<Map<String, Object>> topProducts = (List<Map<String, Object>>) data.get("topProducts");
        if (topProducts != null && !topProducts.isEmpty()) {
            tvNoTopProducts.setVisibility(View.GONE);
            layoutTopProducts.removeAllViews();
            
            for (Map<String, Object> product : topProducts) {
                View itemView = getLayoutInflater().inflate(android.R.layout.simple_list_item_2, null);
                TextView text1 = itemView.findViewById(android.R.id.text1);
                TextView text2 = itemView.findViewById(android.R.id.text2);
                
                text1.setText((String) product.get("name"));
                text2.setText("Sold: " + ((Double) product.get("totalSold")).intValue() + " units | Revenue: " + currency + String.format("%.2f", Double.parseDouble(product.get("revenue").toString())));
                
                layoutTopProducts.addView(itemView);
            }
        }

        // Display Monthly Revenue Chart
        List<Map<String, Object>> monthlyRevenue = (List<Map<String, Object>>) data.get("monthlyRevenue");
        if (monthlyRevenue != null && !monthlyRevenue.isEmpty()) {
            tvNoChartData.setVisibility(View.GONE);
            layoutMonthlyRevenue.removeAllViews();
            
            double maxRevenue = 0;
            for (Map<String, Object> month : monthlyRevenue) {
                double rev = Double.parseDouble(month.get("revenue").toString());
                if (rev > maxRevenue) maxRevenue = rev;
            }
            if (maxRevenue == 0) maxRevenue = 1; // Prevent division by zero

            for (Map<String, Object> month : monthlyRevenue) {
                String monthLabel = (String) month.get("month");
                double revenueValue = Double.parseDouble(month.get("revenue").toString());
                
                // Programmatically create a bar
                addBarToChart(monthLabel, revenueValue, maxRevenue);
            }
        }
    }

    private void addBarToChart(String label, double value, double maxValue) {
        LinearLayout barContainer = new LinearLayout(this);
        barContainer.setOrientation(LinearLayout.VERTICAL);
        barContainer.setGravity(android.view.Gravity.BOTTOM | android.view.Gravity.CENTER_HORIZONTAL);
        LinearLayout.LayoutParams containerParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT, 1);
        barContainer.setLayoutParams(containerParams);

        // Value text
        TextView tvValue = new TextView(this);
        tvValue.setText(String.format("%.0f", value));
        tvValue.setTextSize(8);
        tvValue.setGravity(android.view.Gravity.CENTER);
        barContainer.addView(tvValue);

        // The Bar View
        View bar = new View(this);
        int maxHeightPx = (int) (120 * getResources().getDisplayMetrics().density); // Max height in pixels
        int barHeight = (int) ((value / maxValue) * maxHeightPx);
        if (barHeight < 5) barHeight = 5; // Minimum height for visibility
        
        LinearLayout.LayoutParams barParams = new LinearLayout.LayoutParams(
                (int) (30 * getResources().getDisplayMetrics().density), 
                barHeight
        );
        barParams.setMargins(0, 4, 0, 4);
        bar.setLayoutParams(barParams);
        bar.setBackgroundColor(androidx.core.content.ContextCompat.getColor(this, R.color.farmer_green));
        barContainer.addView(bar);

        // Month label
        TextView tvLabel = new TextView(this);
        tvLabel.setText(label.substring(0, Math.min(label.length(), 3))); // Short month name
        tvLabel.setTextSize(10);
        tvLabel.setGravity(android.view.Gravity.CENTER);
        barContainer.addView(tvLabel);

        layoutMonthlyRevenue.addView(barContainer);
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
