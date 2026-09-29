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

public class WarehouseOrderAdapter extends RecyclerView.Adapter<WarehouseOrderAdapter.ViewHolder> {

    private Context context;
    private List<Order> orders;
    private OnOrderActionListener listener;

    public interface OnOrderActionListener {
        void onAccept(Order order);
        void onReject(Order order);
        void onShip(Order order);
        void onDeliver(Order order);
    }

    public WarehouseOrderAdapter(Context context, List<Order> orders, OnOrderActionListener listener) {
        this.context = context;
        this.orders = orders;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_warehouse_order, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Order order = orders.get(position);
        
        holder.tvOrderId.setText("Order #" + order.getId().substring(0, Math.min(order.getId().length(), 8)));
        holder.tvOrderDate.setText("Date: " + order.getCreatedAt());
        holder.tvOrderTotal.setText(String.format("%s%.2f", 
            context.getString(R.string.rupee_symbol), order.getTotalPrice()));
        
        holder.tvOrderStatus.setText(order.getStatus().toUpperCase());
        
        // Reset visibility
        holder.btnReject.setVisibility(View.GONE);
        holder.btnAction.setVisibility(View.GONE);
        holder.layoutActions.setVisibility(View.GONE);

        String status = order.getStatus().toLowerCase();
        String wStatus = order.getWarehouseStatus() != null ? order.getWarehouseStatus().toLowerCase() : "";

        if (status.equals("pending")) {
            holder.tvOrderStatus.setText("PENDING");
            holder.tvOrderStatus.setBackgroundColor(Color.parseColor("#FFC107")); // Amber
            holder.layoutActions.setVisibility(View.VISIBLE);
            holder.btnReject.setVisibility(View.VISIBLE);
            holder.btnAction.setVisibility(View.VISIBLE);
            holder.btnAction.setText("Accept");
            holder.btnAction.setOnClickListener(v -> listener.onAccept(order));
            holder.btnReject.setOnClickListener(v -> listener.onReject(order));
        } else if (wStatus.equals("passed") || wStatus.equals("quality passed")) {
            holder.tvOrderStatus.setText("QUALITY PASSED");
            holder.tvOrderStatus.setBackgroundColor(Color.parseColor("#4CAF50")); // Green
        } else if (wStatus.equals("failed") || wStatus.equals("rejected")) {
            holder.tvOrderStatus.setText("REJECTED");
            holder.tvOrderStatus.setBackgroundColor(Color.parseColor("#F44336")); // Red
            if (order.getRejectionReason() != null) {
                holder.tvOrderTotal.setText(holder.tvOrderTotal.getText() + "\nReason: " + order.getRejectionReason());
            }
        } else {
            // Fallback for other statuses like shipped/delivered if seen here
            holder.tvOrderStatus.setText(status.toUpperCase());
            if (status.equals("shipped")) holder.tvOrderStatus.setBackgroundColor(Color.parseColor("#9C27B0"));
            else if (status.equals("delivered")) holder.tvOrderStatus.setBackgroundColor(Color.parseColor("#4CAF50"));
            else holder.tvOrderStatus.setBackgroundColor(Color.parseColor("#2196F3"));
        }
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderId, tvOrderStatus, tvOrderDate, tvOrderTotal;
        Button btnReject, btnAction;
        View layoutActions;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tvOrderId);
            tvOrderStatus = itemView.findViewById(R.id.tvOrderStatus);
            tvOrderDate = itemView.findViewById(R.id.tvOrderDate);
            tvOrderTotal = itemView.findViewById(R.id.tvOrderTotal);
            btnReject = itemView.findViewById(R.id.btnReject);
            btnAction = itemView.findViewById(R.id.btnAction);
            layoutActions = itemView.findViewById(R.id.layoutActions);
        }
    }
}
