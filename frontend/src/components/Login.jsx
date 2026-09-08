import { useState } from "react";
import axios from "axios";
import "../css/Login.css";
import Signup from "./Signup";
import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [showSignup, setShowSignup] = useState(false);

    const [login, setLogin] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {

        setLogin({
            ...login,
            [e.target.name]: e.target.value
        });

    };

    const handleLogin = async (e) => {

    e.preventDefault();

    try {

        const res = await axios.post(
            "http://localhost:8080/api/auth/login",
            login
        );
if (res.data.message === "Login Successful") {

    localStorage.setItem("userId", res.data.id);
    localStorage.setItem("firstName", res.data.firstName);
    localStorage.setItem("lastName", res.data.lastName);
    localStorage.setItem("email", res.data.email);

    navigate("/dashboard");
}

    } catch (err) {

        alert("Login Failed");

    }

};
    if (showSignup) {
        return <Signup goToLogin={() => setShowSignup(false)} />;
    }

    return (

        <div className="login-container">

            <h2>Welcome Back 👋</h2>

            <p className="subtitle">
                Login to your account
            </p>

            <form onSubmit={handleLogin}>

                <div className="input-group">

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={login.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />

                </div>

                <div className="input-group">

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={login.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                    />

                </div>

                <button type="submit" className="login-btn">

                    Login

                </button>

            </form>

            <p className="bottom-text">

                Don't have an account?

                <span onClick={() => setShowSignup(true)}>
                    Sign Up
                </span>

            </p>

        </div>

    );

}

export default Login;