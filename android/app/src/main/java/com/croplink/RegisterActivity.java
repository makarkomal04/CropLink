package com.croplink;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;
import com.google.android.material.textfield.TextInputEditText;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etName, etEmail, etPassword, etConfirmPassword, etFarmLocation;
    private Button btnRegister;
    private TextView tvLogin;
    private RadioGroup roleGroup;
    private LinearLayout farmLocationLayout;
    private ProgressBar progressBar;
    private SessionManager sessionManager;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);

        // Initialize views
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        etFarmLocation = findViewById(R.id.etFarmLocation);
        btnRegister = findViewById(R.id.btnRegister);
        tvLogin = findViewById(R.id.tvLogin);
        roleGroup = findViewById(R.id.roleGroup);
        farmLocationLayout = findViewById(R.id.farmLocationLayout);
        progressBar = findViewById(R.id.progressBar);

        // Show/hide farm location based on role selection
        roleGroup.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.radioFarmer) {
                farmLocationLayout.setVisibility(View.VISIBLE);
            } else {
                farmLocationLayout.setVisibility(View.GONE);
            }
        });

        btnRegister.setOnClickListener(v -> attemptRegister());
        
        tvLogin.setOnClickListener(v -> {
            finish();
        });
    }

    private void attemptRegister() {
        // Get input
        String name = etName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();
        String farmLocation = etFarmLocation.getText().toString().trim();

        // Get selected role
        int selectedRoleId = roleGroup.getCheckedRadioButtonId();
        String role = "customer";
        if (selectedRoleId == R.id.radioFarmer) {
            role = "farmer";
        }

        // Validation
        if (TextUtils.isEmpty(name)) {
            etName.setError(getString(R.string.error_name_required));
            etName.requestFocus();
            return;
        }

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

        if (password.length() < 6) {
            etPassword.setError(getString(R.string.error_password_length));
            etPassword.requestFocus();
            return;
        }

        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError(getString(R.string.error_passwords_dont_match));
            etConfirmPassword.requestFocus();
            return;
        }

        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        btnRegister.setEnabled(false);

        // Create user object
        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(password);
        newUser.setRole(role);
        
        if (role.equals("farmer") && !farmLocation.isEmpty()) {
            newUser.setFarmLocation(farmLocation);
        }

        // Actual registration call
        performRegistration(newUser);
    }

    private void performRegistration(User newUser) {
        apiService.register(newUser).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                progressBar.setVisibility(View.GONE);
                btnRegister.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(RegisterActivity.this, getString(R.string.registration_success), 
                        Toast.LENGTH_SHORT).show();

                    // Navigate to login
                    Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(intent);
                    finish();
                } else {
                    String message = "Registration failed";
                    try {
                        if (response.errorBody() != null) {
                            message = response.errorBody().string();
                        }
                    } catch (Exception e) {}
                    Toast.makeText(RegisterActivity.this, message, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnRegister.setEnabled(true);
                Toast.makeText(RegisterActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
