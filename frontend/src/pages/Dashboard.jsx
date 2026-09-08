import "../css/Dashboard.css";
import { useNavigate, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState({
        firstName: "",
        balance: 0,
        portfolioValue: 0,
        stocksOwned: 0,
        totalTrades: 0
    });

    const [holdings, setHoldings] = useState([]);
    const [loading, setLoading] = useState(true);

    // ---------------------------------------
    // LOGOUT
    // ---------------------------------------

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };


    // ---------------------------------------
    // FORMAT MONEY
    // ---------------------------------------

    const formatMoney = (value) => {

        return Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    };


    // ---------------------------------------
    // LOAD DASHBOARD DATA
    // ---------------------------------------

    useEffect(() => {

        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("Please login first.");
            navigate("/");
            return;
        }

        const loadDashboard = async () => {

            try {

                setLoading(true);

                // Get dashboard/user information
                const dashboardResponse = await axios.get(
                    `http://localhost:8080/api/auth/dashboard/${userId}`
                );

                const dashboardData = dashboardResponse.data;

                // Get actual portfolio
                const portfolioResponse = await axios.get(
                    `http://localhost:8080/api/portfolio/${userId}`
                );

                const portfolioData =
                    Array.isArray(portfolioResponse.data)
                        ? portfolioResponse.data
                        : [];

                setHoldings(portfolioData);


                // Get actual balance
                const balanceResponse = await axios.get(
                    `http://localhost:8080/api/portfolio/balance/${userId}`
                );

                const actualBalance =
                    Number(balanceResponse.data) || 0;


                // Calculate portfolio value
                const portfolioValue = portfolioData.reduce(
                    (total, stock) => {

                        const quantity =
                            Number(stock.quantity || 0);

                        const currentPrice =
                            Number(
                                stock.currentPrice ||
                                stock.buyPrice ||
                                0
                            );

                        return total +
                            (quantity * currentPrice);

                    },
                    0
                );


                // Calculate total investment
                const totalInvestment = portfolioData.reduce(
                    (total, stock) => {

                        const quantity =
                            Number(stock.quantity || 0);

                        const buyPrice =
                            Number(stock.buyPrice || 0);

                        return total +
                            (quantity * buyPrice);

                    },
                    0
                );


                // Calculate profit
                const totalProfit =
                    portfolioValue - totalInvestment;


                // Update dashboard
                setDashboard({

                    ...dashboardData,

                    balance: actualBalance,

                    portfolioValue: portfolioValue,

                    stocksOwned: portfolioData.length

                });


                // Store calculated values if needed
                console.log("Total Investment:", totalInvestment);
                console.log("Total Profit:", totalProfit);

            } catch (error) {

                console.error(
                    "Dashboard loading error:",
                    error
                );

                if (error.response) {
                    console.log(
                        "Backend response:",
                        error.response.data
                    );
                }

                alert(
                    "Unable to load dashboard information."
                );

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, [navigate]);


    // ---------------------------------------
    // CALCULATE DASHBOARD VALUES
    // ---------------------------------------

    const totalInvestment = holdings.reduce(
        (total, stock) =>
            total +
            (
                Number(stock.buyPrice || 0) *
                Number(stock.quantity || 0)
            ),
        0
    );


    const totalPortfolioValue = holdings.reduce(
        (total, stock) =>
            total +
            (
                Number(
                    stock.currentPrice ||
                    stock.buyPrice ||
                    0
                ) *
                Number(stock.quantity || 0)
            ),
        0
    );


    const totalProfit =
        totalPortfolioValue - totalInvestment;


    return (

        <div className="dashboard">

            {/* ======================================
                SIDEBAR
            ====================================== */}

            <div className="sidebar">

                <h2 className="logo">
                    📈 VStock
                </h2>

                <ul>

                    <li className="active">
                        🏠 Dashboard
                    </li>


                    <Link
                        to="/dashboard/market"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            padding: "16px 20px",
                            fontSize: "18px",
                            boxSizing: "border-box"
                        }}
                    >
                        📈 Market
                    </Link>


                    <li
                        onClick={() =>
                            navigate("/portfolio")
                        }
                    >
                        💼 Portfolio
                    </li>


                    <Link
                        to="/buy-stocks"
                        style={{
                            color: "white",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            padding: "16px 20px",
                            fontSize: "18px",
                            boxSizing: "border-box"
                        }}
                    >
                        💰 Buy Stocks
                    </Link>


                    <li
                        onClick={() =>
                            navigate("/sell")
                        }
                    >
                        📉 Sell Stocks
                    </li>


                    <li
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        👤 Profile
                    </li>


                    <li
                        onClick={handleLogout}
                        style={{
                            cursor: "pointer"
                        }}
                    >
                        🚪 Logout
                    </li>

                </ul>

            </div>


            {/* ======================================
                MAIN
            ====================================== */}

            <div className="main">

                {/* TOP BAR */}

                <div className="topbar">

                    <div>

                        <h1>
                            Welcome, {dashboard.firstName} 👋
                        </h1>

                        <p>
                            Track your virtual investments.
                        </p>

                    </div>

                </div>


                {/* ======================================
                    DASHBOARD CARDS
                ====================================== */}

                <div className="cards">


                    {/* BALANCE */}

                    <div className="card">

                        <h4>
                            Virtual Balance
                        </h4>

                        <h2>

                            {loading
                                ? "Loading..."
                                : `₹${formatMoney(
                                    dashboard.balance
                                )}`}

                        </h2>

                    </div>


                    {/* PORTFOLIO VALUE */}

                    <div className="card">

                        <h4>
                            Portfolio Value
                        </h4>

                        <h2>

                            {loading
                                ? "Loading..."
                                : `₹${formatMoney(
                                    totalPortfolioValue
                                )}`}

                        </h2>

                    </div>


                    {/* PROFIT */}

                    <div className="card">

                        <h4>
                            Total Profit
                        </h4>

                        <h2
                            className={
                                totalProfit >= 0
                                    ? "green"
                                    : "red"
                            }
                        >

                            {loading
                                ? "Loading..."
                                : `${totalProfit >= 0
                                    ? "+"
                                    : "-"
                                }₹${formatMoney(
                                    Math.abs(totalProfit)
                                )}`}

                        </h2>

                    </div>


                    {/* STOCKS */}

                    <div className="card">

                        <h4>
                            Stocks Owned
                        </h4>

                        <h2>

                            {loading
                                ? "..."
                                : holdings.length}

                        </h2>

                    </div>

                </div>


                {/* ======================================
                    EXTRA SUMMARY
                ====================================== */}

                <div className="cards">

                    <div className="card">

                        <h4>
                            Total Investment
                        </h4>

                        <h2>
                            {loading
                                ? "Loading..."
                                : `₹${formatMoney(
                                    totalInvestment
                                )}`}
                        </h2>

                    </div>


                    <div className="card">

                        <h4>
                            Current Portfolio
                        </h4>

                        <h2>
                            {loading
                                ? "Loading..."
                                : `₹${formatMoney(
                                    totalPortfolioValue
                                )}`}
                        </h2>

                    </div>

                </div>


                {/* ======================================
                    HOLDINGS
                ====================================== */}

                <div className="market-table">

                    <div className="table-header">

                        <h2>
                            Your Holdings
                        </h2>

                        <button
                            onClick={() =>
                                navigate("/portfolio")
                            }
                        >
                            View Portfolio
                        </button>

                    </div>


                    {loading ? (

                        <p style={{ padding: "20px" }}>
                            Loading holdings...
                        </p>

                    ) : holdings.length === 0 ? (

                        <div
                            style={{
                                padding: "30px",
                                textAlign: "center"
                            }}
                        >

                            <h3>
                                No Stocks Purchased
                            </h3>

                            <p>
                                You haven't purchased
                                any stocks yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/buy-stocks")
                                }
                            >
                                Buy Stocks
                            </button>

                        </div>

                    ) : (

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Company
                                    </th>

                                    <th>
                                        Symbol
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Buy Price
                                    </th>

                                    <th>
                                        Current Price
                                    </th>

                                    <th>
                                        Profit/Loss
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {holdings.map((stock) => {

                                    const quantity =
                                        Number(
                                            stock.quantity || 0
                                        );

                                    const buyPrice =
                                        Number(
                                            stock.buyPrice || 0
                                        );

                                    const currentPrice =
                                        Number(
                                            stock.currentPrice ||
                                            stock.buyPrice ||
                                            0
                                        );

                                    const investment =
                                        buyPrice * quantity;

                                    const currentValue =
                                        currentPrice * quantity;

                                    const profit =
                                        currentValue -
                                        investment;


                                    return (

                                        <tr
                                            key={stock.id}
                                        >

                                            <td>
                                                {stock.company}
                                            </td>

                                            <td>
                                                {stock.symbol}
                                            </td>

                                            <td>
                                                {quantity}
                                            </td>

                                            <td>
                                                ₹{formatMoney(
                                                    buyPrice
                                                )}
                                            </td>

                                            <td>
                                                ₹{formatMoney(
                                                    currentPrice
                                                )}
                                            </td>

                                            <td
                                                className={
                                                    profit >= 0
                                                        ? "green"
                                                        : "red"
                                                }
                                            >
                                                {profit >= 0
                                                    ? "+"
                                                    : "-"}
                                                ₹{formatMoney(
                                                    Math.abs(profit)
                                                )}
                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    )}

                </div>


                {/* ======================================
                    RECENT TRANSACTIONS
                ====================================== */}

                <div className="market-table">

                    <div className="table-header">

                        <h2>
                            Recent Transactions
                        </h2>

                    </div>


                    <div
                        style={{
                            padding: "25px",
                            textAlign: "center",
                            color: "#666"
                        }}
                    >

                        <p>
                            Transaction history will appear
                            here after the transaction backend
                            is added.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/portfolio")
                            }
                        >
                            View Portfolio
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Dashboard;