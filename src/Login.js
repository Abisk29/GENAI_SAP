import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "./userData";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = loginUser(email, password);
    if (result.success) {
      navigate("/Expense");
    } else {
      setError(result.message);
    }
  };
  return (
    <div className="login-bg">
      <div className="login-text-container">
        <div className="text">
          SORT and SAVE!<br></br>
          your Money, your Way
        </div>
        <div className="login-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h1>Log In</h1>
            {error && <p className="error">{error}</p>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="submit-btn" type="submit">
              Log in
            </button>
          </form>
          <div className="signup">
            New User? <Link to="/Signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
