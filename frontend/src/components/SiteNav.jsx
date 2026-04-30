import { Link } from 'react-router-dom'

const SiteNav = () => {
  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link to="/" className="logo" aria-label="Fluxora home">
          Fluxora
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#modules">Suites</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn ghost">Login</Link>
          <Link to="/signup" className="btn primary">Sign Up</Link>
        </div>
      </nav>
    </header>
  )
}

export default SiteNav
