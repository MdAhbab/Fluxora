import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import heroIllustration from '../assets/landing-hero.svg'

const Landing = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observerInstance.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )

    const targets = document.querySelectorAll('.reveal')
    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const highlights = [
    { label: 'Buildings Live', value: '128+' },
    { label: 'Monthly Invoices', value: '42k' },
    { label: 'Avg. Resolution', value: '3.2 hrs' },
  ]

  const features = [
    {
      title: 'Finance & Billing',
      body: 'Automate service charges, track utilities, and push reminders in a single flow.',
    },
    {
      title: 'Visitor Intelligence',
      body: 'QR-based approvals, live gate logs, and instant resident notifications.',
    },
    {
      title: 'Maintenance Control',
      body: 'Route tickets, monitor SLAs, and keep vendors accountable from one board.',
    },
  ]

  const suites = [
    {
      title: 'Community & Notices',
      body: 'Pin announcements, schedule publish windows, and keep everyone aligned.',
    },
    {
      title: 'Bookings & Facilities',
      body: 'Conflict-free reservations for gyms, halls, rooftops, and parking bays.',
    },
    {
      title: 'Documents & Compliance',
      body: 'Versioned records, audit trails, and secure access controls.',
    },
    {
      title: 'Emergency & Security',
      body: 'SOS actions, intercom logs, and live lift status monitoring.',
    },
  ]

  return (
    <div className="page landing">
      <SiteNav />

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow reveal">Fluxora Building OS</p>
            <h1 className="reveal" style={{ '--delay': '100ms' }}>
              Run every apartment operation from one confident workspace.
            </h1>
            <p className="subtitle reveal" style={{ '--delay': '180ms' }}>
              Finance, security, maintenance, and community tools designed to keep every resident
              experience effortless and transparent.
            </p>
            <div className="hero-actions reveal" style={{ '--delay': '240ms' }}>
              <Link to="/signup" className="btn primary">Start free trial</Link>
              <a href="#pricing" className="btn outline">See pricing</a>
            </div>
            <div className="hero-stats reveal" style={{ '--delay': '320ms' }}>
              {highlights.map((item) => (
                <div key={item.label} className="stat-card">
                  <div className="stat-value">{item.value}</div>
                  <div className="stat-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual reveal" style={{ '--delay': '160ms' }}>
            <div className="hero-panel">
              <img src={heroIllustration} alt="Apartment building overview" />
              <div className="hero-panel-overlay">
                <div>
                  <p className="panel-title">Live Operations</p>
                  <p className="panel-sub">Gate logs, payments, and alerts in sync.</p>
                </div>
                <Link to="/dashboard" className="btn ghost">View dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section features">
        <div className="container">
          <div className="section-head">
            <h2 className="reveal">Everything a building manager needs</h2>
            <p className="muted reveal" style={{ '--delay': '120ms' }}>
              Built for multi-building operations with tenant isolation, reporting, and automation.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((item, index) => (
              <article
                key={item.title}
                className="feature-card reveal"
                style={{ '--delay': `${index * 120 + 80}ms` }}
              >
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="section suites">
        <div className="container suites-grid">
          <div>
            <p className="eyebrow reveal">Suites</p>
            <h2 className="reveal" style={{ '--delay': '120ms' }}>
              Modular, but fully connected.
            </h2>
            <p className="muted reveal" style={{ '--delay': '200ms' }}>
              Plug in only what you need or go full-suite across security, finance, and resident tools.
            </p>
            <div className="suite-pill reveal" style={{ '--delay': '280ms' }}>
              API-ready for intercoms, mobile guard apps, and reporting exports.
            </div>
          </div>
          <div className="suite-cards">
            {suites.map((suite, index) => (
              <div
                key={suite.title}
                className="suite-card reveal"
                style={{ '--delay': `${index * 120 + 80}ms` }}
              >
                <h3>{suite.title}</h3>
                <p>{suite.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section pricing">
        <div className="container">
          <div className="section-head">
            <h2 className="reveal">Pricing that scales with your community</h2>
            <p className="muted reveal" style={{ '--delay': '120ms' }}>
              Start lean, unlock advanced automation and analytics as your portfolio grows.
            </p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card reveal" style={{ '--delay': '80ms' }}>
              <h3>Starter</h3>
              <p className="price">$129<span>/mo</span></p>
              <ul>
                <li>Finance + Notices</li>
                <li>Resident directory</li>
                <li>Email support</li>
              </ul>
              <button className="btn outline">Get started</button>
            </div>
            <div className="pricing-card featured reveal" style={{ '--delay': '160ms' }}>
              <h3>Growth</h3>
              <p className="price">$349<span>/mo</span></p>
              <ul>
                <li>Visitor, booking, and maintenance</li>
                <li>Mobile guard access</li>
                <li>Automated reminders</li>
              </ul>
              <button className="btn primary">Book a demo</button>
            </div>
            <div className="pricing-card reveal" style={{ '--delay': '240ms' }}>
              <h3>Enterprise</h3>
              <p className="price">Custom</p>
              <ul>
                <li>Multi-building analytics</li>
                <li>Dedicated success lead</li>
                <li>Custom integrations</li>
              </ul>
              <button className="btn outline">Talk to sales</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta">
        <div className="container cta-panel reveal">
          <div>
            <h2>Bring your building into one operating system.</h2>
            <p className="muted">
              Launch in days with guided onboarding and prebuilt workflows for every department.
            </p>
          </div>
          <Link to="/signup" className="btn primary">Start building</Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

export default Landing
