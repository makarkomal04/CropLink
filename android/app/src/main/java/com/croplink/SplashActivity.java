package com.croplink;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.Button;
import android.widget.RadioButton;
import android.widget.RadioGroup;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.croplink.customer.ShopActivity;
import com.croplink.farmer.FarmerDashboardActivity;
import com.croplink.admin.AdminDashboardActivity;
import com.croplink.utils.SessionManager;

import java.util.Locale;

public class SplashActivity extends AppCompatActivity {
    
    private SessionManager sessionManager;
    private static final int SPLASH_DELAY = 2000; // 2 seconds

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        
        sessionManager = new SessionManager(this);
        
        // Set saved language
        setLocale(sessionManager.getLanguage());
        
        // Show language selector on first launch or after 2 seconds navigate
        new Handler().postDelayed(() -> {
            if (!sessionManager.isLanguageSelected() && !sessionManager.isLoggedIn()) {
                // First time, show language selector
                showLanguageSelector();
            } else {
                navigateToNextScreen();
            }
        }, SPLASH_DELAY);
    }

    private void showLanguageSelector() {
        // Check if activity is finishing to prevent crash
        if (isFinishing()) {
            return;
        }
        
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        View dialogView = getLayoutInflater().inflate(R.layout.dialog_language_selector, null);
        builder.setView(dialogView);
        builder.setCancelable(false); // Prevent dismissal by back button
        
        RadioGroup languageGroup = dialogView.findViewById(R.id.languageGroup);
        Button btnConfirm = dialogView.findViewById(R.id.btnConfirmLanguage);
        
        AlertDialog dialog = builder.create();
        
        btnConfirm.setOnClickListener(v -> {
            int selectedId = languageGroup.getCheckedRadioButtonId();
            
            // Add null check for selected button
            if (selectedId == -1) {
                // No selection made, use default
                selectedId = R.id.radioEnglish;
            }
            
            RadioButton selectedButton = dialogView.findViewById(selectedId);
            if (selectedButton == null) {
                return; // Safety check
            }
            
            String languageCode = "en";
            if (selectedButton.getId() == R.id.radioHindi) {
                languageCode = "hi";
            } else if (selectedButton.getId() == R.id.radioMarathi) {
                languageCode = "mr";
            }
            
            sessionManager.setLanguage(languageCode);
            setLocale(languageCode);
            dialog.dismiss();
            
            // Navigate directly without recreate to avoid lifecycle issues
            navigateToNextScreen();
        });
        
        dialog.show();
    }

    private void navigateToNextScreen() {
        Intent intent;
        
        if (sessionManager.isLoggedIn()) {
            // Navigate based on user role
            String role = sessionManager.getUserRole();
            switch (role) {
                case "farmer":
                    intent = new Intent(this, FarmerDashboardActivity.class);
                    break;
                case "admin":
                    intent = new Intent(this, AdminDashboardActivity.class);
                    break;
                default:
                    intent = new Intent(this, ShopActivity.class);
                    break;
            }
        } else {
            intent = new Intent(this, LoginActivity.class);
        }
        
        startActivity(intent);
        finish();
    }

    private void setLocale(String languageCode) {
        Locale locale = new Locale(languageCode);
        Locale.setDefault(locale);
        
        Configuration config = getResources().getConfiguration();
        config.setLocale(locale);
        
        // Use proper API for Android N and above
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            createConfigurationContext(config);
        }
        
        // Update resources - this works on all Android versions
        getResources().updateConfiguration(config, getResources().getDisplayMetrics());
    }
}
