package com.stock.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.stock.entity.Portfolio;
import com.stock.service.PortfolioService;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:5173")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;


    // =========================
    // GET PORTFOLIO
    // =========================
    @GetMapping("/{userId}")
    public List<Portfolio> getPortfolio(
            @PathVariable Long userId) {

        return portfolioService.getPortfolio(userId);
    }


    // =========================
    // GET BALANCE
    // =========================
    @GetMapping("/balance/{userId}")
    public Double getBalance(
            @PathVariable Long userId) {

        return portfolioService.getBalance(userId);
    }


    // =========================
    // BUY STOCK
    // =========================
    @PostMapping("/buy")
    public Portfolio buyStock(
            @RequestBody Portfolio portfolio) {

        return portfolioService.buyStock(portfolio);
    }


    // =========================
    // ADD FUNDS
    // =========================
    @PostMapping("/add-funds/{userId}")
    public Double addFunds(
            @PathVariable Long userId,
            @RequestBody AddFundsRequest request) {

        return portfolioService.addFunds(
                userId,
                request.getAmount()
        );
    }


    // =========================
    // SELL STOCK
    // =========================
    @PostMapping("/sell/{userId}/{portfolioId}/{quantity}")
    public Portfolio sellStock(
            @PathVariable Long userId,
            @PathVariable Long portfolioId,
            @PathVariable int quantity) {

        return portfolioService.sellStock(
                userId,
                portfolioId,
                quantity
        );
    }


    // =========================
    // ADD FUNDS REQUEST
    // =========================
    public static class AddFundsRequest {

        private double amount;

        public double getAmount() {
            return amount;
        }

        public void setAmount(double amount) {
            this.amount = amount;
        }
    }
}