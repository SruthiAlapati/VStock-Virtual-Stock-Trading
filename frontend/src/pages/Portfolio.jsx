import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Portfolio.css";

function Portfolio() {

    const navigate = useNavigate();

    const userId = localStorage.getItem("userId");

    const [balance, setBalance] = useState(0);
    const [holdings, setHoldings] = useState([]);

    const [showSearch, setShowSearch] = useState(false);
    const [showAddFunds, setShowAddFunds] = useState(false);

    const [search, setSearch] = useState("");
    const [fundAmount, setFundAmount] = useState("");

    const [sortOption, setSortOption] = useState("default");
    const [filterOption, setFilterOption] = useState("all");

    // Available stocks
    const availableStocks = [
        {
            company: "Reliance Industries",
            symbol: "RELIANCE",
            price: 2895
        },
        {
            company: "Infosys",
            symbol: "INFY",
            price: 1642
        },
        {
            company: "TCS",
            symbol: "TCS",
            price: 3521
        },
        {
            company: "HDFC Bank",
            symbol: "HDFCBANK",
            price: 1750
        },
        {
            company: "ICICI Bank",
            symbol: "ICICIBANK",
            price: 1280
        }
    ];

    // ===============================
    // LOAD PORTFOLIO
    // ===============================

    const loadPortfolio = async () => {

        if (!userId) {
            alert("Please login first");
            navigate("/");
            return;
        }

        try {

            const portfolioResponse = await axios.get(
                `http://localhost:8080/api/portfolio/${userId}`
            );

            setHoldings(portfolioResponse.data);

        } catch (error) {

            console.error("Portfolio loading error:", error);

            alert("Unable to load portfolio");

        }
    };


    // ===============================
    // LOAD BALANCE
    // ===============================

    const loadBalance = async () => {

        try {

            const response = await axios.get(
                `http://localhost:8080/api/portfolio/balance/${userId}`
            );

            setBalance(response.data);

        } catch (error) {

            console.error("Balance loading error:", error);

        }
    };


    // ===============================
    // INITIAL LOAD
    // ===============================

    useEffect(() => {

        loadPortfolio();
        loadBalance();

    }, []);


    // ===============================
    // BUY STOCK
    // ===============================

    const buyStock = async (stock) => {

        const quantityInput = prompt(
            `Enter quantity for ${stock.company}:`
        );

        const quantity = Number(quantityInput);

        if (!quantity || quantity <= 0) {
            alert("Enter a valid quantity");
            return;
        }

        const totalCost = quantity * stock.price;

        if (totalCost > balance) {

            alert(
                `Insufficient balance.\n\nRequired: ₹${totalCost.toFixed(2)}\nAvailable: ₹${balance.toFixed(2)}`
            );

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

            setShowSearch(false);
            setSearch("");

            await loadPortfolio();
            await loadBalance();

        } catch (error) {

            console.error("Buy error:", error);

            if (error.response && error.response.data) {
                alert(error.response.data);
            } else {
                alert("Unable to buy stock");
            }
        }
    };


    // ===============================
    // ADD FUNDS
    // ===============================

    const addFunds = async () => {

        const amount = Number(fundAmount);

        if (!amount || amount <= 0) {

            alert("Enter a valid amount");

            return;
        }

        // Maximum ₹100,000 per addition
        if (amount > 100000) {

            alert(
                "You can add a maximum of ₹100,000 at a time."
            );

            return;
        }

        try {

            await axios.post(
                `http://localhost:8080/api/portfolio/add-funds/${userId}`,
                {
                    amount: amount
                }
            );

            alert(
                `₹${amount.toFixed(2)} added successfully!`
            );

            setFundAmount("");
            setShowAddFunds(false);

            await loadBalance();

        }  catch (error) {

    console.error("ADD FUNDS ERROR:", error);

    if (error.response) {

        console.log("Status:", error.response.status);
        console.log("Response:", error.response.data);

        alert(
            "Backend Error: " +
            error.response.status +
            "\n\n" +
            JSON.stringify(error.response.data)
        );

    } else if (error.request) {

        console.log("No response from backend:", error.request);

        alert(
            "Backend is not responding.\n\n" +
            "Make sure Spring Boot is running on port 8080."
        );

    } else {

        console.log("Request error:", error.message);

        alert("Error: " + error.message);
    }

        }
    };


    // ===============================
    // SEARCH
    // ===============================

    const filteredStocks = availableStocks.filter((stock) => {

        return (
            stock.company
                .toLowerCase()
                .includes(search.toLowerCase()) ||

            stock.symbol
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    });


    // ===============================
    // SORT
    // ===============================

    let displayedHoldings = [...holdings];

    if (sortOption === "name") {

        displayedHoldings.sort((a, b) =>
            a.company.localeCompare(b.company)
        );

    }

    if (sortOption === "profitHigh") {

        displayedHoldings.sort((a, b) => {

            const profitA =
                (a.currentPrice - a.buyPrice) *
                a.quantity;

            const profitB =
                (b.currentPrice - b.buyPrice) *
                b.quantity;

            return profitB - profitA;

        });

    }

    if (sortOption === "profitLow") {

        displayedHoldings.sort((a, b) => {

            const profitA =
                (a.currentPrice - a.buyPrice) *
                a.quantity;

            const profitB =
                (b.currentPrice - b.buyPrice) *
                b.quantity;

            return profitA - profitB;

        });

    }


    // ===============================
    // FILTER
    // ===============================

    if (filterOption === "profit") {

        displayedHoldings =
            displayedHoldings.filter((stock) =>
                stock.currentPrice > stock.buyPrice
            );

    }

    if (filterOption === "loss") {

        displayedHoldings =
            displayedHoldings.filter((stock) =>
                stock.currentPrice < stock.buyPrice
            );

    }


    // ===============================
    // CALCULATE PORTFOLIO VALUE
    // ===============================

    const portfolioValue = holdings.reduce(
        (total, stock) =>
            total +
            stock.currentPrice * stock.quantity,
        0
    );


    // ===============================
    // TOTAL PROFIT
    // ===============================

    const totalProfit = holdings.reduce(
        (total, stock) =>
            total +
            (stock.currentPrice - stock.buyPrice) *
            stock.quantity,
        0
    );


    return (
        <div className="portfolio-container">

            {/* HEADER */}

            <div className="portfolio-header">

                <div>

                    <h1>My Portfolio</h1>

                    <p>
                        Track your investments and holdings
                    </p>

                </div>

                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

            </div>


            {/* SUMMARY */}

            <div className="portfolio-summary">

                <div className="summary-card">

                    <h3>Available Balance</h3>

                    <h2>
                        ₹{balance.toLocaleString("en-IN", {
                            minimumFractionDigits: 2
                        })}
                    </h2>

                    <button
                        onClick={() => setShowAddFunds(true)}
                    >
                        + Add Funds
                    </button>

                </div>


                <div className="summary-card">

                    <h3>Portfolio Value</h3>

                    <h2>
                        ₹{portfolioValue.toLocaleString("en-IN", {
                            minimumFractionDigits: 2
                        })}
                    </h2>

                </div>


                <div className="summary-card">

                    <h3>Total Profit / Loss</h3>

                    <h2 className={
                        totalProfit >= 0
                            ? "profit"
                            : "loss"
                    }>

                        {totalProfit >= 0 ? "+" : ""}
                        ₹{totalProfit.toLocaleString("en-IN", {
                            minimumFractionDigits: 2
                        })}

                    </h2>

                </div>

            </div>


            {/* ACTIONS */}

            <div className="portfolio-actions">

                <button
                    onClick={() => setShowSearch(true)}
                >
                    🔍 Search Stock
                </button>


                <select
                    value={sortOption}
                    onChange={(e) =>
                        setSortOption(e.target.value)
                    }
                >

                    <option value="default">
                        Sort
                    </option>

                    <option value="name">
                        Name
                    </option>

                    <option value="profitHigh">
                        Highest Profit
                    </option>

                    <option value="profitLow">
                        Lowest Profit
                    </option>

                </select>


                <select
                    value={filterOption}
                    onChange={(e) =>
                        setFilterOption(e.target.value)
                    }
                >

                    <option value="all">
                        All Stocks
                    </option>

                    <option value="profit">
                        Profit
                    </option>

                    <option value="loss">
                        Loss
                    </option>

                </select>

            </div>


            {/* HOLDINGS */}

            <div className="holdings-section">

                <h2>Your Holdings</h2>


                {displayedHoldings.length === 0 ? (

                    <div className="empty-portfolio">

                        <h3>
                            No stocks in your portfolio
                        </h3>

                        <p>
                            Click "Search Stock" to find and
                            purchase stocks.
                        </p>

                        <button
                            onClick={() =>
                                setShowSearch(true)
                            }
                        >
                            Search Stocks
                        </button>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table>

                            <thead>

                                <tr>

                                    <th>Company</th>
                                    <th>Symbol</th>
                                    <th>Quantity</th>
                                    <th>Buy Price</th>
                                    <th>Current Price</th>
                                    <th>Investment</th>
                                    <th>Current Value</th>
                                    <th>Profit / Loss</th>

                                </tr>

                            </thead>


                            <tbody>

                                {displayedHoldings.map((stock) => {

                                    const investment =
                                        stock.buyPrice *
                                        stock.quantity;

                                    const currentValue =
                                        stock.currentPrice *
                                        stock.quantity;

                                    const profit =
                                        currentValue -
                                        investment;


                                    return (

                                        <tr key={stock.id}>

                                            <td>
                                                {stock.company}
                                            </td>

                                            <td>
                                                {stock.symbol}
                                            </td>

                                            <td>
                                                {stock.quantity}
                                            </td>

                                            <td>
                                                ₹{stock.buyPrice}
                                            </td>

                                            <td>
                                                ₹{stock.currentPrice}
                                            </td>

                                            <td>
                                                ₹{investment.toLocaleString("en-IN")}
                                            </td>

                                            <td>
                                                ₹{currentValue.toLocaleString("en-IN")}
                                            </td>

                                            <td
                                                className={
                                                    profit >= 0
                                                        ? "profit"
                                                        : "loss"
                                                }
                                            >

                                                {profit >= 0
                                                    ? "+"
                                                    : ""
                                                }

                                                ₹{profit.toLocaleString("en-IN")}

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* SEARCH POPUP */}

            {showSearch && (

                <div className="modal-overlay">

                    <div className="search-modal">

                        <div className="modal-header">

                            <h2>
                                Search Stocks
                            </h2>

                            <button
                                onClick={() =>
                                    setShowSearch(false)
                                }
                            >
                                ✕
                            </button>

                        </div>


                        <input
                            type="text"
                            placeholder="Search company or symbol..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />


                        <div className="stock-search-results">

                            {filteredStocks.length === 0 ? (

                                <p>
                                    No stocks found
                                </p>

                            ) : (

                                filteredStocks.map((stock) => (

                                    <div
                                        className="search-stock-item"
                                        key={stock.symbol}
                                    >

                                        <div>

                                            <strong>
                                                {stock.company}
                                            </strong>

                                            <span>
                                                {stock.symbol}
                                            </span>

                                        </div>


                                        <div>

                                            <strong>
                                                ₹{stock.price}
                                            </strong>

                                            <button
                                                onClick={() =>
                                                    buyStock(stock)
                                                }
                                            >
                                                Buy
                                            </button>

                                        </div>

                                    </div>

                                ))

                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* ADD FUNDS POPUP */}

            {showAddFunds && (

                <div className="modal-overlay">

                    <div className="add-funds-modal">

                        <div className="modal-header">

                            <h2>
                                Add Funds
                            </h2>

                            <button
                                onClick={() =>
                                    setShowAddFunds(false)
                                }
                            >
                                ✕
                            </button>

                        </div>


                        <p>
                            Maximum ₹100,000 per addition
                        </p>


                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={fundAmount}
                            onChange={(e) =>
                                setFundAmount(e.target.value)
                            }
                        />


                        <button
                            onClick={addFunds}
                        >
                            Add Funds
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Portfolio;