package com.croplink.adapters;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.models.Order;

import java.util.List;

public class DeliveryBoyAdapter extends RecyclerView.Adapter<DeliveryBoyAdapter.ViewHolder> {

    private Context context;
    private List<Order> orders;
    private OnDeliveryActionListener listener;

    public interface OnDeliveryActionListener {
        void onMarkDelivered(Order order);
    }

    public DeliveryBoyAdapter(Context context, List<Order> orders, OnDeliveryActionListener listener) {
        this.context = context;
        this.orders = orders;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_delivery_order, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Order order = orders.get(position);
        
        holder.tvOrderId.setText("Order #" + order.getId().substring(0, Math.min(order.getId().length(), 8)));
        holder.tvCustomer.setText("Customer: " + (order.getCustomer() != null ? order.getCustomer().getName() : "Unknown"));
        holder.tvAddress.setText(order.getShippingAddress() != null ? 
            order.getShippingAddress().getAddress() + ", " + order.getShippingAddress().getCity() : "No Address");
        
        holder.tvItemsCount.setText((order.getItems() != null ? order.getItems().size() : 0) + " Items");
        holder.tvStatus.setText(order.getStatus().toUpperCase());

        if ("delivered".equalsIgnoreCase(order.getStatus())) {
            holder.tvStatus.setBackgroundResource(R.drawable.bg_rounded_status);
            // In Android, dynamically changing background color of a drawable resource is tricky, 
            // but for simplicity we'll just set it. 
            holder.btnMarkDelivered.setVisibility(View.GONE);
        } else {
            holder.tvStatus.setBackgroundResource(R.drawable.bg_rounded_status);
            holder.btnMarkDelivered.setVisibility(View.VISIBLE);
        }

        holder.btnMarkDelivered.setOnClickListener(v -> listener.onMarkDelivered(order));
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderId, tvStatus, tvCustomer, tvAddress, tvItemsCount;
        Button btnMarkDelivered;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tvOrderId);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvCustomer = itemView.findViewById(R.id.tvCustomer);
            tvAddress = itemView.findViewById(R.id.tvAddress);
            tvItemsCount = itemView.findViewById(R.id.tvItemsCount);
            btnMarkDelivered = itemView.findViewById(R.id.btnMarkDelivered);
        }
    }
}
