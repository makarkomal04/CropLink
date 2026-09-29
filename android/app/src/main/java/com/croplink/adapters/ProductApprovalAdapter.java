package com.croplink.adapters;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.models.Product;
import com.croplink.api.RetrofitClient;
import com.bumptech.glide.Glide;

import java.util.List;

public class ProductApprovalAdapter extends RecyclerView.Adapter<ProductApprovalAdapter.ProductViewHolder> {

    private Context context;
    private List<Product> products;
    private OnProductActionListener listener;

    public interface OnProductActionListener {
        void onApprove(Product product);
        void onReject(Product product);
    }

    public ProductApprovalAdapter(Context context, List<Product> products, OnProductActionListener listener) {
        this.context = context;
        this.products = products;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ProductViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_product_approval, parent, false);
        return new ProductViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProductViewHolder holder, int position) {
        Product product = products.get(position);
        
        holder.tvProductName.setText(product.getName());
        holder.tvCategory.setText(product.getCategory() + " • " + product.getType());
        holder.tvPrice.setText(String.format("%s%.0f %s • %s%s", 
            context.getString(R.string.rupee_symbol), product.getPricePerKg(),
            context.getString(R.string.per_kg),
            product.getQuantity(),
            product.getUnit() != null ? product.getUnit() : "kg"));
            
        if (product.getFarmer() != null) {
            holder.tvFarmerName.setText("Farmer: " + product.getFarmer().getName());
        } else {
            holder.tvFarmerName.setText("Farmer: Unknown");
        }

        // Handle image loading
        String imagePath = product.getImage();
        if (imagePath != null && !imagePath.isEmpty()) {
            String baseUrl = RetrofitClient.BASE_URL.replace("/api/", "");
            String fullImageUrl = baseUrl + "/" + imagePath;
            
            Glide.with(context)
                .load(fullImageUrl)
                .placeholder(R.drawable.ic_launcher_background)
                .error(R.drawable.ic_launcher_background)
                .into(holder.imgProduct);
        } else {
            holder.imgProduct.setImageResource(R.drawable.ic_launcher_background);
        }
        
        holder.btnApprove.setOnClickListener(v -> listener.onApprove(product));
        holder.btnReject.setOnClickListener(v -> listener.onReject(product));
    }

    @Override
    public int getItemCount() {
        return products.size();
    }

    public static class ProductViewHolder extends RecyclerView.ViewHolder {
        ImageView imgProduct;
        TextView tvProductName, tvCategory, tvPrice, tvFarmerName;
        Button btnApprove, btnReject;

        public ProductViewHolder(@NonNull View itemView) {
            super(itemView);
            imgProduct = itemView.findViewById(R.id.imgProduct);
            tvProductName = itemView.findViewById(R.id.tvProductName);
            tvCategory = itemView.findViewById(R.id.tvCategory);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvFarmerName = itemView.findViewById(R.id.tvFarmerName);
            btnApprove = itemView.findViewById(R.id.btnApprove);
            btnReject = itemView.findViewById(R.id.btnReject);
        }
    }
}
