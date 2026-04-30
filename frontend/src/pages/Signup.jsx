import { Link } from 'react-router-dom'

const Signup = () => {
  return (
    <div className="page auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" className="logo">Fluxora</Link>
          <p className="muted">Start managing your community in minutes.</p>
        </div>
        <form className="auth-form">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" placeholder="Jane Doe" required />
          </div>
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Create a password" required />
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input id="confirm" name="confirm" type="password" placeholder="Repeat password" required />
          </div>
          <button className="btn primary" type="submit">Create account</button>
        </form>
        <div className="auth-footer">
          <span className="muted">Already have access?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
      <div className="auth-panel">
        <h2>Launch your building OS.</h2>
        <p>
          Set up finance, security, and resident services with workflows tailored to your property.
        </p>
        <div className="auth-highlights">
          <div>
            <span>3 days</span>
            <p>Average onboarding</p>
          </div>
          <div>
            <span>40%</span>
            <p>Faster ticket resolution</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
