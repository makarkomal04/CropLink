package com.croplink.api;

import com.croplink.models.Order;
import com.croplink.models.OrderRequest;
import com.croplink.models.Product;
import com.croplink.models.User;

import java.util.List;
import java.util.Map;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    // Auth
    @POST("auth/login")
    Call<User> login(@Body Map<String, String> credentials);

    @POST("auth/register")
    Call<User> register(@Body User user);

    // Products
    @GET("products")
    Call<List<Product>> getProducts();

    @GET("products/{id}")
    Call<Product> getProduct(@Path("id") String id);

    @Multipart
    @POST("products")
    Call<Product> createProduct(
            @Header("Authorization") String token,
            @Part("name") RequestBody name,
            @Part("category") RequestBody category,
            @Part("type") RequestBody type,
            @Part("quantity") RequestBody quantity,
            @Part("pricePerKg") RequestBody pricePerKg,
            @Part("description") RequestBody description,
            @Part("harvestDate") RequestBody harvestDate,
            @Part("expiryDate") RequestBody expiryDate,
            @Part("batchNumber") RequestBody batchNumber,
            @Part("farmerLocation") RequestBody farmerLocation,
            @Part MultipartBody.Part image
    );

    @DELETE("products/{id}")
    Call<ResponseBody> deleteProduct(@Header("Authorization") String token, @Path("id") String id);

    // Orders
    @GET("orders/myorders")
    Call<List<Order>> getMyOrders(@Header("Authorization") String token);

    @GET("orders")
    Call<List<Order>> getOrders(@Header("Authorization") String token);

    @POST("orders")
    Call<Order> createOrder(@Header("Authorization") String token, @Body OrderRequest order);

    // Admin
    @GET("admin/users")
    Call<List<User>> getAllUsers(@Header("Authorization") String token);

    @PUT("admin/users/{id}/verify")
    Call<User> verifyFarmer(@Header("Authorization") String token, @Path("id") String id);

    @PUT("admin/products/{id}/approve")
    Call<Product> approveProduct(@Header("Authorization") String token, @Path("id") String id);

    @DELETE("admin/products/{id}")
    Call<ResponseBody> rejectProduct(@Header("Authorization") String token, @Path("id") String id);

    // Farmer
    @GET("farmers/revenue")
    Call<Map<String, Object>> getFarmerRevenue(@Header("Authorization") String token);

    // Warehouse
    @PUT("warehouse/orders/{id}/accept")
    Call<Map<String, Object>> acceptOrder(@Header("Authorization") String token, @Path("id") String id, @Body Map<String, String> body);

    @PUT("warehouse/orders/{id}/reject")
    Call<Map<String, Object>> rejectOrder(@Header("Authorization") String token, @Path("id") String id, @Body Map<String, String> body);

    @PUT("warehouse/orders/{id}/ship")
    Call<Map<String, Object>> markForShipping(@Header("Authorization") String token, @Path("id") String id, @Body Map<String, String> body);

    @PUT("warehouse/orders/{id}/deliver")
    Call<Map<String, Object>> confirmDelivery(@Header("Authorization") String token, @Path("id") String id);

    @GET("warehouse/stats")
    Call<Map<String, Integer>> getWarehouseStats(@Header("Authorization") String token);

    @GET("warehouse/orders/all")
    Call<List<Order>> getWarehouseAllOrders(@Header("Authorization") String token);

    // Shipment Manager
    @GET("shipment/orders")
    Call<List<Order>> getAcceptedOrders(@Header("Authorization") String token);

    @GET("shipment/delivery-boys")
    Call<List<User>> getDeliveryBoys(@Header("Authorization") String token);

    @PUT("shipment/orders/{id}/assign")
    Call<Map<String, Object>> assignDeliveryBoy(@Header("Authorization") String token, @Path("id") String id, @Body Map<String, String> body);

    @PUT("shipment/orders/{id}/ship")
    Call<Map<String, Object>> markAsShipped(@Header("Authorization") String token, @Path("id") String id);

    // Delivery Boy
    @GET("delivery/my-orders")
    Call<List<Order>> getMyDeliveries(@Header("Authorization") String token);

    @GET("delivery/my-completed")
    Call<List<Order>> getMyCompletedDeliveries(@Header("Authorization") String token);

    @PUT("delivery/orders/{id}/deliver")
    Call<Map<String, Object>> markAsDelivered(@Header("Authorization") String token, @Path("id") String id);

    // Blockchain
    @GET("blockchain/wallet/{userId}")
    Call<Map<String, String>> getWalletInfo(@Header("Authorization") String token, @Path("userId") String userId);

    @POST("blockchain/wallet/create")
    Call<Map<String, String>> createWallet(@Header("Authorization") String token);

    @POST("blockchain/verify-product")
    Call<Map<String, Object>> verifyProductOnBlockchain(@Body Map<String, Object> data);
}
