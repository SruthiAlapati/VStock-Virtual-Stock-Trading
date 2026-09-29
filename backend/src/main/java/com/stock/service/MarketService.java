package com.stock.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MarketService {

    @Value("${twelvedata.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate =
            new RestTemplate();

    // =========================================================
    // ALL INDIAN STOCKS
    // =========================================================

    public String getAllStocks() {

        String url =
                "https://api.twelvedata.com/stocks"
                + "?country=India"
                + "&type=Common Stock"
                + "&apikey="
                + apiKey;

        try {

            String response =
                    restTemplate.getForObject(
                            url,
                            String.class
                    );

            System.out.println(
                    "Stocks API Response:"
            );

            System.out.println(
                    response
            );

            return response;

        } catch (Exception e) {

            e.printStackTrace();

            return """
                    {
                        "status":"error",
                        "message":"Unable to load Indian stocks"
                    }
                    """;
        }
    }

    // =========================================================
    // SEARCH STOCK
    // =========================================================

    public String searchStock(
            String symbol) {

        String url =
                "https://api.twelvedata.com/symbol_search"
                + "?symbol="
                + symbol
                + "&apikey="
                + apiKey;

        try {

            return restTemplate.getForObject(
                    url,
                    String.class
            );

        } catch (Exception e) {

            e.printStackTrace();

            return """
                    {
                        "status":"error",
                        "message":"Unable to search stock"
                    }
                    """;
        }
    }

    // =========================================================
    // HISTORICAL DATA
    // =========================================================

    public String getHistory(
            String symbol,
            String interval,
            int outputsize) {

        String url =
                "https://api.twelvedata.com/time_series"
                + "?symbol="
                + symbol
                + "&interval="
                + interval
                + "&outputsize="
                + outputsize
                + "&timezone=Asia/Kolkata"
                + "&apikey="
                + apiKey;

        System.out.println(
                "History Request: "
                + url.replace(
                        apiKey,
                        "HIDDEN"
                )
        );

        try {

            String response =
                    restTemplate.getForObject(
                            url,
                            String.class
                    );

            System.out.println(
                    "History Response:"
            );

            System.out.println(
                    response
            );

            return response;

        } catch (Exception e) {

            e.printStackTrace();

            return """
                    {
                        "status":"error",
                        "message":"Unable to load historical data"
                    }
                    """;
        }
    }

    // =========================================================
    // CURRENT QUOTE
    // =========================================================

    public String getQuote(
            String symbol) {

        String url =
                "https://api.twelvedata.com/quote"
                + "?symbol="
                + symbol
                + "&apikey="
                + apiKey;

        System.out.println(
                "Quote Request: "
                + url.replace(
                        apiKey,
                        "HIDDEN"
                )
        );

        try {

            String response =
                    restTemplate.getForObject(
                            url,
                            String.class
                    );

            System.out.println(
                    "Quote Response:"
            );

            System.out.println(
                    response
            );

            return response;

        } catch (Exception e) {

            e.printStackTrace();

            return """
                    {
                        "status":"error",
                        "message":"Unable to load quote"
                    }
                    """;
        }
    }
}