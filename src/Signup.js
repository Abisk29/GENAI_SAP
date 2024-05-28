import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "./userData";
import "./Signup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = registerUser(email, password);
    if (result.success) {
      setSuccess(result.message);
      setError("");
      setTimeout(() => navigate("/"), 2000); // Redirect to login after 2 seconds
    } else {
      setError(result.message);
      setSuccess("");
    }
  };

  return (
    <div className="signup-bg">
      <div className="signup-text-container">
        <div className="text">
          SORT and SAVE!<br></br>
          your Money, your Way
        </div>
        <div className="signup-container">
          <form onSubmit={handleSubmit} className="signup-form">
            <h1>Sign Up</h1>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
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
              Sign Up
            </button>
          </form>
          <div className="login">
            Already a user? <Link to="/">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
