import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'

const operatingMetrics = [
  ['96%', 'Collections'],
  ['14', 'Open visits'],
  ['7m', 'Avg. response'],
  ['3', 'Buildings live'],
]

const modules = [
  ['Finance', 'Invoices, payments, utility billing, and expense reporting.'],
  ['Security', 'Visitor QR, gate logs, intercom events, SOS, and lift status.'],
  ['Resident Ops', 'Notices, chat, directory, documents, polls, and facility booking.'],
  ['Maintenance', 'Ticket routing, vendor lookup, provider reviews, and staff attendance.'],
]

const workflows = [
  { title: 'Collect faster', body: 'Generate monthly invoices, track overdue balances, and record checkout events from one ledger.' },
  { title: 'Guard the entrance', body: 'Pre-register visitors, scan QR codes, unlock intercoms, and keep gate activity searchable.' },
  { title: 'Resolve visibly', body: 'Move requests through a Kanban flow with priority, assignment, and attachment handling.' },
]

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

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="page landing modern-landing">
      <SiteNav />

      <section className="landing-hero">
        <div className="hero-backdrop" aria-hidden="true">
          <div className="tower tower-a" />
          <div className="tower tower-b" />
          <div className="tower tower-c" />
        </div>
        <div className="container landing-hero-grid">
          <div className="landing-copy">
            <p className="eyebrow reveal">Fluxora Building OS</p>
            <h1 className="reveal" style={{ '--delay': '80ms' }}>One command center for modern residential operations.</h1>
            <p className="subtitle reveal" style={{ '--delay': '160ms' }}>
              Run finance, maintenance, visitors, security, documents, bookings, and resident messaging without jumping between tools.
            </p>
            <div className="hero-actions reveal" style={{ '--delay': '220ms' }}>
              <Link to="/dashboard" className="btn primary">Open dashboard</Link>
              <Link to="/signup" className="btn outline">Create workspace</Link>
            </div>
          </div>

          <div className="ops-preview reveal" style={{ '--delay': '140ms' }} aria-label="Fluxora dashboard preview">
            <div className="ops-preview-head">
              <div>
                <strong>Alpha Tower</strong>
                <span>Live operations</span>
              </div>
              <i>Online</i>
            </div>
            <div className="ops-metrics">
              {operatingMetrics.map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="ops-lanes">
              <article>
                <span>Finance</span>
                <strong>$6.4k pending</strong>
                <small>12 reminders queued</small>
              </article>
              <article>
                <span>Security</span>
                <strong>Gate active</strong>
                <small>4 visitor passes today</small>
              </article>
              <article>
                <span>Chat</span>
                <strong>3 rooms</strong>
                <small>Resident updates synced</small>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow reveal">Core Modules</p>
            <h2 className="reveal">The other stuff is inside the dashboard.</h2>
            <p className="muted reveal" style={{ '--delay': '120ms' }}>
              Every module from the brief is represented in the `/dashboard` console with working local interactions and matching backend endpoints.
            </p>
          </div>
          <div className="feature-grid module-feature-grid">
            {modules.map(([title, body], index) => (
              <article className="feature-card reveal" key={title} style={{ '--delay': `${index * 80}ms` }}>
                <span className="feature-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="section workflow-section">
        <div className="container workflow-grid">
          <div className="section-head">
            <p className="eyebrow reveal">Workflows</p>
            <h2 className="reveal">Designed around the daily rhythm of a building.</h2>
            <p className="muted reveal" style={{ '--delay': '120ms' }}>
              Fluxora keeps repeated operational work close to the people who act on it.
            </p>
          </div>
          <div className="workflow-list">
            {workflows.map((item, index) => (
              <article className="workflow-item reveal" key={item.title} style={{ '--delay': `${index * 100}ms` }}>
                <div>{index + 1}</div>
                <section>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </section>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section">
        <div className="container pricing-modern">
          <div>
            <p className="eyebrow reveal">Access</p>
            <h2 className="reveal">Start with the product, then connect live data.</h2>
            <p className="muted reveal" style={{ '--delay': '120ms' }}>
              The frontend is ready for demos now. The Django API endpoints are in place for wiring real authentication, payments, documents, and WebSockets.
            </p>
          </div>
          <div className="pricing-action reveal" style={{ '--delay': '180ms' }}>
            <Link to="/login" className="btn ghost">Login</Link>
            <Link to="/signup" className="btn primary">Sign up</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

export default Landing
