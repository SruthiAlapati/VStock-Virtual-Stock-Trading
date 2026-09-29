package com.stock.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.stock.entity.Portfolio;
import com.stock.entity.User;
import com.stock.repository.PortfolioRepository;
import com.stock.repository.UserRepository;

@Service
public class PortfolioService {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private UserRepository userRepository;


    // =========================
    // GET USER HOLDINGS
    // =========================
    public List<Portfolio> getPortfolio(Long userId) {

        return portfolioRepository.findByUserId(userId);
    }


    // =========================
    // BUY STOCK
    // =========================
    public Portfolio buyStock(Portfolio portfolio) {

        User user = userRepository.findById(portfolio.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (portfolio.getQuantity() <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        if (portfolio.getBuyPrice() <= 0) {
            throw new RuntimeException("Invalid stock price");
        }

        double totalCost =
                portfolio.getQuantity() * portfolio.getBuyPrice();


        // Check balance
        if (user.getBalance() < totalCost) {

            throw new RuntimeException(
                    "Insufficient balance. Available balance: ₹"
                    + user.getBalance()
            );
        }


        // Deduct purchase amount
        user.setBalance(
                user.getBalance() - totalCost
        );

        userRepository.save(user);


        // Save purchased stock
        return portfolioRepository.save(portfolio);
    }


    // =========================
    // SELL STOCK
    // =========================
    public Portfolio sellStock(
            Long userId,
            Long portfolioId,
            int quantity) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() ->
                        new RuntimeException("Stock holding not found"));


        // Security check
        if (!portfolio.getUserId().equals(userId)) {

            throw new RuntimeException(
                    "You cannot sell this stock"
            );
        }


        if (quantity <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }


        if (quantity > portfolio.getQuantity()) {

            throw new RuntimeException(
                    "You don't own enough shares"
            );
        }


        // Money received from selling
        double sellAmount =
                quantity * portfolio.getCurrentPrice();


        // Add money to balance
        user.setBalance(
                user.getBalance() + sellAmount
        );

        userRepository.save(user);


        // Reduce holding quantity
        int remainingQuantity =
                portfolio.getQuantity() - quantity;


        if (remainingQuantity == 0) {

            portfolioRepository.delete(portfolio);

            return portfolio;
        }


        portfolio.setQuantity(remainingQuantity);

        return portfolioRepository.save(portfolio);
    }


    // =========================
    // GET BALANCE
    // =========================
    public Double getBalance(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return user.getBalance();
    }


    // =========================
    // ADD FUNDS
    // =========================
    public Double addFunds(Long userId, double amount) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        if (amount <= 0) {

            throw new RuntimeException(
                    "Amount must be greater than 0"
            );
        }


        // Maximum amount allowed per addition
        double maximumFunds = 100000;


        if (amount > maximumFunds) {

            throw new RuntimeException(
                    "Maximum amount allowed is ₹100,000"
            );
        }


        // Add money to account
        user.setBalance(
                user.getBalance() + amount
        );


        userRepository.save(user);


        return user.getBalance();
    }
}