package com.croplink.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.croplink.R;
import com.croplink.models.User;

import java.util.List;

public class UserAdapter extends RecyclerView.Adapter<UserAdapter.UserViewHolder> {

    private Context context;
    private List<User> userList;
    private OnUserActionListener listener;

    public interface OnUserActionListener {
        void onVerifyFarmer(User user);
    }

    public UserAdapter(Context context, List<User> userList, OnUserActionListener listener) {
        this.context = context;
        this.userList = userList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public UserViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_user, parent, false);
        return new UserViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull UserViewHolder holder, int position) {
        User user = userList.get(position);
        
        holder.tvName.setText(user.getName());
        holder.tvEmail.setText(user.getEmail());
        holder.tvRole.setText(user.getRole().toUpperCase());
        
        if ("farmer".equalsIgnoreCase(user.getRole())) {
            holder.tvFarmLoc.setVisibility(View.VISIBLE);
            holder.tvFarmLoc.setText("Farm: " + (user.getFarmLocation() != null ? user.getFarmLocation() : "N/A"));
            
            if (user.isVerified()) {
                holder.btnVerify.setVisibility(View.GONE);
                holder.tvVerifiedStatus.setVisibility(View.VISIBLE);
                holder.tvVerifiedStatus.setText("VERIFIED");
                holder.tvVerifiedStatus.setTextColor(context.getResources().getColor(android.R.color.holo_green_dark));
            } else {
                holder.btnVerify.setVisibility(View.VISIBLE);
                holder.tvVerifiedStatus.setVisibility(View.GONE);
                holder.btnVerify.setOnClickListener(v -> listener.onVerifyFarmer(user));
            }
        } else {
            holder.tvFarmLoc.setVisibility(View.GONE);
            holder.btnVerify.setVisibility(View.GONE);
            holder.tvVerifiedStatus.setVisibility(View.GONE);
        }
    }

    @Override
    public int getItemCount() {
        return userList.size();
    }

    public static class UserViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvEmail, tvRole, tvFarmLoc, tvVerifiedStatus;
        Button btnVerify;

        public UserViewHolder(@NonNull View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tvUserName);
            tvEmail = itemView.findViewById(R.id.tvUserEmail);
            tvRole = itemView.findViewById(R.id.tvUserRole);
            tvFarmLoc = itemView.findViewById(R.id.tvFarmLocation);
            tvVerifiedStatus = itemView.findViewById(R.id.tvVerifiedStatus);
            btnVerify = itemView.findViewById(R.id.btnVerify);
        }
    }
}
