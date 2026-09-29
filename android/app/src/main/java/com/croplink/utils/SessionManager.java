package com.croplink.utils;

import android.content.Context;
import android.content.SharedPreferences;

import com.croplink.models.User;

public class SessionManager {
    private static final String PREF_NAME = "CropLinkSession";
    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";
    private static final String KEY_USER_ID = "userId";
    private static final String KEY_USER_NAME = "userName";
    private static final String KEY_USER_EMAIL = "userEmail";
    private static final String KEY_USER_ROLE = "userRole";
    private static final String KEY_USER_FARM_LOCATION = "userFarmLocation";
    private static final String KEY_TOKEN = "userToken";
    private static final String KEY_LANGUAGE = "language";
    private static final String KEY_WALLET_ADDRESS = "walletAddress";
    private static final String KEY_WALLET_CREATED = "walletCreated";

    private SharedPreferences pref;
    private SharedPreferences.Editor editor;
    private Context context;

    public SessionManager(Context context) {
        this.context = context;
        pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = pref.edit();
    }

    // Save user session
    public void createLoginSession(User user) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putString(KEY_USER_ID, user.getId());
        editor.putString(KEY_USER_NAME, user.getName());
        editor.putString(KEY_USER_EMAIL, user.getEmail());
        editor.putString(KEY_USER_ROLE, user.getRole());
        
        // Save farm location if user is a farmer
        if (user.getFarmLocation() != null && !user.getFarmLocation().isEmpty()) {
            editor.putString(KEY_USER_FARM_LOCATION, user.getFarmLocation());
        }
        
        if (user.getToken() != null) {
            editor.putString(KEY_TOKEN, user.getToken());
        }
        
        if (user.getWalletAddress() != null) {
            editor.putString(KEY_WALLET_ADDRESS, user.getWalletAddress());
        }
        editor.putBoolean(KEY_WALLET_CREATED, user.isWalletCreated());
        
        editor.apply();
    }

    // Check if user is logged in
    public boolean isLoggedIn() {
        return pref.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    // Get user role
    public String getUserRole() {
        return pref.getString(KEY_USER_ROLE, "");
    }

    // Get user name
    public String getUserName() {
        return pref.getString(KEY_USER_NAME, "");
    }

    // Get user email
    public String getUserEmail() {
        return pref.getString(KEY_USER_EMAIL, "");
    }

    // Get user ID
    public String getUserId() {
        return pref.getString(KEY_USER_ID, "");
    }

    // Get farm location
    public String getFarmLocation() {
        return pref.getString(KEY_USER_FARM_LOCATION, "");
    }

    public String getToken() {
        return pref.getString(KEY_TOKEN, "");
    }

    // Get full user object
    public User getUser() {
        if (!isLoggedIn()) {
            return null;
        }

        User user = new User();
        user.setId(getUserId());
        user.setName(getUserName());
        user.setEmail(getUserEmail());
        user.setRole(getUserRole());
        
        // Set farm location if available
        String farmLocation = getFarmLocation();
        if (farmLocation != null && !farmLocation.isEmpty()) {
            user.setFarmLocation(farmLocation);
        }
        
        user.setToken(getToken());
        
        String walletAddress = pref.getString(KEY_WALLET_ADDRESS, null);
        if (walletAddress != null) {
            user.setWalletAddress(walletAddress);
        }
        user.setWalletCreated(pref.getBoolean(KEY_WALLET_CREATED, false));
        
        return user;
    }

    // Logout user
    public void logoutUser() {
        editor.clear();
        editor.apply();
    }

    // Language preference
    public void setLanguage(String languageCode) {
        editor.putString(KEY_LANGUAGE, languageCode);
        editor.putBoolean("language_selected", true); // Mark that user has selected language
        editor.apply();
    }

    public String getLanguage() {
        return pref.getString(KEY_LANGUAGE, "en"); // Default to English
    }
    
    public boolean isLanguageSelected() {
        return pref.getBoolean("language_selected", false);
    }

    // Registered users management
    private static final String PREF_REGISTERED_USERS = "CropLinkRegisteredUsers";
    private static final String KEY_REGISTERED_COUNT = "registeredCount";
    
    /**
     * Save a newly registered user to SharedPreferences
     * @param user User to register
     * @return true if registration successful, false if email already exists
     */
    public boolean registerUser(User user) {
        // Check if email already exists
        if (isEmailRegistered(user.getEmail())) {
            return false;
        }
        
        SharedPreferences registeredPref = context.getSharedPreferences(
                PREF_REGISTERED_USERS, Context.MODE_PRIVATE);
        SharedPreferences.Editor registeredEditor = registeredPref.edit();
        
        // Get current count
        int count = registeredPref.getInt(KEY_REGISTERED_COUNT, 0);
        
        // Save user data with unique prefix
        String prefix = "user_" + count + "_";
        registeredEditor.putString(prefix + "id", user.getId());
        registeredEditor.putString(prefix + "name", user.getName());
        registeredEditor.putString(prefix + "email", user.getEmail());
        registeredEditor.putString(prefix + "password", user.getPassword());
        registeredEditor.putString(prefix + "role", user.getRole());
        
        if (user.getFarmLocation() != null && !user.getFarmLocation().isEmpty()) {
            registeredEditor.putString(prefix + "farmLocation", user.getFarmLocation());
        }
        
        // Increment count
        registeredEditor.putInt(KEY_REGISTERED_COUNT, count + 1);
        registeredEditor.apply();
        
        return true;
    }
    
    /**
     * Check if email is already registered
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    public boolean isEmailRegistered(String email) {
        SharedPreferences registeredPref = context.getSharedPreferences(
                PREF_REGISTERED_USERS, Context.MODE_PRIVATE);
        
        int count = registeredPref.getInt(KEY_REGISTERED_COUNT, 0);
        
        for (int i = 0; i < count; i++) {
            String prefix = "user_" + i + "_";
            String storedEmail = registeredPref.getString(prefix + "email", "");
            if (storedEmail.equalsIgnoreCase(email.trim())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Validate credentials for registered users
     * @param email User email
     * @param password User password
     * @return true if credentials match, false otherwise
     */
    public boolean validateRegisteredUser(String email, String password) {
        SharedPreferences registeredPref = context.getSharedPreferences(
                PREF_REGISTERED_USERS, Context.MODE_PRIVATE);
        
        int count = registeredPref.getInt(KEY_REGISTERED_COUNT, 0);
        
        for (int i = 0; i < count; i++) {
            String prefix = "user_" + i + "_";
            String storedEmail = registeredPref.getString(prefix + "email", "");
            String storedPassword = registeredPref.getString(prefix + "password", "");
            
            if (storedEmail.equalsIgnoreCase(email.trim()) && storedPassword.equals(password)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get registered user by email
     * @param email User email
     * @return User object if found, null otherwise
     */
    public User getRegisteredUserByEmail(String email) {
        SharedPreferences registeredPref = context.getSharedPreferences(
                PREF_REGISTERED_USERS, Context.MODE_PRIVATE);
        
        int count = registeredPref.getInt(KEY_REGISTERED_COUNT, 0);
        
        for (int i = 0; i < count; i++) {
            String prefix = "user_" + i + "_";
            String storedEmail = registeredPref.getString(prefix + "email", "");
            
            if (storedEmail.equalsIgnoreCase(email.trim())) {
                User user = new User();
                user.setId(registeredPref.getString(prefix + "id", ""));
                user.setName(registeredPref.getString(prefix + "name", ""));
                user.setEmail(storedEmail);
                user.setPassword(registeredPref.getString(prefix + "password", ""));
                user.setRole(registeredPref.getString(prefix + "role", ""));
                
                String farmLocation = registeredPref.getString(prefix + "farmLocation", "");
                if (!farmLocation.isEmpty()) {
                    user.setFarmLocation(farmLocation);
                }
                
                return user;
            }
        }
        
        return null;
    }
}
