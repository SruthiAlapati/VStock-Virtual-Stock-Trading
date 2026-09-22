import { useState } from "react";
import axios from "axios";
import "../css/Signup.css";

function Signup({ goToLogin }) {

    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {

        e.preventDefault();

        if (user.password !== user.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            const res = await axios.post(
                "http://localhost:8080/api/auth/signup",
                {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    password: user.password
                }
            );

            alert(res.data);

            if (res.data === "Signup Successful") {
                goToLogin();
            }

        } catch (err) {
            alert("Signup Failed");
            console.log(err);
        }
    };

    return (

        <div className="signup-container">

            <h2>Create Account</h2>

            <p className="signup-subtitle">
                Join Virtual Stock Trading
            </p>

            <form onSubmit={handleSignup}>

                <div className="row">

                    <div className="input-group">

                        <label>First Name</label>

                        <input
                            type="text"
                            name="firstName"
                            value={user.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                        />

                    </div>

                    <div className="input-group">

                        <label>Last Name</label>

                        <input
                            type="text"
                            name="lastName"
                            value={user.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                        />

                    </div>

                </div>

                <div className="input-group">

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        placeholder="Enter Email"
                    />

                </div>

                <div className="input-group">

                    <label>Phone Number</label>

                    <input
                        type="text"
                        name="phoneNumber"
                        value={user.phoneNumber}
                        onChange={handleChange}
                        placeholder="Phone Number"
                    />

                </div>

                <div className="input-group">

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        placeholder="Password"
                    />

                </div>

                <div className="input-group">

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={user.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                    />

                </div>

                <button type="submit" className="signup-btn">

                    Sign Up

                </button>

            </form>

            <p className="signup-bottom">

                Already have an account?

                <span onClick={goToLogin}>
                    Login
                </span>

            </p>

        </div>

    );
}

export default Signup;