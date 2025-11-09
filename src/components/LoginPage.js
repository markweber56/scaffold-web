import Login from '../hooks/Login'

function LoginPage() {

  const {
    email,
    setEmail,
    password,
    setPassword,
    message,
    messageColor,
    handleLogin
  } = Login();
  

  return (
    <div className="full-page">
      <div className="login-container">
      <h2 style={{ color: '#4fc3f7', textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      <form onSubmit={handleLogin}>
        <input
        type="email"
        placeholder="Email"
        className="login-input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        />
        <input
        type="password"
        placeholder="Password"
        className="login-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        />
        <button type="submit" className="login-button">Login</button>
      </form>
      {<p style={{color: messageColor, textAlign: 'center'}}>{message}</p>}
      </div>
    </div>
  );
}

export default LoginPage;