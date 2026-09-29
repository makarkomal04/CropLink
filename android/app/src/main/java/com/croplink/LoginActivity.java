package com.croplink;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.croplink.customer.ShopActivity;
import com.croplink.farmer.FarmerDashboardActivity;
import com.croplink.admin.AdminDashboardActivity;
import com.croplink.admin.WarehouseActivity;
import com.croplink.shipment.ShipmentManagerActivity;
import com.croplink.delivery.DeliveryBoyActivity;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;
import com.google.android.material.textfield.TextInputEditText;
import java.util.HashMap;
import java.util.Map;

import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etEmail, etPassword;
    private Button btnLogin;
    private TextView tvRegister;
    private ProgressBar progressBar;
    private SessionManager sessionManager;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);

        // Initialize views
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvRegister = findViewById(R.id.tvRegister);
        progressBar = findViewById(R.id.progressBar);

        btnLogin.setOnClickListener(v -> attemptLogin());
        
        tvRegister.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });
    }

    private void attemptLogin() {
        // Get input
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        // Validation
        if (TextUtils.isEmpty(email)) {
            etEmail.setError(getString(R.string.error_email_required));
            etEmail.requestFocus();
            return;
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.setError(getString(R.string.error_email_invalid));
            etEmail.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(password)) {
            etPassword.setError(getString(R.string.error_password_required));
            etPassword.requestFocus();
            return;
        }

        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        btnLogin.setEnabled(false);

        // Actual login call
        performLogin(email, password);
    }

    private void performLogin(String email, String password) {
        Map<String, String> credentials = new HashMap<>();
        credentials.put("email", email);
        credentials.put("password", password);

        apiService.login(credentials).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body();
                    
                    // Save session
                    sessionManager.createLoginSession(user);

                    // Show success message
                    Toast.makeText(LoginActivity.this, 
                        String.format(getString(R.string.login_success), user.getName()),
                        Toast.LENGTH_SHORT).show();

                    // Navigate based on role
                    navigateToDashboard(user.getRole());
                } else {
                    Toast.makeText(LoginActivity.this, "Invalid email or password", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);
                Toast.makeText(LoginActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void navigateToDashboard(String role) {
        Intent intent;
        switch (role) {
            case "farmer":
                intent = new Intent(this, FarmerDashboardActivity.class);
                break;
            case "admin":
                intent = new Intent(this, AdminDashboardActivity.class);
                break;
            case "warehouse":
                intent = new Intent(this, WarehouseActivity.class);
                break;
            case "shipment_manager":
                intent = new Intent(this, ShipmentManagerActivity.class);
                break;
            case "delivery_boy":
                intent = new Intent(this, DeliveryBoyActivity.class);
                break;
            default:
                intent = new Intent(this, ShopActivity.class);
                break;
        }
        startActivity(intent);
        finish();
    }
}
