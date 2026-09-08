import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import "../css/Market.css";

const API_BASE = "http://localhost:8080/api/market";
function Market() {
    const navigate = useNavigate();

    const [stocks, setStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);

    const [search, setSearch] = useState("");

    const [chartData, setChartData] = useState([]);

    const [currentPrice, setCurrentPrice] = useState(0);
    const [change, setChange] = useState(0);
    const [percentChange, setPercentChange] = useState(0);

    const [currency, setCurrency] = useState("INR");

    const [marketStatus, setMarketStatus] =
        useState("Loading market data...");

    const [errorMessage, setErrorMessage] =
        useState("");

    const [loadingCompanies, setLoadingCompanies] =
        useState(true);

    const [loadingChart, setLoadingChart] =
        useState(false);

    const [selectedRange, setSelectedRange] =
        useState("1D");

    const socketRef = useRef(null);

    // =========================================================
    // FORMAT CURRENCY
    // =========================================================

    const formatPrice = (value) => {
        const number = Number(value);

        if (isNaN(number)) {
            return "₹0.00";
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    // =========================================================
    // GET API SYMBOL
    // =========================================================

    const getApiSymbol = (stock) => {
        if (!stock) {
            return "";
        }

        const symbol = String(
            stock.symbol || ""
        ).trim().toUpperCase();

        const exchange = String(
            stock.exchange || ""
        ).trim().toUpperCase();

        // Already qualified
        if (symbol.includes(":")) {
            return symbol;
        }

        // NSE
        if (
            exchange === "NSE" ||
            exchange.includes("NATIONAL STOCK EXCHANGE")
        ) {
            return `${symbol}:NSE`;
        }

        // BSE
        if (
            exchange === "BSE" ||
            exchange.includes("BOMBAY STOCK EXCHANGE")
        ) {
            return `${symbol}:BSE`;
        }

        // Default Indian exchange
        return `${symbol}:NSE`;
    };

    // =========================================================
    // LOAD ALL INDIAN STOCKS
    // =========================================================

    const loadCompanies = async () => {
        try {
            setLoadingCompanies(true);
            setErrorMessage("");
            setMarketStatus("Loading Indian companies...");

            const response = await axios.get(
                `${API_BASE}/stocks`
            );

            console.log(
                "RAW Stocks Response:",
                response.data
            );

            let stocksResponse = response.data;

            // IMPORTANT:
            // Spring Boot returns String JSON
            if (typeof stocksResponse === "string") {
                try {
                    stocksResponse =
                        JSON.parse(stocksResponse);
                } catch (error) {
                    console.error(
                        "Stocks JSON Parse Error:",
                        error
                    );

                    throw new Error(
                        "Backend returned invalid stock data."
                    );
                }
            }

            console.log(
                "PARSED Stocks Response:",
                stocksResponse
            );

            if (
                stocksResponse?.status === "error"
            ) {
                throw new Error(
                    stocksResponse.message ||
                    "Unable to load stocks."
                );
            }

            let data = [];

            if (
                stocksResponse &&
                Array.isArray(stocksResponse.data)
            ) {
                data = stocksResponse.data;
            } else if (
                Array.isArray(stocksResponse)
            ) {
                data = stocksResponse;
            }

            // =================================================
            // FILTER ONLY INDIAN REAL STOCKS
            // =================================================

            const indianStocks = data.filter((stock) => {

                const symbol = String(
                    stock.symbol || ""
                ).toUpperCase();

                const name = String(
                    stock.name || ""
                ).toUpperCase();

                const country = String(
                    stock.country || ""
                ).toUpperCase();

                const exchange = String(
                    stock.exchange || ""
                ).toUpperCase();

                // Remove Twelve Data test symbols
                if (
                    symbol.includes("TEST") ||
                    name.includes("TEST")
                ) {
                    return false;
                }

                const isIndia =
                    country === "INDIA" ||
                    country === "IN";

                const isIndianExchange =
                    exchange === "NSE" ||
                    exchange === "BSE" ||
                    exchange.includes(
                        "NATIONAL STOCK EXCHANGE"
                    ) ||
                    exchange.includes(
                        "BOMBAY STOCK EXCHANGE"
                    );

                return (
                    isIndia ||
                    isIndianExchange
                );
            });

            // =================================================
            // REMOVE DUPLICATES
            // =================================================

            const uniqueMap = new Map();

            indianStocks.forEach((stock) => {

                const symbol = String(
                    stock.symbol || ""
                )
                    .trim()
                    .toUpperCase();

                const exchange = String(
                    stock.exchange || ""
                )
                    .trim()
                    .toUpperCase();

                if (!symbol) {
                    return;
                }

                const key =
                    `${symbol}-${exchange}`;

                if (!uniqueMap.has(key)) {
                    uniqueMap.set(
                        key,
                        stock
                    );
                }
            });

            const uniqueStocks =
                Array.from(
                    uniqueMap.values()
                );

            console.log(
                "Indian Stocks:",
                uniqueStocks
            );

            if (uniqueStocks.length === 0) {
                throw new Error(
                    "No Indian stocks were returned by Twelve Data."
                );
            }

            setStocks(uniqueStocks);

            // =================================================
            // DEFAULT STOCK
            // Prefer INFY because Twelve Data documents it
            // as a trial NSE symbol.
            // =================================================

            const defaultStock =
                uniqueStocks.find(
                    (stock) =>
                        String(
                            stock.symbol || ""
                        )
                            .toUpperCase() ===
                        "INFY"
                ) ||
                uniqueStocks.find(
                    (stock) =>
                        String(
                            stock.symbol || ""
                        )
                            .toUpperCase() ===
                        "RELIANCE"
                ) ||
                uniqueStocks[0];

            setSelectedStock(
                defaultStock
            );

            setMarketStatus(
                `${uniqueStocks.length} Indian companies available`
            );

        } catch (error) {

            console.error(
                "Stocks API Error:",
                error
            );

            setStocks([]);

            setSelectedStock(null);

            setMarketStatus(
                "Unable to load companies"
            );

            setErrorMessage(
                error.response?.data?.message ||
                error.message ||
                "Unable to load Indian companies."
            );

        } finally {
            setLoadingCompanies(false);
        }
    };

    // =========================================================
    // LOAD HISTORICAL DATA
    // =========================================================

    const loadHistory = async () => {

        if (!selectedStock) {
            return;
        }

        try {

            setLoadingChart(true);
            setChartData([]);
            setErrorMessage("");
            setMarketStatus(
                "Loading market data..."
            );

            const apiSymbol =
                getApiSymbol(
                    selectedStock
                );

            console.log(
                "History Symbol:",
                apiSymbol
            );

            let interval;
            let outputsize;

            // Use daily data first because it is
            // more reliable for testing the API.

            if (selectedRange === "1D") {

                interval = "1day";
                outputsize = 30;

            } else if (
                selectedRange === "1W"
            ) {

                interval = "1day";
                outputsize = 7;

            } else if (
                selectedRange === "1M"
            ) {

                interval = "1day";
                outputsize = 30;

            } else {

                interval = "1day";
                outputsize = 365;

            }

            const response =
                await axios.get(
                    `${API_BASE}/history`,
                    {
                        params: {
                            symbol: apiSymbol,
                            interval: interval,
                            outputsize:
                                outputsize,
                        },
                    }
                );

            console.log(
                "RAW History Response:",
                response.data
            );

            // =================================================
            // CONVERT STRING JSON TO OBJECT
            // =================================================

            let data =
                response.data;

            if (
                typeof data ===
                "string"
            ) {

                try {

                    data =
                        JSON.parse(
                            data
                        );

                } catch (parseError) {

                    console.error(
                        "History JSON Parse Error:",
                        parseError
                    );

                    throw new Error(
                        "Backend returned invalid historical JSON."
                    );
                }
            }

            console.log(
                "PARSED History Data:",
                data
            );

            // =================================================
            // API ERROR
            // =================================================

            if (
                data?.status ===
                "error"
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load historical data."
                );
            }

            // =================================================
            // CHECK VALUES
            // =================================================

            if (
                !data ||
                !Array.isArray(
                    data.values
                ) ||
                data.values.length ===
                    0
            ) {

                throw new Error(
                    `No historical data available for ${apiSymbol}.`
                );
            }

            // =================================================
            // FORMAT CHART DATA
            // =================================================

            const formattedData =
                [...data.values]
                    .reverse()
                    .map((item) => {

                        return {
                            time:
                                item.datetime,
                            price:
                                Number(
                                    item.close
                                ),
                        };

                    })
                    .filter(
                        (item) =>
                            !isNaN(
                                item.price
                            ) &&
                            item.price > 0
                    );

            console.log(
                "Formatted Chart Data:",
                formattedData
            );

            if (
                formattedData.length ===
                0
            ) {

                throw new Error(
                    "Historical data contains no valid prices."
                );
            }

            setChartData(
                formattedData
            );

            // =================================================
            // SET PRICE FROM LATEST DATA
            // =================================================

            const latest =
                formattedData[
                    formattedData.length - 1
                ];

            setCurrentPrice(
                latest.price
            );

            setCurrency("INR");

            setMarketStatus(
                "Market data connected"
            );

        } catch (error) {

            console.error(
                "History API Error:",
                error
            );

            setChartData([]);

            setMarketStatus(
                "Market data unavailable"
            );

            setErrorMessage(
                error.response?.data
                    ?.message ||
                error.message ||
                "Unable to load historical data."
            );

        } finally {

            setLoadingChart(false);

        }
    };

    // =========================================================
    // LOAD CURRENT QUOTE
    // =========================================================

    const loadQuote = async () => {

        if (!selectedStock) {
            return;
        }

        try {

            const apiSymbol =
                getApiSymbol(
                    selectedStock
                );

            console.log(
                "Quote Symbol:",
                apiSymbol
            );

            const response =
                await axios.get(
                    `${API_BASE}/quote`,
                    {
                        params: {
                            symbol:
                                apiSymbol,
                        },
                    }
                );

            console.log(
                "RAW Quote Response:",
                response.data
            );

            let data =
                response.data;

            // =================================================
            // CONVERT STRING JSON
            // =================================================

            if (
                typeof data ===
                "string"
            ) {

                try {

                    data =
                        JSON.parse(
                            data
                        );

                } catch (error) {

                    console.error(
                        "Quote JSON Parse Error:",
                        error
                    );

                    return;
                }
            }

            console.log(
                "PARSED Quote Response:",
                data
            );

            // =================================================
            // CURRENT PRICE
            // =================================================

            if (
                data?.close !==
                undefined
            ) {

                const price =
                    Number(
                        data.close
                    );

                if (
                    !isNaN(price) &&
                    price > 0
                ) {

                    setCurrentPrice(
                        price
                    );
                }
            }

            // =================================================
            // CHANGE
            // =================================================

            if (
                data?.change !==
                undefined
            ) {

                const value =
                    Number(
                        data.change
                    );

                if (
                    !isNaN(value)
                ) {

                    setChange(
                        value
                    );
                }
            }

            // =================================================
            // PERCENT CHANGE
            // =================================================

            if (
                data?.percent_change !==
                undefined
            ) {

                const value =
                    Number(
                        data.percent_change
                    );

                if (
                    !isNaN(value)
                ) {

                    setPercentChange(
                        value
                    );
                }
            }

            setCurrency("INR");

        } catch (error) {

            console.error(
                "Quote API Error:",
                error
            );

        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadCompanies();

    }, []);

    // =========================================================
    // LOAD DATA WHEN STOCK / RANGE CHANGES
    // =========================================================

    useEffect(() => {

        if (!selectedStock) {
            return;
        }

        loadHistory();
        loadQuote();

    }, [
        selectedStock,
        selectedRange,
    ]);

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredStocks =
        useMemo(() => {

            const value =
                search
                    .trim()
                    .toLowerCase();

            if (!value) {
                return stocks;
            }

            return stocks.filter(
                (stock) => {

                    const symbol =
                        String(
                            stock.symbol ||
                            ""
                        ).toLowerCase();

                    const name =
                        String(
                            stock.name ||
                            ""
                        ).toLowerCase();

                    return (
                        symbol.includes(
                            value
                        ) ||
                        name.includes(
                            value
                        )
                    );
                }
            );

        }, [
            stocks,
            search,
        ]);

    // =========================================================
    // SELECT STOCK
    // =========================================================

    const handleStockSelect = (
        stock
    ) => {

        setSelectedStock(
            stock
        );

        setCurrentPrice(0);
        setChange(0);
        setPercentChange(0);

        setChartData([]);

        setErrorMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // =========================================================
    // GO BACK
    // =========================================================

    const handleBack = () => {

        navigate(
            "/dashboard"
        );
    };

    // =========================================================
    // CHART TOOLTIP
    // =========================================================

    const CustomTooltip = ({
        active,
        payload,
        label,
    }) => {

        if (
            !active ||
            !payload ||
            !payload.length
        ) {
            return null;
        }

        return (
            <div
                style={{
                    background:
                        "white",
                    padding:
                        "10px 14px",
                    border:
                        "1px solid #ddd",
                    borderRadius:
                        "8px",
                    boxShadow:
                        "0 4px 12px rgba(0,0,0,0.12)",
                }}
            >
                <div
                    style={{
                        fontSize:
                            "12px",
                        color:
                            "#666",
                        marginBottom:
                            "5px",
                    }}
                >
                    {label}
                </div>

                <div
                    style={{
                        fontWeight:
                            "700",
                        fontSize:
                            "15px",
                    }}
                >
                    {formatPrice(
                        payload[0]
                            .value
                    )}
                </div>
            </div>
        );
    };

    // =========================================================
    // SELECTED STOCK DETAILS
    // =========================================================

    const selectedSymbol =
        selectedStock
            ? String(
                  selectedStock.symbol ||
                      ""
              ).toUpperCase()
            : "";

    const selectedCompany =
        selectedStock
            ? selectedStock.name ||
              selectedStock.company ||
              selectedSymbol
            : "";

    const exchange =
        selectedStock
            ? selectedStock.exchange ||
              "NSE"
            : "NSE";

    // =========================================================
    // JSX
    // =========================================================

    return (
        <div className="market-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="market-header">

                <button
                    className="market-back-btn"
                    onClick={
                        handleBack
                    }
                >
                    ← Back
                </button>

                <div>
                    <h1>
                        Market
                    </h1>

                    <p>
                        Real-time market
                        information
                        Search for company name and check the Graph
                    </p>
                </div>

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div
                className={`market-status ${
                    errorMessage
                        ? "error"
                        : ""
                }`}
            >

                <span
                    className="status-dot"
                />

                {marketStatus}

            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="market-search-section">

                <input
                    type="text"
                    placeholder="Search company or symbol..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                    className="market-search"
                />

            </div>

            {/* =================================================
                COMPANY LIST
            ================================================= */}

            <div className="company-list">

                {loadingCompanies ? (

                    <div className="market-loading">
                        Loading Indian companies...
                    </div>

                ) : filteredStocks.length ===
                  0 ? (

                    <div className="market-empty">
                        No companies found.
                    </div>

                ) : (

                    filteredStocks.map(
                        (stock, index) => {

                            const symbol =
                                String(
                                    stock.symbol ||
                                        ""
                                ).toUpperCase();

                            const name =
                                stock.name ||
                                symbol;

                            const isSelected =
                                selectedStock &&
                                String(
                                    selectedStock.symbol ||
                                        ""
                                ).toUpperCase() ===
                                    symbol &&
                                String(
                                    selectedStock.exchange ||
                                        ""
                                ).toUpperCase() ===
                                    String(
                                        stock.exchange ||
                                            ""
                                    ).toUpperCase();

                            return (
                                <button
                                    key={`${symbol}-${stock.exchange}-${index}`}
                                    className={`company-btn ${
                                        isSelected
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleStockSelect(
                                            stock
                                        )
                                    }
                                >

                                    <strong>
                                        {symbol}
                                    </strong>

                                    <span>
                                        {name}
                                    </span>

                                </button>
                            );
                        }
                    )

                )}

            </div>

            {/* =================================================
                SELECTED STOCK
            ================================================= */}

            {selectedStock && (

                <>

                    {/* =================================================
                        PRICE CARD
                    ================================================= */}

                    <div className="market-price-card">

                        <div>

                            <div className="stock-title">

                                <h2>
                                    {
                                        selectedSymbol
                                    }
                                </h2>

                                <span className="exchange-badge">
                                    {exchange}
                                </span>

                            </div>

                            <p className="stock-company-name">
                                {
                                    selectedCompany
                                }
                            </p>

                        </div>

                        <div className="price-section">

                            <div className="current-price">

                                {formatPrice(
                                    currentPrice
                                )}

                            </div>

                            <div
                                className={
                                    change >= 0
                                        ? "positive-change"
                                        : "negative-change"
                                }
                            >

                                {change >= 0
                                    ? "+"
                                    : ""}

                                {change.toFixed(
                                    2
                                )}

                                {" ("}

                                {percentChange >=
                                0
                                    ? "+"
                                    : ""}

                                {percentChange.toFixed(
                                    2
                                )}

                                {"%)"}

                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        TIME FILTER
                    ================================================= */}

                    <div className="time-filter">

                        {[
                            "1D",
                            "1W",
                            "1M",
                            "1Y",
                        ].map(
                            (range) => (

                                <button
                                    key={
                                        range
                                    }
                                    className={
                                        selectedRange ===
                                        range
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setSelectedRange(
                                            range
                                        )
                                    }
                                >
                                    {range}
                                </button>

                            )
                        )}

                    </div>

                    {/* =================================================
                        GRAPH
                    ================================================= */}

                    <div className="market-chart-card">

                        <div className="chart-header">

                            <div>

                                <h2>
                                    Market
                                    graph
                                </h2>

                                <p>
                                    {
                                        selectedCompany
                                    }
                                </p>

                            </div>

                            <span>
                                {
                                    selectedRange
                                }
                            </span>

                        </div>

                        {loadingChart ? (

                            <div className="chart-message">

                                <div className="loading-spinner" />

                                Loading chart...

                            </div>

                        ) : chartData.length ===
                          0 ? (

                            <div className="chart-message">

                                <h3>
                                    Market data unavailable
                                </h3>

                                <p>
                                    {errorMessage ||
                                        "Unable to load historical data."}
                                </p>

                            </div>

                        ) : (

                            <div
                                className="chart-container"
                            >

                                <ResponsiveContainer
                                    width="100%"
                                    height={420}
                                >

                                    <LineChart
                                        data={
                                            chartData
                                        }
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 10,
                                            bottom: 10,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="time"
                                            tick={{
                                                fontSize:
                                                    11,
                                            }}
                                            tickFormatter={(
                                                value
                                            ) => {

                                                if (
                                                    !value
                                                ) {
                                                    return "";
                                                }

                                                return String(
                                                    value
                                                ).slice(
                                                    0,
                                                    10
                                                );
                                            }}
                                        />

                                        <YAxis
                                            domain={[
                                                "auto",
                                                "auto",
                                            ]}
                                            tick={{
                                                fontSize:
                                                    11,
                                            }}
                                            tickFormatter={(
                                                value
                                            ) =>
                                                `₹${Number(
                                                    value
                                                ).toFixed(
                                                    0
                                                )}`
                                            }
                                        />

                                        <Tooltip
                                            content={
                                                <CustomTooltip />
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            strokeWidth={
                                                3
                                            }
                                            dot={
                                                false
                                            }
                                            activeDot={{
                                                r: 6,
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        )}

                    </div>

                    {/* =================================================
                        COMPANY INFORMATION
                    ================================================= */}

                    <div className="market-info-grid">

                        <div className="market-info-card">

                            <span>
                                Company
                            </span>

                            <strong>
                                {
                                    selectedCompany
                                }
                            </strong>

                        </div>

                        <div className="market-info-card">

                            <span>
                                Symbol
                            </span>

                            <strong>
                                {
                                    selectedSymbol
                                }
                            </strong>

                        </div>

                        <div className="market-info-card">

                            <span>
                                Exchange
                            </span>

                            <strong>
                                {exchange}
                            </strong>

                        </div>

                        <div className="market-info-card">

                            <span>
                                Currency
                            </span>

                            <strong>
                                ₹ INR
                            </strong>

                        </div>

                    </div>

                </>

            )}

        </div>
    );
}

export default Market;