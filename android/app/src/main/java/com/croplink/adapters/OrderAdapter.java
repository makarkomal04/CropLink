package com.croplink.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.models.Order;

import java.util.List;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.OrderViewHolder> {

    private Context context;
    private List<Order> orders;

    public OrderAdapter(Context context, List<Order> orders) {
        this.context = context;
        this.orders = orders;
    }

    @NonNull
    @Override
    public OrderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_order, parent, false);
        return new OrderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull OrderViewHolder holder, int position) {
        Order order = orders.get(position);
        
        holder.tvOrderId.setText(String.format("%s: %s", 
            context.getString(R.string.order_id), order.getId()));
        holder.tvOrderDate.setText(String.format("%s: %s",
            context.getString(R.string.order_date), order.getCreatedAt()));
        holder.tvOrderTotal.setText(String.format("%s%.2f",
            context.getString(R.string.rupee_symbol), order.getTotalPrice()));
        
        // Set status
        String status = getStatusString(order.getStatus());
        holder.tvOrderStatus.setText(status);
        holder.tvOrderStatus.setBackgroundColor(getStatusColor(order.getStatus()));
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    private String getStatusString(String status) {
        if (status == null) return "";
        switch (status.toLowerCase()) {
            case "pending":
                return context.getString(R.string.status_pending);
            case "processing":
                return context.getString(R.string.status_processing);
            case "shipped":
                return context.getString(R.string.status_shipped);
            case "delivered":
                return context.getString(R.string.status_delivered);
            case "cancelled":
                return context.getString(R.string.status_cancelled);
            default:
                return status;
        }
    }

    private int getStatusColor(String status) {
        if (status == null) return context.getResources().getColor(R.color.gray_500, null);
        switch (status.toLowerCase()) {
            case "delivered":
                return context.getResources().getColor(R.color.farmer_green, null);
            case "shipped":
                return context.getResources().getColor(R.color.farmer_blue, null);
            case "cancelled":
                return context.getResources().getColor(R.color.farmer_red, null);
            default:
                return context.getResources().getColor(R.color.farmer_yellow, null);
        }
    }

    static class OrderViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderId, tvOrderDate, tvOrderTotal, tvOrderStatus;

        public OrderViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tvOrderId);
            tvOrderDate = itemView.findViewById(R.id.tvOrderDate);
            tvOrderTotal = itemView.findViewById(R.id.tvOrderTotal);
            tvOrderStatus = itemView.findViewById(R.id.tvOrderStatus);
        }
    }
}
