import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import BuyStocks from "./pages/BuyStocks";
import Market from "./pages/Market";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/portfolio" element={<Portfolio/>} />
      <Route path="/buy-stocks" element={<BuyStocks />} />
  <Route path="/dashboard/market" element={<Market />} />

    </Routes>
  );
}

export default App;