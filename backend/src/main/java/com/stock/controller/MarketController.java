package com.stock.controller;

import com.stock.service.MarketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "http://localhost:5173")
public class MarketController {

    @Autowired
    private MarketService marketService;

    @GetMapping("/stocks")
    public String getAllStocks() {

        return marketService.getAllStocks();
    }

    @GetMapping("/search")
    public String searchStock(
            @RequestParam String symbol) {

        return marketService.searchStock(
                symbol
        );
    }

    @GetMapping("/history")
    public String getHistory(
            @RequestParam String symbol,
            @RequestParam(
                    defaultValue = "1day"
            )
            String interval,
            @RequestParam(
                    defaultValue = "30"
            )
            int outputsize) {

        return marketService.getHistory(
                symbol,
                interval,
                outputsize
        );
    }

    @GetMapping("/quote")
    public String getQuote(
            @RequestParam String symbol) {

        return marketService.getQuote(
                symbol
        );
    }
}