import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/BuyStocks.css";

function BuyStocks() {

    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");

    const [search, setSearch] = useState("");

    const stocks = [
        { company: "Reliance Industries", symbol: "RELIANCE", price: 2895 },
        { company: "Tata Consultancy Services", symbol: "TCS", price: 3521 },
        { company: "Infosys", symbol: "INFY", price: 1642 },
        { company: "HDFC Bank", symbol: "HDFCBANK", price: 1750 },
        { company: "ICICI Bank", symbol: "ICICIBANK", price: 1280 },
        { company: "State Bank of India", symbol: "SBIN", price: 825 },
        { company: "ITC", symbol: "ITC", price: 420 },
        { company: "Hindustan Unilever", symbol: "HINDUNILVR", price: 2650 },
        { company: "Bharti Airtel", symbol: "BHARTIARTL", price: 1950 },
        { company: "Larsen & Toubro", symbol: "LT", price: 3650 },
        { company: "Wipro", symbol: "WIPRO", price: 510 },
        { company: "Axis Bank", symbol: "AXISBANK", price: 1180 },
        { company: "Kotak Mahindra Bank", symbol: "KOTAKBANK", price: 1950 },
        { company: "Maruti Suzuki", symbol: "MARUTI", price: 14500 },
        { company: "Tata Motors", symbol: "TATAMOTORS", price: 980 },
        { company: "Sun Pharmaceutical", symbol: "SUNPHARMA", price: 1750 },
        { company: "Asian Paints", symbol: "ASIANPAINT", price: 2450 },
        { company: "Bajaj Finance", symbol: "BAJFINANCE", price: 9200 },
        { company: "Titan Company", symbol: "TITAN", price: 3800 },
        { company: "Adani Enterprises", symbol: "ADANIENT", price: 2600 },
        { company: "Adani Ports", symbol: "ADANIPORTS", price: 1450 },
        { company: "HCL Technologies", symbol: "HCLTECH", price: 1600 },
        { company: "Tech Mahindra", symbol: "TECHM", price: 1750 },
        { company: "Power Grid Corporation", symbol: "POWERGRID", price: 350 },
        { company: "NTPC", symbol: "NTPC", price: 400 }
    ];

    const filteredStocks = stocks.filter((stock) =>
        stock.company.toLowerCase().includes(search.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(search.toLowerCase())
    );


    const buyStock = async (stock) => {

        const quantityInput = prompt(
            `Enter quantity for ${stock.company}`
        );

        const quantity = Number(quantityInput);

        if (!quantity || quantity <= 0) {
            alert("Please enter a valid quantity");
            return;
        }

        try {

            await axios.post(
                "http://localhost:8080/api/portfolio/buy",
                {
                    userId: Number(userId),
                    company: stock.company,
                    symbol: stock.symbol,
                    quantity: quantity,
                    buyPrice: stock.price,
                    currentPrice: stock.price
                }
            );

            alert(
                `${stock.company} purchased successfully!`
            );

            navigate("/portfolio");

        } catch (error) {

            console.error(error);

            if (error.response) {

                alert(
                    error.response.data ||
                    "Unable to buy stock"
                );

            } else {

                alert(
                    "Backend is not responding"
                );
            }
        }
    };


    return (

        <div className="buy-stocks-container">

            <div className="buy-header">

                <div>
                    <h1>Buy Stocks</h1>

                    <p>
                        Browse all available stocks and start investing
                    </p>
                </div>

                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

            </div>


            <div className="stock-search">

                <input
                    type="text"
                    placeholder="Search stocks by company or symbol..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>


            <div className="stocks-grid">

                {filteredStocks.map((stock) => (

                    <div
                        className="stock-card"
                        key={stock.symbol}
                    >

                        <div className="stock-info">

                            <h2>
                                {stock.company}
                            </h2>

                            <span>
                                {stock.symbol}
                            </span>

                        </div>


                        <div className="stock-price">

                            <p>Current Price</p>

                            <h3>
                                ₹{stock.price.toLocaleString("en-IN")}
                            </h3>

                        </div>


                        <button
                            className="buy-button"
                            onClick={() =>
                                buyStock(stock)
                            }
                        >
                            Buy Stock
                        </button>

                    </div>

                ))}

            </div>


            {filteredStocks.length === 0 && (

                <div className="no-stocks">

                    <h3>No stocks found</h3>

                    <p>
                        Try searching for another company or symbol.
                    </p>

                </div>

            )}

        </div>
    );
}

export default BuyStocks;