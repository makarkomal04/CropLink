package com.croplink.adapters;

import android.content.Context;
import android.content.res.ColorStateList;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.api.RetrofitClient;
import com.croplink.models.Product;

import java.util.ArrayList;
import java.util.List;

public class ProductAdapter extends RecyclerView.Adapter<ProductAdapter.ProductViewHolder> {

    private Context context;
    private List<Product> products;
    private List<Product> productsFiltered;
    private OnProductClickListener listener;
    private boolean isFarmerDashboard = false;

    public interface OnProductClickListener {
        void onAddToCart(Product product);
    }

    public ProductAdapter(Context context, List<Product> products, OnProductClickListener listener) {
        this.context = context;
        this.products = products;
        this.productsFiltered = new ArrayList<>(products);
        this.listener = listener;
    }

    public ProductAdapter(Context context, List<Product> products, OnProductClickListener listener, boolean isFarmerDashboard) {
        this.context = context;
        this.products = products;
        this.productsFiltered = new ArrayList<>(products);
        this.listener = listener;
        this.isFarmerDashboard = isFarmerDashboard;
    }

    @NonNull
    @Override
    public ProductViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_product, parent, false);
        return new ProductViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProductViewHolder holder, int position) {
        Product product = productsFiltered.get(position);
        
        holder.tvProductName.setText(product.getName());
        holder.tvCategory.setText(product.getCategory());
        holder.tvPrice.setText(String.format("%s%.0f %s", 
            context.getString(R.string.rupee_symbol), product.getPricePerKg(),
            context.getString(R.string.per_kg)));
        holder.tvType.setText(product.getType());
        
        // Show organic badge
        if (product.getType().equals("Organic")) {
            holder.tvOrganicBadge.setVisibility(View.VISIBLE);
        } else {
            holder.tvOrganicBadge.setVisibility(View.GONE);
        }
        
        // Stock status
        if (product.getQuantity() > 0) {
            holder.tvStock.setText(context.getString(R.string.in_stock));
            holder.tvStock.setTextColor(context.getResources().getColor(R.color.success, null));
        } else {
            holder.tvStock.setText(context.getString(R.string.out_of_stock));
            holder.tvStock.setTextColor(context.getResources().getColor(R.color.error, null));
        }
        
        if (isFarmerDashboard) {
            holder.btnAddToCart.setText(context.getString(R.string.delete));
            holder.btnAddToCart.setBackgroundTintList(ColorStateList.valueOf(context.getResources().getColor(R.color.error, null)));
            holder.btnAddToCart.setEnabled(true);
        } else {
            holder.btnAddToCart.setText(context.getString(R.string.add_to_cart));
            holder.btnAddToCart.setBackgroundTintList(ColorStateList.valueOf(context.getResources().getColor(R.color.farmer_green, null)));
            holder.btnAddToCart.setEnabled(product.getQuantity() > 0);
        }
        
        holder.btnAddToCart.setOnClickListener(v -> {
            if (listener != null) {
                listener.onAddToCart(product);
            }
        });

        // Load image
        String imageUrl = product.getImageUrl();
        if (imageUrl != null && !imageUrl.isEmpty()) {
            // Remove /api/ from end and append image path
            String baseUrl = RetrofitClient.BASE_URL.replace("/api/", "");
            String fullImageUrl = baseUrl + "/" + imageUrl;
            
            Glide.with(context)
                .load(fullImageUrl)
                .placeholder(R.drawable.ic_launcher_background)
                .error(R.drawable.ic_launcher_background)
                .into(holder.ivProductImage);
        } else {
            holder.ivProductImage.setImageResource(R.drawable.ic_launcher_background);
        }
    }

    @Override
    public int getItemCount() {
        return productsFiltered.size();
    }

    // Update data
    public void updateData(List<Product> newProducts) {
        this.products = new ArrayList<>(newProducts);
        this.productsFiltered = new ArrayList<>(newProducts);
        notifyDataSetChanged();
    }

    // Filter products
    public void filter(String query, String category, String type) {
        productsFiltered.clear();
        
        for (Product product : products) {
            boolean matchesQuery = query.isEmpty() || 
                product.getName().toLowerCase().contains(query.toLowerCase());
            boolean matchesCategory = category.equals("All") || 
                product.getCategory().equals(category);
            boolean matchesType = type.equals("all") ||
                (type.equals("organic") && product.getType().equals("Organic")) ||
                (type.equals("conventional") && !product.getType().equals("Organic"));
            
            if (matchesQuery && matchesCategory && matchesType) {
                productsFiltered.add(product);
            }
        }
        
        notifyDataSetChanged();
    }

    // Sort products
    public void sort(String sortBy) {
        if (sortBy.equals("price-low")) {
            productsFiltered.sort((p1, p2) -> Double.compare(p1.getPricePerKg(), p2.getPricePerKg()));
        } else if (sortBy.equals("price-high")) {
            productsFiltered.sort((p1, p2) -> Double.compare(p2.getPricePerKg(), p1.getPricePerKg()));
        }
        notifyDataSetChanged();
    }

    static class ProductViewHolder extends RecyclerView.ViewHolder {
        TextView tvProductName, tvCategory, tvPrice, tvType, tvStock, tvOrganicBadge;
        ImageView ivProductImage;
        Button btnAddToCart;

        public ProductViewHolder(@NonNull View itemView) {
            super(itemView);
            ivProductImage = itemView.findViewById(R.id.ivProductImage);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvCategory = itemView.findViewById(R.id.tvCategory);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvType = itemView.findViewById(R.id.tvType);
            tvStock = itemView.findViewById(R.id.tvStock);
            tvOrganicBadge = itemView.findViewById(R.id.tvOrganicBadge);
            btnAddToCart = itemView.findViewById(R.id.btnAddToCart);
        }
    }
}
