import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, authStore } from '../lib/api'
import '../landing-premium.css'

const suites = [
  'Finance',
  'Visitors',
  'Maintenance',
  'Messaging',
  'Documents',
  'Units & Occupancy',
  'Assets & Compliance',
  'Parking & Access',
]

const Signup = () => {
  const [selectedSuites, setSelectedSuites] = useState(['Finance', 'Maintenance', 'Messaging', 'Units & Occupancy'])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const summary = useMemo(() => {
    if (selectedSuites.length === suites.length) return 'Full-suite workspace'
    return `${selectedSuites.length} modules selected`
  }, [selectedSuites])

  const toggleSuite = (suite) => {
    setSelectedSuites((current) => (
      current.includes(suite)
        ? current.filter((item) => item !== suite)
        : [...current, suite]
    ))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(false)
    setError('')
    setIsSubmitting(true)
    const form = new FormData(event.currentTarget)
    if (form.get('password') !== form.get('confirm')) {
      setError('Passwords do not match.')
      setIsSubmitting(false)
      return
    }
    try {
      const session = await authApi.signup({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
        building_name: form.get('building'),
        modules: selectedSuites,
      })
      authStore.setSession(session)
      setSubmitted(true)
      setTimeout(() => navigate('/dashboard'), 450)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page auth-page premium-auth signup-auth">
      <section className="auth-visual signup-visual">
        <Link to="/" className="logo auth-logo">Fluxora</Link>
        <div className="auth-visual-copy">
          <p className="eyebrow">Create Workspace</p>
          <h1>Launch a building OS with the modules you need first.</h1>
          <p>Set your building identity, choose your operating suite, and move straight into the dashboard demo.</p>
        </div>
        <div className="auth-signal-grid setup-grid" aria-hidden="true">
          <div><span>Setup</span><strong>8 min</strong></div>
          <div><span>Modules</span><strong>{selectedSuites.length}</strong></div>
          <div><span>Mode</span><strong>Demo</strong></div>
        </div>
      </section>

      <section className="auth-card modern-auth-card signup-card">
        <div className="auth-brand">
          <p className="eyebrow">Signup</p>
          <h2>Create your workspace</h2>
          <p className="muted">{summary}. You can change modules later.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" placeholder="Jane Doe" required />
            </div>
            <div className="field">
              <label htmlFor="building">Building name</label>
              <input id="building" name="building" type="text" placeholder="Alpha Tower" required />
            </div>
          </div>
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>
          <div className="auth-form-grid">
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" placeholder="Create password" required />
            </div>
            <div className="field">
              <label htmlFor="confirm">Confirm</label>
              <input id="confirm" name="confirm" type="password" placeholder="Repeat password" required />
            </div>
          </div>

          <div className="suite-picker" aria-label="Select starting modules">
            {suites.map((suite) => (
              <button
                className={selectedSuites.includes(suite) ? 'active' : ''}
                key={suite}
                type="button"
                onClick={() => toggleSuite(suite)}
              >
                {suite}
              </button>
            ))}
          </div>

          <button className="btn primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create workspace'}
          </button>
        </form>

        {submitted && (
          <div className="auth-message">
            Workspace created. <Link to="/dashboard">Open dashboard</Link>
          </div>
        )}
        {error && <div className="auth-message error">{error}</div>}

        <div className="auth-footer">
          <span className="muted">Already have access?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </section>
    </div>
  )
}

export default Signup
