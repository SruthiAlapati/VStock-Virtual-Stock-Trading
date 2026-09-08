import "../css/Profile.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Profile() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: ""
    });

    const [portfolio, setPortfolio] = useState([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("Please login first.");
            navigate("/");
            return;
        }

        const loadProfileData = async () => {

            try {

                setLoading(true);

                // Get user details
                const profileResponse = await axios.get(
                    `http://localhost:8080/api/auth/profile/${userId}`
                );

                setUser(profileResponse.data);

                // Get actual portfolio
                const portfolioResponse = await axios.get(
                    `http://localhost:8080/api/portfolio/${userId}`
                );

                setPortfolio(
                    Array.isArray(portfolioResponse.data)
                        ? portfolioResponse.data
                        : []
                );

                // Get actual balance
                const balanceResponse = await axios.get(
                    `http://localhost:8080/api/portfolio/balance/${userId}`
                );

                setBalance(Number(balanceResponse.data) || 0);

            } catch (error) {

                console.error("Profile loading error:", error);

                if (error.response) {
                    console.log("Backend response:", error.response.data);
                }

                alert("Unable to load profile information.");

            } finally {
                setLoading(false);
            }
        };

        loadProfileData();

    }, [navigate]);


    // ---------------------------------------
    // PORTFOLIO CALCULATIONS
    // ---------------------------------------

    const totalStocks = portfolio.length;

    const totalQuantity = portfolio.reduce(
        (total, stock) => total + Number(stock.quantity || 0),
        0
    );

    const totalInvestment = portfolio.reduce(
        (total, stock) =>
            total +
            (Number(stock.buyPrice || 0) *
                Number(stock.quantity || 0)),
        0
    );

    const currentPortfolioValue = portfolio.reduce(
        (total, stock) =>
            total +
            (Number(stock.currentPrice || stock.buyPrice || 0) *
                Number(stock.quantity || 0)),
        0
    );

    const totalProfit = currentPortfolioValue - totalInvestment;

    const profitPercentage =
        totalInvestment > 0
            ? (totalProfit / totalInvestment) * 100
            : 0;


    // ---------------------------------------
    // FORMAT MONEY
    // ---------------------------------------

    const formatMoney = (value) => {

        return `₹${Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    };


    return (

        <div className="profile-page">

            {/* HEADER */}

            <div className="profile-header">

                {/* PROFILE CARD */}

                <div className="profile-card">

                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="Profile"
                    />

                    <h2>
                        {user.firstName} {user.lastName}
                    </h2>

                    <p>{user.email}</p>

                </div>


                {/* USER DETAILS */}

                <div className="details-card">

                    <h2>User Details</h2>

                    <p>
                        <strong>First Name :</strong>{" "}
                        {user.firstName || "-"}
                    </p>

                    <p>
                        <strong>Last Name :</strong>{" "}
                        {user.lastName || "-"}
                    </p>

                    <p>
                        <strong>Email :</strong>{" "}
                        {user.email || "-"}
                    </p>

                    <p>
                        <strong>Phone :</strong>{" "}
                        {user.phoneNumber || "-"}
                    </p>

                    <p>
                        <strong>Available Balance :</strong>{" "}
                        <span className="green">
                            {formatMoney(balance)}
                        </span>
                    </p>

                    <button
                        onClick={() => navigate("/dashboard")}
                    >
                        Back
                    </button>

                </div>

            </div>


            {/* SUMMARY */}

            <div className="summary">

                <div className="box">

                    <h3>Stocks Owned</h3>

                    <h2>
                        {loading ? "..." : totalStocks}
                    </h2>

                </div>


                <div className="box">

                    <h3>Total Investment</h3>

                    <h2>
                        {loading
                            ? "..."
                            : formatMoney(totalInvestment)}
                    </h2>

                </div>


                <div className="box">

                    <h3>Portfolio Value</h3>

                    <h2>
                        {loading
                            ? "..."
                            : formatMoney(currentPortfolioValue)}
                    </h2>

                </div>


                <div className="box">

                    <h3>Total Profit/Loss</h3>

                    <h2
                        className={
                            totalProfit >= 0
                                ? "green"
                                : "red"
                        }
                    >
                        {loading
                            ? "..."
                            : `${totalProfit >= 0 ? "+" : ""}${formatMoney(totalProfit)}`}
                    </h2>

                    {!loading && (
                        <small
                            className={
                                totalProfit >= 0
                                    ? "green"
                                    : "red"
                            }
                        >
                            {totalProfit >= 0 ? "+" : ""}
                            {profitPercentage.toFixed(2)}%
                        </small>
                    )}

                </div>

            </div>


            {/* CURRENT HOLDINGS */}

            <div className="history">

                <div className="history-header">

                    <h2>My Holdings</h2>

                    <button
                        onClick={() => navigate("/portfolio")}
                    >
                        View Portfolio
                    </button>

                </div>


                {loading ? (

                    <div className="empty-message">
                        Loading portfolio...
                    </div>

                ) : portfolio.length === 0 ? (

                    <div className="empty-message">

                        <h3>No Stocks Purchased</h3>

                        <p>
                            You haven't purchased any stocks yet.
                        </p>

                        <button
                            onClick={() => navigate("/buy-stocks")}
                        >
                            Buy Stocks
                        </button>

                    </div>

                ) : (

                    <table>

                        <thead>

                            <tr>
                                <th>Company</th>
                                <th>Symbol</th>
                                <th>Quantity</th>
                                <th>Buy Price</th>
                                <th>Current Price</th>
                                <th>Investment</th>
                                <th>Profit/Loss</th>
                            </tr>

                        </thead>

                        <tbody>

                            {portfolio.map((stock) => {

                                const quantity =
                                    Number(stock.quantity || 0);

                                const buyPrice =
                                    Number(stock.buyPrice || 0);

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
                                    currentValue - investment;

                                return (

                                    <tr key={stock.id}>

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
                                            {formatMoney(buyPrice)}
                                        </td>

                                        <td>
                                            {formatMoney(currentPrice)}
                                        </td>

                                        <td>
                                            {formatMoney(investment)}
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
                                                : ""}
                                            {formatMoney(profit)}
                                        </td>

                                    </tr>

                                );

                            })}

                        </tbody>

                    </table>

                )}

            </div>

        </div>

    );

}

export default Profile;