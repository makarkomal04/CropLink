package com.croplink.customer;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.adapters.ProductAdapter;
import com.croplink.models.Product;
import com.croplink.utils.CartManager;
import com.croplink.utils.SessionManager;
import com.google.android.material.chip.Chip;
import com.google.android.material.chip.ChipGroup;
import java.util.List;

import com.croplink.ProductVerificationActivity;
import com.croplink.api.ApiService;
import com.croplink.api.RetrofitClient;
import com.croplink.models.User;
import com.croplink.LoginActivity;
import java.util.ArrayList;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ShopActivity extends AppCompatActivity implements ProductAdapter.OnProductClickListener {

    private RecyclerView recyclerView;
    private ProductAdapter adapter;
    private List<Product> products = new ArrayList<>();
    private EditText etSearch;
    private ChipGroup chipGroupCategories, chipGroupType;
    private Spinner spinnerSort;
    private TextView tvCartBadge, tvProductCount;
    private CartManager cartManager;
    private SessionManager sessionManager;
    private ApiService apiService;
    private User currentUser;

    private String selectedCategory = "All";
    private String selectedType = "all";
    private String searchQuery = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_shop);

        sessionManager = new SessionManager(this);
        cartManager = new CartManager(this);
        apiService = RetrofitClient.getClient().create(ApiService.class);
        currentUser = sessionManager.getUser();

        // Setup toolbar
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        getSupportActionBar().setTitle(R.string.marketplace);

        // Initialize views
        recyclerView = findViewById(R.id.recyclerViewProducts);
        etSearch = findViewById(R.id.etSearch);
        chipGroupCategories = findViewById(R.id.chipGroupCategories);
        chipGroupType = findViewById(R.id.chipGroupType);
        spinnerSort = findViewById(R.id.spinnerSort);
        tvProductCount = findViewById(R.id.tvProductCount);

        // Setup RecyclerView
        recyclerView.setLayoutManager(new GridLayoutManager(this, 2));
        adapter = new ProductAdapter(this, products, this);
        recyclerView.setAdapter(adapter);

        setupSearch();
        setupCategoryChips();
        setupTypeChips();
        setupSortSpinner();
        
        fetchProducts();
    }

    private void fetchProducts() {
        apiService.getProducts().enqueue(new Callback<List<Product>>() {
            @Override
            public void onResponse(Call<List<Product>> call, Response<List<Product>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    products.clear();
                    // Filter approved products for shop
                    for (Product p : response.body()) {
                        if ("approved".equalsIgnoreCase(p.getApprovalStatus()) || p.isApproved()) {
                            products.add(p);
                        }
                    }
                    adapter.notifyDataSetChanged();
                    applyFilters();
                }
            }

            @Override
            public void onFailure(Call<List<Product>> call, Throwable t) {
                Toast.makeText(ShopActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupSearch() {
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                searchQuery = s.toString();
                applyFilters();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void setupCategoryChips() {
        String[] categories = {"All", "Vegetables", "Fruits", "Grains"};
        
        for (String category : categories) {
            Chip chip = new Chip(this);
            chip.setText(category);
            chip.setCheckable(true);
            chip.setChecked(category.equals("All"));
            chip.setOnClickListener(v -> {
                selectedCategory = category;
                uncheckOtherChips(chipGroupCategories, chip);
                applyFilters();
            });
            chipGroupCategories.addView(chip);
        }
    }

    private void setupTypeChips() {
        Chip chipAll = findViewById(R.id.chipAllProducts);
        Chip chipOrganic = findViewById(R.id.chipOrganic);
        Chip chipConventional = findViewById(R.id.chipConventional);

        chipAll.setOnClickListener(v -> {
            selectedType = "all";
            uncheckOtherChips(chipGroupType, chipAll);
            applyFilters();
        });

        chipOrganic.setOnClickListener(v -> {
            selectedType = "organic";
            uncheckOtherChips(chipGroupType, chipOrganic);
            applyFilters();
        });

        chipConventional.setOnClickListener(v -> {
            selectedType = "conventional";
            uncheckOtherChips(chipGroupType, chipConventional);
            applyFilters();
        });
    }

    private void setupSortSpinner() {
        String[] sortOptions = {
            getString(R.string.newest_first),
            getString(R.string.price_low_high),
            getString(R.string.price_high_low)
        };

        ArrayAdapter<String> sortAdapter = new ArrayAdapter<>(this,
            android.R.layout.simple_spinner_item, sortOptions);
        sortAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerSort.setAdapter(sortAdapter);

        spinnerSort.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String sortBy = position == 1 ? "price-low" : position == 2 ? "price-high" : "newest";
                adapter.sort(sortBy);
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void uncheckOtherChips(ChipGroup group, Chip selectedChip) {
        for (int i = 0; i < group.getChildCount(); i++) {
            Chip chip = (Chip) group.getChildAt(i);
            chip.setChecked(chip == selectedChip);
        }
    }

    private void applyFilters() {
        adapter.filter(searchQuery, selectedCategory, selectedType);
        updateProductCount();
    }

    private void updateProductCount() {
        int count = adapter.getItemCount();
        if (count == 1) {
            tvProductCount.setText(String.format(getString(R.string.showing_product), count));
        } else {
            tvProductCount.setText(String.format(getString(R.string.showing_products), count));
        }
    }

    @Override
    public void onAddToCart(Product product) {
        cartManager.addToCart(product, 1);
        Toast.makeText(this, getString(R.string.added_to_cart), Toast.LENGTH_SHORT).show();
        invalidateOptionsMenu(); // Update cart badge
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_shop, menu);
        
        MenuItem cartItem = menu.findItem(R.id.action_cart);
        View actionView = cartItem.getActionView();
        tvCartBadge = actionView.findViewById(R.id.cart_badge);
        
        updateCartBadge();
        
        actionView.setOnClickListener(v -> {
            startActivity(new Intent(this, CartActivity.class));
        });
        
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        
        if (id == R.id.action_cart) {
            startActivity(new Intent(this, CartActivity.class));
            return true;
        } else if (id == R.id.action_orders) {
            startActivity(new Intent(this, MyOrdersActivity.class));
            return true;
        } else if (id == R.id.action_verify) {
            startActivity(new Intent(this, ProductVerificationActivity.class));
            return true;
        } else if (id == R.id.action_wallet) {
            startActivity(new Intent(this, WalletActivity.class));
            return true;
        } else if (id == R.id.action_logout) {
            sessionManager.logoutUser();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return true;
        }
        
        return super.onOptionsItemSelected(item);
    }

    private void updateCartBadge() {
        int count = cartManager.getCartCount();
        if (tvCartBadge != null) {
            if (count > 0) {
                tvCartBadge.setVisibility(View.VISIBLE);
                tvCartBadge.setText(String.valueOf(count));
            } else {
                tvCartBadge.setVisibility(View.GONE);
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateCartBadge();
    }
}
