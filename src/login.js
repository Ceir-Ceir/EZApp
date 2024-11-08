// src/Login.js
import React from 'react';

function Login() {
  return (
    <div className="login-page">
      <h2>Login</h2>
      {/* Add your login form here */}
      <form>
        <div>
          <label>Username</label>
          <input type="text" name="username" />
        </div>
        <div>
          <label>Password</label>
          <input type="password" name="password" />
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
