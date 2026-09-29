package com.croplink.models;

public class Transaction {
    private String hash;
    private String from;
    private String to;
    private String value;
    private String timestamp;
    private String status;
    private String type; // "sent" or "received"

    public Transaction() {
    }

    public Transaction(String hash, String from, String to, String value) {
        this.hash = hash;
        this.from = from;
        this.to = to;
        this.value = value;
        this.status = "completed";
    }

    // Getters and Setters
    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
