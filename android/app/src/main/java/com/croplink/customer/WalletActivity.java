package com.croplink.customer;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
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
import com.google.android.material.card.MaterialCardView;
import com.google.zxing.BarcodeFormat;
import com.journeyapps.barcodescanner.BarcodeEncoder;

import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class WalletActivity extends AppCompatActivity {

    private MaterialCardView cardNoWallet;
    private LinearLayout layoutWalletInfo;
    private ProgressBar progressBar;
    private TextView tvUserName, tvWalletAddress;
    private ImageView imgWalletQR;
    private Button btnCreateWallet;
    private ImageButton btnCopyAddress;
    
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_wallet);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Blockchain Wallet");
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        // Initialize views
        cardNoWallet = findViewById(R.id.cardNoWallet);
        layoutWalletInfo = findViewById(R.id.layoutWalletInfo);
        progressBar = findViewById(R.id.progressBar);
        tvUserName = findViewById(R.id.tvUserName);
        tvWalletAddress = findViewById(R.id.tvWalletAddress);
        imgWalletQR = findViewById(R.id.imgWalletQR);
        btnCreateWallet = findViewById(R.id.btnCreateWallet);
        btnCopyAddress = findViewById(R.id.btnCopyAddress);

        tvUserName.setText(currentUser.getName());

        if (currentUser.isWalletCreated() && currentUser.getWalletAddress() != null) {
            showWalletInfo(currentUser.getWalletAddress());
        } else {
            fetchWalletInfo();
        }

        btnCreateWallet.setOnClickListener(v -> createWallet());
        
        btnCopyAddress.setOnClickListener(v -> {
            ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText("Wallet Address", currentUser.getWalletAddress());
            clipboard.setPrimaryClip(clip);
            Toast.makeText(this, "Address copied to clipboard", Toast.LENGTH_SHORT).show();
        });
    }

    private void showWalletInfo(String address) {
        tvWalletAddress.setText(address);
        cardNoWallet.setVisibility(View.GONE);
        layoutWalletInfo.setVisibility(View.VISIBLE);
        
        // Generate QR Code
        try {
            BarcodeEncoder barcodeEncoder = new BarcodeEncoder();
            Bitmap bitmap = barcodeEncoder.encodeBitmap(address, BarcodeFormat.QR_CODE, 400, 400);
            imgWalletQR.setImageBitmap(bitmap);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void fetchWalletInfo() {
        progressBar.setVisibility(View.VISIBLE);
        apiService.getWalletInfo("Bearer " + currentUser.getToken(), "me").enqueue(new Callback<Map<String, String>>() {
            @Override
            public void onResponse(Call<Map<String, String>> call, Response<Map<String, String>> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    String address = response.body().get("walletAddress");
                    if (address != null) {
                        currentUser.setWalletAddress(address);
                        currentUser.setWalletCreated(true);
                        sessionManager.createLoginSession(currentUser);
                        showWalletInfo(address);
                    } else {
                        cardNoWallet.setVisibility(View.VISIBLE);
                    }
                } else {
                    cardNoWallet.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<Map<String, String>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                cardNoWallet.setVisibility(View.VISIBLE);
                Toast.makeText(WalletActivity.this, "Connection error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void createWallet() {
        progressBar.setVisibility(View.VISIBLE);
        btnCreateWallet.setEnabled(false);

        apiService.createWallet("Bearer " + currentUser.getToken()).enqueue(new Callback<Map<String, String>>() {
            @Override
            public void onResponse(Call<Map<String, String>> call, Response<Map<String, String>> response) {
                progressBar.setVisibility(View.GONE);
                btnCreateWallet.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    String address = response.body().get("walletAddress");
                    String mnemonic = response.body().get("mnemonic"); // In a real app, show this once to the user
                    
                    currentUser.setWalletAddress(address);
                    currentUser.setWalletCreated(true);
                    sessionManager.createLoginSession(currentUser); // Update session
                    
                    showWalletInfo(address);
                    Toast.makeText(WalletActivity.this, "Wallet created successfully!", Toast.LENGTH_SHORT).show();
                } else if (response.code() == 400) {
                    // Wallet likely already exists, try to fetch it
                    fetchWalletInfo();
                } else {
                    String errorMsg = "Failed to create: " + response.code();
                    try {
                        if (response.errorBody() != null) {
                            errorMsg += " " + response.errorBody().string();
                        }
                    } catch (Exception ignored) {}
                    Toast.makeText(WalletActivity.this, errorMsg, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Map<String, String>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnCreateWallet.setEnabled(true);
                Toast.makeText(WalletActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
