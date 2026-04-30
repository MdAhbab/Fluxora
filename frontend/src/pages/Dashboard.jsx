import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="page dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <Link to="/" className="logo">Fluxora</Link>
          <p className="muted">Operations Hub</p>
        </div>
        <nav className="dash-nav">
          <a className="active" href="#overview">Overview</a>
          <a href="#finance">Finance</a>
          <a href="#visitors">Visitors</a>
          <a href="#tickets">Maintenance</a>
          <a href="#bookings">Bookings</a>
          <a href="#documents">Documents</a>
        </nav>
        <div className="dash-footer">
          <span className="badge">Security Live</span>
          <p className="muted">Last sync 2m ago</p>
        </div>
      </aside>

      <main className="dash-main">
        <header className="dash-topbar">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Good afternoon, Jane</h1>
            <p className="muted">Alpha Tower · 96% collections</p>
          </div>
          <div className="dash-actions">
            <button className="btn ghost">Export report</button>
            <button className="btn primary">Generate invoices</button>
          </div>
        </header>

        <section id="overview" className="dash-grid">
          <div className="kpi-card">
            <p>Outstanding dues</p>
            <h3>$45,210</h3>
            <span className="trend up">+3.2% this month</span>
          </div>
          <div className="kpi-card">
            <p>Open tickets</p>
            <h3>18</h3>
            <span className="trend down">-5 resolved today</span>
          </div>
          <div className="kpi-card">
            <p>Visitors today</p>
            <h3>92</h3>
            <span className="trend">Peak at 6 PM</span>
          </div>
          <div className="kpi-card">
            <p>Upcoming bookings</p>
            <h3>14</h3>
            <span className="trend">3 new approvals</span>
          </div>
        </section>

        <section className="dash-panels">
          <article className="panel" id="finance">
            <div className="panel-head">
              <h2>Finance pulse</h2>
              <span className="badge accent">Auto-reminders on</span>
            </div>
            <ul className="panel-list">
              <li>May invoicing batch · 428 residents</li>
              <li>Utility bills synced · 3 hours ago</li>
              <li>Late payment follow-ups · 21 sent</li>
            </ul>
            <button className="btn outline">View ledger</button>
          </article>

          <article className="panel" id="visitors">
            <div className="panel-head">
              <h2>Visitor management</h2>
              <span className="badge">Live gate</span>
            </div>
            <div className="panel-metric">
              <div>
                <h3>612</h3>
                <p className="muted">Weekly visitors</p>
              </div>
              <div>
                <h3>14</h3>
                <p className="muted">Approvals pending</p>
              </div>
            </div>
            <button className="btn outline">Open gate log</button>
          </article>

          <article className="panel" id="tickets">
            <div className="panel-head">
              <h2>Maintenance</h2>
              <span className="badge warning">2 SLA risks</span>
            </div>
            <ul className="panel-list">
              <li>Lobby door alignment · High</li>
              <li>Lift B vibration · Medium</li>
              <li>Water pump check · Low</li>
            </ul>
            <button className="btn outline">Assign vendor</button>
          </article>
        </section>

        <section className="dash-panels">
          <article className="panel" id="bookings">
            <div className="panel-head">
              <h2>Bookings</h2>
              <span className="badge">Capacity healthy</span>
            </div>
            <ul className="panel-list">
              <li>Gym · 6:00 PM · 12/18 slots</li>
              <li>Rooftop · 7:30 PM · 1 pending approval</li>
            </ul>
          </article>
          <article className="panel" id="documents">
            <div className="panel-head">
              <h2>Documents</h2>
              <span className="badge accent">Secure vault</span>
            </div>
            <ul className="panel-list">
              <li>Maintenance contract · v4 approved</li>
              <li>Notice board policy · update drafted</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
