import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div className="page auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" className="logo">Fluxora</Link>
          <p className="muted">Welcome back to the building command center.</p>
        </div>
        <form className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@fluxora.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter your password" required />
          </div>
          <button className="btn primary" type="submit">Sign in</button>
        </form>
        <div className="auth-footer">
          <span className="muted">New here?</span>
          <Link to="/signup">Create an account</Link>
        </div>
      </div>
      <div className="auth-panel">
        <h2>Operate with clarity.</h2>
        <p>
          Monitor collections, track visitors, and resolve tickets faster with Fluxora workflows.
        </p>
        <div className="auth-highlights">
          <div>
            <span>98%</span>
            <p>On-time invoice reminders</p>
          </div>
          <div>
            <span>24/7</span>
            <p>Security visibility</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
