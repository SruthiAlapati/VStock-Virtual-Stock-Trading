package com.stock.dto;

public class DashboardResponse {

    private String firstName;
    private Double balance;
    private Double portfolioValue;
    private int stocksOwned;
    private int totalTrades;

    public DashboardResponse() {
    }

    public DashboardResponse(String firstName,
                             Double balance,
                             Double portfolioValue,
                             int stocksOwned,
                             int totalTrades) {

        this.firstName = firstName;
        this.balance = balance;
        this.portfolioValue = portfolioValue;
        this.stocksOwned = stocksOwned;
        this.totalTrades = totalTrades;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public Double getPortfolioValue() {
        return portfolioValue;
    }

    public void setPortfolioValue(Double portfolioValue) {
        this.portfolioValue = portfolioValue;
    }

    public int getStocksOwned() {
        return stocksOwned;
    }

    public void setStocksOwned(int stocksOwned) {
        this.stocksOwned = stocksOwned;
    }

    public int getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(int totalTrades) {
        this.totalTrades = totalTrades;
    }

}