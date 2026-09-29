package com.croplink.models;

public class Wallet {
    private String address;
    private String balance;
    private boolean isCreated;
    private String balanceUnit;

    public Wallet() {
    }

    public Wallet(String address, String balance) {
        this.address = address;
        this.balance = balance;
        this.isCreated = true;
        this.balanceUnit = "MATIC";
    }

    // Getters and Setters
    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBalance() {
        return balance;
    }

    public void setBalance(String balance) {
        this.balance = balance;
    }

    public boolean isCreated() {
        return isCreated;
    }

    public void setCreated(boolean created) {
        isCreated = created;
    }

    public String getBalanceUnit() {
        return balanceUnit;
    }

    public void setBalanceUnit(String balanceUnit) {
        this.balanceUnit = balanceUnit;
    }
}
