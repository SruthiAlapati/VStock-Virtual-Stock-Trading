import Login from "../components/Login";
import "../css/Home.css";
import stockImage from "../assets/stock-bg.jpg";

function Home() {
  return (
    <div className="home">

      {/* Left Side */}
      <div className="left">

        <img
          src={stockImage}
          alt="Stock Trading"
          className="stock-image"
        />

        <div className="overlay"></div>

        <div className="hero-text">

          <h1>Virtual Stock Trading</h1>

          <p>Learn • Practice • Invest</p>
        </div>

      </div>

      {/* Right Side */}
      <div className="right">

        <div className="glass-card">
          <Login />
        </div>

      </div>

    </div>
  );
}

export default Home;