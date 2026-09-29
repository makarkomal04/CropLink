package com.croplink.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.models.Order;
import com.croplink.models.User;

import java.util.ArrayList;
import java.util.List;

public class ShipmentManagerAdapter extends RecyclerView.Adapter<ShipmentManagerAdapter.ViewHolder> {

    private Context context;
    private List<Order> orders;
    private List<User> deliveryBoys;
    private OnShipmentActionListener listener;

    public interface OnShipmentActionListener {
        void onAssign(Order order, String deliveryBoyId);
        void onShip(Order order);
    }

    public ShipmentManagerAdapter(Context context, List<Order> orders, List<User> deliveryBoys, OnShipmentActionListener listener) {
        this.context = context;
        this.orders = orders;
        this.deliveryBoys = deliveryBoys;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_shipment_order, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Order order = orders.get(position);
        
        holder.tvOrderId.setText("Order #" + order.getId().substring(0, Math.min(order.getId().length(), 8)));
        holder.tvCustomer.setText("Customer: " + (order.getCustomer() != null ? order.getCustomer().getName() : "Unknown"));
        holder.tvAddress.setText(order.getShippingAddress() != null ? 
            order.getShippingAddress().getAddress() + ", " + order.getShippingAddress().getCity() : "No Address");
        holder.tvTotal.setText(String.format("Total: ₹%.2f", order.getTotalPrice()));

        // Setup Delivery Boy Spinner
        List<String> boyNames = new ArrayList<>();
        boyNames.add("Select Delivery Boy...");
        for (User boy : deliveryBoys) {
            boyNames.add(boy.getName());
        }

        ArrayAdapter<String> spinnerAdapter = new ArrayAdapter<>(context, android.R.layout.simple_spinner_item, boyNames);
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        holder.spinnerDeliveryBoy.setAdapter(spinnerAdapter);

        // Pre-select if already assigned
        if (order.getAssignedDeliveryBoy() != null) {
            for (int i = 0; i < deliveryBoys.size(); i++) {
                if (deliveryBoys.get(i).getId().equals(order.getAssignedDeliveryBoy().getId())) {
                    holder.spinnerDeliveryBoy.setSelection(i + 1);
                    break;
                }
            }
            holder.btnShip.setVisibility(View.VISIBLE);
        } else {
            holder.btnShip.setVisibility(View.GONE);
        }

        holder.btnAssign.setOnClickListener(v -> {
            int selectedPos = holder.spinnerDeliveryBoy.getSelectedItemPosition();
            if (selectedPos > 0) {
                User selectedBoy = deliveryBoys.get(selectedPos - 1);
                listener.onAssign(order, selectedBoy.getId());
            }
        });

        holder.btnShip.setOnClickListener(v -> listener.onShip(order));
    }

    @Override
    public int getItemCount() {
        return orders.size();
    }

    public void updateDeliveryBoys(List<User> deliveryBoys) {
        this.deliveryBoys = deliveryBoys;
        notifyDataSetChanged();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvOrderId, tvCustomer, tvAddress, tvTotal;
        Spinner spinnerDeliveryBoy;
        Button btnAssign, btnShip;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tvOrderId);
            tvCustomer = itemView.findViewById(R.id.tvCustomer);
            tvAddress = itemView.findViewById(R.id.tvAddress);
            tvTotal = itemView.findViewById(R.id.tvTotal);
            spinnerDeliveryBoy = itemView.findViewById(R.id.spinnerDeliveryBoy);
            btnAssign = itemView.findViewById(R.id.btnAssign);
            btnShip = itemView.findViewById(R.id.btnShip);
        }
    }
}
