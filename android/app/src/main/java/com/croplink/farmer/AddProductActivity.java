package com.croplink.farmer;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.croplink.R;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Product;
import com.croplink.models.User;
import com.croplink.utils.SessionManager;
import com.google.android.material.textfield.TextInputEditText;

import java.io.File;
import java.util.Calendar;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AddProductActivity extends AppCompatActivity {

    private TextInputEditText etProductName, etQuantity, etPrice, etHarvestDate, etExpiryDate;
    private Spinner spinnerCategory, spinnerType;
    private Button btnSubmit, btnSelectImage;
    private ImageView imgProduct;
    
    private Uri selectedImageUri;
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;

    private final ActivityResultLauncher<Intent> imagePickerLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    selectedImageUri = result.getData().getData();
                    imgProduct.setVisibility(View.VISIBLE);
                    imgProduct.setImageURI(selectedImageUri);
                }
            }
    );

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_product);

        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.add_product);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        // Initialize views
        etProductName = findViewById(R.id.etProductName);
        etQuantity = findViewById(R.id.etQuantity);
        etPrice = findViewById(R.id.etPrice);
        etHarvestDate = findViewById(R.id.etHarvestDate);
        etExpiryDate = findViewById(R.id.etExpiryDate);
        spinnerCategory = findViewById(R.id.spinnerCategory);
        spinnerType = findViewById(R.id.spinnerType);
        btnSubmit = findViewById(R.id.btnSubmit);
        btnSelectImage = findViewById(R.id.btnSelectImage);
        imgProduct = findViewById(R.id.imgProduct);

        setupSpinners();
        setupDatePickers();

        btnSelectImage.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            imagePickerLauncher.launch(intent);
        });

        btnSubmit.setOnClickListener(v -> attemptSubmit());
    }

    private void setupSpinners() {
        String[] categories = {"Vegetables", "Fruits", "Grains"};
        String[] types = {"Organic", "Conventional"};

        spinnerCategory.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, categories));
        spinnerType.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, types));
    }

    private void setupDatePickers() {
        etHarvestDate.setOnClickListener(v -> showDatePicker(etHarvestDate));
        etExpiryDate.setOnClickListener(v -> showDatePicker(etExpiryDate));
    }

    private void showDatePicker(TextInputEditText editText) {
        Calendar calendar = Calendar.getInstance();
        DatePickerDialog dialog = new DatePickerDialog(this, (view, year, month, dayOfMonth) -> {
            String date = String.format("%d-%02d-%02d", year, month + 1, dayOfMonth);
            editText.setText(date);
        }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH));
        dialog.show();
    }

    private void attemptSubmit() {
        String name = etProductName.getText().toString().trim();
        String qty = etQuantity.getText().toString().trim();
        String price = etPrice.getText().toString().trim();
        String batch = "B-" + System.currentTimeMillis(); // Auto-allocated batch number
        String harvest = etHarvestDate.getText().toString().trim();
        String expiry = etExpiryDate.getText().toString().trim();
        String category = spinnerCategory.getSelectedItem().toString();
        String type = spinnerType.getSelectedItem().toString();

        if (name.isEmpty() || qty.isEmpty() || price.isEmpty()) {
            Toast.makeText(this, "Please fill required fields", Toast.LENGTH_SHORT).show();
            return;
        }

        if (selectedImageUri == null) {
            Toast.makeText(this, "Please select an image", Toast.LENGTH_SHORT).show();
            return;
        }

        submitProduct(name, qty, price, batch, harvest, expiry, category, type);
    }

    private void submitProduct(String name, String qty, String price, String batch, 
                               String harvest, String expiry, String category, String type) {
        
        btnSubmit.setEnabled(false);
        Toast.makeText(this, "Uploading product...", Toast.LENGTH_SHORT).show();

        // Create parts
        RequestBody namePart = RequestBody.create(MediaType.parse("text/plain"), name);
        RequestBody categoryPart = RequestBody.create(MediaType.parse("text/plain"), category);
        RequestBody typePart = RequestBody.create(MediaType.parse("text/plain"), type);
        RequestBody qtyPart = RequestBody.create(MediaType.parse("text/plain"), qty);
        RequestBody pricePart = RequestBody.create(MediaType.parse("text/plain"), price);
        RequestBody descPart = RequestBody.create(MediaType.parse("text/plain"), "Fresh from " + currentUser.getName());
        RequestBody harvestPart = RequestBody.create(MediaType.parse("text/plain"), harvest);
        RequestBody expiryPart = RequestBody.create(MediaType.parse("text/plain"), expiry);
        RequestBody batchPart = RequestBody.create(MediaType.parse("text/plain"), batch);
        RequestBody locPart = RequestBody.create(MediaType.parse("text/plain"), currentUser.getFarmLocation() != null ? currentUser.getFarmLocation() : "Unknown");

        // Image part
        File file = new File(getRealPathFromURI(selectedImageUri));
        RequestBody requestFile = RequestBody.create(MediaType.parse(getContentResolver().getType(selectedImageUri)), file);
        MultipartBody.Part body = MultipartBody.Part.createFormData("image", file.getName(), requestFile);

        apiService.createProduct(
                "Bearer " + currentUser.getToken(),
                namePart, categoryPart, typePart, qtyPart, pricePart,
                descPart, harvestPart, expiryPart, batchPart, locPart, body
        ).enqueue(new Callback<Product>() {
            @Override
            public void onResponse(Call<Product> call, Response<Product> response) {
                btnSubmit.setEnabled(true);
                if (response.isSuccessful()) {
                    Toast.makeText(AddProductActivity.this, "Product added successfully!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(AddProductActivity.this, "Failed to add product", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Product> call, Throwable t) {
                btnSubmit.setEnabled(true);
                Toast.makeText(AddProductActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String getRealPathFromURI(Uri contentUri) {
        String[] proj = {MediaStore.Images.Media.DATA};
        Cursor cursor = getContentResolver().query(contentUri, proj, null, null, null);
        if (cursor == null) return null;
        int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
        cursor.moveToFirst();
        String path = cursor.getString(column_index);
        cursor.close();
        return path;
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
