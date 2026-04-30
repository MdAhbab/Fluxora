import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, authStore } from '../lib/api'

const Login = () => {
  const [role, setRole] = useState('Manager')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSubmitting(true)
    const form = new FormData(event.currentTarget)
    try {
      const session = await authApi.login(form.get('email'), form.get('password'))
      authStore.setSession(session)
      setMessage(`${role} session ready. Redirecting to dashboard...`)
      setTimeout(() => navigate('/dashboard'), 350)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page auth-page modern-auth">
      <section className="auth-visual">
        <Link to="/" className="logo auth-logo">Fluxora</Link>
        <div className="auth-visual-copy">
          <p className="eyebrow">Secure Access</p>
          <h1>Return to your building command center.</h1>
          <p>Review payments, respond to residents, approve visitors, and keep operations moving.</p>
        </div>
        <div className="auth-signal-grid" aria-hidden="true">
          <div><span>Collections</span><strong>96%</strong></div>
          <div><span>Gate status</span><strong>Live</strong></div>
          <div><span>Unread</span><strong>5</strong></div>
        </div>
      </section>

      <section className="auth-card modern-auth-card">
        <div className="auth-brand">
          <p className="eyebrow">Login</p>
          <h2>Welcome back</h2>
          <p className="muted">Use a seeded stakeholder credential after running the demo seed command.</p>
        </div>

        <div className="role-tabs" role="tablist" aria-label="Login role">
          {['Manager', 'Resident', 'Guard'].map((item) => (
            <button
              className={role === item ? 'active' : ''}
              key={item}
              type="button"
              onClick={() => setRole(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@fluxora.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter your password" required />
          </div>
          <label className="auth-check">
            <input type="checkbox" defaultChecked />
            <span>Keep me signed in on this device</span>
          </label>
          <button className="btn primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {message && <div className="auth-message">{message} <Link to="/dashboard">Open dashboard</Link></div>}
        {error && <div className="auth-message error">{error}</div>}

        <div className="auth-footer">
          <span className="muted">New here?</span>
          <Link to="/signup">Create an account</Link>
        </div>
      </section>
    </div>
  )
}

export default Login
