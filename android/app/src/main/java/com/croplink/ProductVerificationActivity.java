package com.croplink;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Product;
import com.google.android.material.card.MaterialCardView;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProductVerificationActivity extends AppCompatActivity {

    private Button btnScanQR;
    private LinearLayout layoutResult;
    private ProgressBar progressBar;
    private TextView tvProductName, tvBatchId, tvFarmer, tvCategory, tvHarvestDate, tvBlockchainId, tvStatus;
    private ImageView imgStatus;
    private MaterialCardView cardStatus;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_product_verification);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Product Verification");
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        apiService = RetrofitClient.getClient().create(ApiService.class);

        // Initialize views
        btnScanQR = findViewById(R.id.btnScanQR);
        layoutResult = findViewById(R.id.layoutResult);
        progressBar = findViewById(R.id.progressBar);
        tvProductName = findViewById(R.id.tvProductName);
        tvBatchId = findViewById(R.id.tvBatchId);
        tvFarmer = findViewById(R.id.tvFarmer);
        tvCategory = findViewById(R.id.tvCategory);
        tvHarvestDate = findViewById(R.id.tvHarvestDate);
        tvBlockchainId = findViewById(R.id.tvBlockchainId);
        tvStatus = findViewById(R.id.tvStatus);
        imgStatus = findViewById(R.id.imgStatus);
        cardStatus = findViewById(R.id.cardStatus);

        btnScanQR.setOnClickListener(v -> {
            IntentIntegrator integrator = new IntentIntegrator(this);
            integrator.setPrompt("Scan Product QR Code");
            integrator.setOrientationLocked(false);
            integrator.initiateScan();
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if (result != null) {
            if (result.getContents() == null) {
                Toast.makeText(this, "Cancelled", Toast.LENGTH_LONG).show();
            } else {
                String productId = result.getContents();
                // If it's a URL, extract the ID
                if (productId.contains("/")) {
                    productId = productId.substring(productId.lastIndexOf("/") + 1);
                }
                verifyProduct(productId);
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    private void verifyProduct(String productId) {
        progressBar.setVisibility(View.VISIBLE);
        layoutResult.setVisibility(View.GONE);

        apiService.getProduct(productId).enqueue(new Callback<Product>() {
            @Override
            public void onResponse(Call<Product> call, Response<Product> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Product product = response.body();
                    displayProduct(product);
                    checkBlockchain(product);
                } else {
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(ProductVerificationActivity.this, "Error " + response.code() + ": Product not found", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Product> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ProductVerificationActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void displayProduct(Product product) {
        tvProductName.setText(product.getName());
        tvBatchId.setText("Batch: #" + (product.getBatchNumber() != null ? product.getBatchNumber() : product.getId()));
        tvFarmer.setText(product.getFarmer() != null ? product.getFarmer().getName() : "Unknown");
        tvCategory.setText(product.getCategory());
        
        // Format harvest date from ISO to simple format
        String rawDate = product.getHarvestDate();
        if (rawDate != null && rawDate.contains("T")) {
            try {
                SimpleDateFormat isoFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
                isoFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date date = isoFormat.parse(rawDate);
                SimpleDateFormat simpleFormat = new SimpleDateFormat("dd MMM yyyy", Locale.getDefault());
                tvHarvestDate.setText(simpleFormat.format(date));
            } catch (Exception e) {
                tvHarvestDate.setText(rawDate);
            }
        } else {
            tvHarvestDate.setText(rawDate != null ? rawDate : "N/A");
        }

        // Initial blockchain ID display
        String bcId = product.getBlockchainId();
        if (bcId != null && !bcId.isEmpty() && !bcId.equals("Not on Blockchain")) {
            tvBlockchainId.setText(bcId);
        } else {
            tvBlockchainId.setText("Pending Verification...");
        }
        
        layoutResult.setVisibility(View.VISIBLE);
    }

    private void checkBlockchain(Product product) {
        Map<String, Object> data = new HashMap<>();
        
        // 1. Set Batch ID (fallback to MongoID if blockchainId is null)
        // This ensures the backend check (!batchId) passes even for products not explicitly on-chain yet
        String batchId = product.getBlockchainId();
        if (batchId == null || batchId.isEmpty() || batchId.equals("Not on Blockchain")) {
            batchId = product.getId();
        }
        data.put("batchId", batchId);

        // 2. Prepare productDetails as a filtered map to match blockchain hashing logic
        // MUST match backend productController.js (createProduct) and BlockchainService.js
        Map<String, Object> filteredDetails = new HashMap<>();
        filteredDetails.put("productId", product.getId());
        filteredDetails.put("name", product.getName());
        filteredDetails.put("category", product.getCategory());
        filteredDetails.put("quantity", product.getQuantity());
        
        String farmerId = product.getFarmerId();
        if (farmerId == null && product.getFarmer() != null) {
            farmerId = product.getFarmer().getId();
        }
        filteredDetails.put("farmerId", farmerId != null ? farmerId : "");
        
        // Use ISO string format for dates to match backend hashing
        filteredDetails.put("harvestDate", product.getHarvestDate() != null ? product.getHarvestDate() : "");
        filteredDetails.put("batchNumber", product.getBatchNumber() != null ? product.getBatchNumber() : "");

        data.put("productDetails", filteredDetails);

        apiService.verifyProductOnBlockchain(data).enqueue(new Callback<Map<String, Object>>() {
            @Override
            public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    Map<String, Object> body = response.body();
                    boolean isValid = false;
                    
                    // Display Blockchain ID if returned from service
                    String onChainHash = (String) body.get("onChainHash");
                    if (onChainHash != null) {
                        tvBlockchainId.setText(onChainHash);
                    } else if (Boolean.TRUE.equals(body.get("demo"))) {
                        tvBlockchainId.setText("Verified (Demo Mode)");
                    }

                    // Handle both 'verified' and 'isValid' keys
                    Object verifiedObj = body.get("verified");
                    if (verifiedObj == null) verifiedObj = body.get("isValid");

                    if (verifiedObj instanceof Boolean) {
                        isValid = (boolean) verifiedObj;
                    } else if (verifiedObj instanceof Double) {
                        isValid = (Double) verifiedObj == 1.0;
                    }

                    if (isValid) {
                        tvStatus.setText("Verified Authentic");
                        tvStatus.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
                        imgStatus.setImageResource(android.R.drawable.presence_online);
                        cardStatus.setStrokeColor(getResources().getColor(android.R.color.holo_green_dark));
                    } else {
                        tvStatus.setText("Verification Failed");
                        tvStatus.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
                        imgStatus.setImageResource(android.R.drawable.presence_busy);
                        cardStatus.setStrokeColor(getResources().getColor(android.R.color.holo_red_dark));
                    }
                } else {
                    tvStatus.setText("Blockchain Data Missing");
                    tvStatus.setTextColor(getResources().getColor(android.R.color.darker_gray));
                    imgStatus.setImageResource(android.R.drawable.presence_invisible);
                }
            }

            @Override
            public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                tvStatus.setText("Verification Error");
                tvStatus.setTextColor(getResources().getColor(android.R.color.holo_orange_dark));
            }
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
