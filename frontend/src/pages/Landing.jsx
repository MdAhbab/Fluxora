import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../landing-premium.css'

const modules = [
  {
    title: 'Finance & Billing',
    body: 'Automate monthly invoices, track overdue balances, and process secure payments directly through the portal.',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Smart Security',
    body: 'Pre-register visitors with temporary QR passes, monitor gate logs, and manage intercom events in real-time.',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    title: 'Resident Experience',
    body: 'Centralized communications with instant push notices, secure chat, digital directory, and amenity bookings.',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    )
  },
  {
    title: 'Maintenance Ops',
    body: 'Streamline ticket routing, monitor vendor performance, and track staff attendance with a visual Kanban board.',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    title: 'Document Management',
    body: 'Securely store and share lease agreements, building policies, and compliance documents with version control.',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: 'Analytics & Insights',
    body: 'Comprehensive dashboards providing real-time visibility into building health, revenue, and operational efficiency.',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    )
  }
]

const Landing = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      
      const { innerWidth, innerHeight } = window
      // Calculate mouse position relative to center, normalized from -1 to 1
      const x = (e.clientX / innerWidth) * 2 - 1
      const y = (e.clientY / innerHeight) * 2 - 1
      
      setMousePos({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      className="page premium-landing" 
      ref={containerRef}
      style={{
        '--mouse-x': mousePos.x,
        '--mouse-y': mousePos.y
      }}
    >
      <nav className="premium-nav">
        <div className="logo">Fluxora.</div>
        <div className="premium-nav-links">
          <a href="#features">Platform</a>
          <a href="#solutions">Solutions</a>
          <a href="#customers">Customers</a>
          <Link to="/login">Sign in</Link>
        </div>
        <div className="premium-actions">
          <Link to="/signup" className="btn-premium primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>Get Started</Link>
        </div>
      </nav>

      <section className="premium-hero">
        <div className="premium-hero-copy">
          <span className="premium-eyebrow">Operating System for Buildings</span>
          <h1>
            Modern infrastructure for <span>residential operations.</span>
          </h1>
          <p className="subtitle">
            Unify your finance, maintenance, security, and resident experience into one intelligent, beautifully designed command center.
          </p>
          <div className="premium-actions">
            <Link to="/dashboard" className="btn-premium primary">Launch Platform</Link>
            <Link to="/signup" className="btn-premium secondary">Book a Demo</Link>
          </div>
        </div>

        <div className="premium-visual">
          <div className="glass-card main-glass-card">
            <div className="glass-header">
              <h3>Alpha Tower Overview</h3>
              <div className="status-indicator">
                <div className="status-dot"></div>
                Systems Online
              </div>
            </div>
            
            <div className="metric-grid">
              <div className="metric-box">
                <div className="metric-value">96.4%</div>
                <div className="metric-label">Collection Rate</div>
              </div>
              <div className="metric-box">
                <div className="metric-value">14 min</div>
                <div className="metric-label">Avg Ticket Resolution</div>
              </div>
            </div>

            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="activity-details">
                  <div className="activity-title">Front Gate Authorized</div>
                  <div className="activity-sub">Visitor pass #8922 scanned</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-icon purple">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="activity-details">
                  <div className="activity-title">Payment Received</div>
                  <div className="activity-sub">Unit 4B • $2,450.00 processed</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card floating-card-1">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)' }}></div>
              <div>
                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>New Resident</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Unit 12A onboarded</div>
              </div>
            </div>
          </div>

          <div className="glass-card floating-card-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Tickets</span>
              <span style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>24</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: '0.8rem' }}>
              <div style={{ width: '60%', height: '100%', background: '#38bdf8', borderRadius: 2 }}></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="premium-section">
        <div className="section-title">
          <span className="premium-eyebrow" style={{ marginBottom: '1rem' }}>Core Modules</span>
          <h2>Everything you need, nothing you don't.</h2>
          <p>We've stripped away the complexity of traditional property software. Fluxora gives your team powerful, focused tools designed for the modern rhythm of residential living.</p>
        </div>

        <div className="bento-grid">
          {modules.map((module, i) => (
            <div className="bento-card" key={i}>
              <div className="bento-icon">
                {module.icon}
              </div>
              <h3>{module.title}</h3>
              <p>{module.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="premium-section" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="section-title">
          <span className="premium-eyebrow" style={{ marginBottom: '1rem' }}>Platform Overview</span>
          <h2>A single source of truth for your building.</h2>
          <p>See how different stakeholders interact with Fluxora daily.</p>
        </div>
        
        <div className="bento-grid" style={{ marginBottom: '4rem' }}>
          <div className="bento-card">
            <h3 style={{ color: '#38bdf8' }}>Property Managers</h3>
            <p style={{ marginBottom: '1rem' }}>Track overall health, approve vendor payouts, and broadcast emergency notices to all towers.</p>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Collection Rate</span><span style={{ color: '#10b981' }}>98.2%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Open Tickets</span><span>12</span></div>
            </div>
          </div>
          <div className="bento-card">
            <h3 style={{ color: '#818cf8' }}>Security Guards</h3>
            <p style={{ marginBottom: '1rem' }}>Scan QR codes, log walk-ins, and trigger SOS alerts directly from the gatehouse tablet.</p>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Expected Today</span><span>45 visitors</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Gate Status</span><span style={{ color: '#10b981' }}>Secured</span></div>
            </div>
          </div>
          <div className="bento-card">
            <h3 style={{ color: '#a855f7' }}>Residents</h3>
            <p style={{ marginBottom: '1rem' }}>Pay maintenance bills, book the clubhouse, and submit repair requests from their phone.</p>
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Next Bill</span><span>$450 (Due in 5d)</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Upcoming</span><span>Tennis Court Booking</span></div>
            </div>
          </div>
        </div>

        <div className="section-title" style={{ marginTop: '6rem' }}>
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="faq-item" style={{ background: 'rgba(15,23,42,0.4)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.8rem' }}>How long does it take to deploy?</h4>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Most buildings are fully onboarded within 2 weeks. We handle the data migration from your legacy systems.</p>
          </div>
          <div className="faq-item" style={{ background: 'rgba(15,23,42,0.4)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Can residents use it on mobile?</h4>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>Yes, the Fluxora Resident portal is a progressive web app (PWA) that installs directly to their home screen.</p>
          </div>
          <div className="faq-item" style={{ background: 'rgba(15,23,42,0.4)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.8rem' }}>Does it integrate with accounting software?</h4>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>We offer seamless exports and native integrations with Xero, QuickBooks, and leading local banks.</p>
          </div>
          <div className="faq-item" style={{ background: 'rgba(15,23,42,0.4)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.8rem' }}>How is data secured?</h4>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>All data is encrypted at rest and in transit using bank-grade AES-256. We are fully SOC2 Type II compliant.</p>
          </div>
        </div>
      </section>

      <section id="solutions" className="premium-section">
        <div className="section-title">
          <span className="premium-eyebrow" style={{ marginBottom: '1rem' }}>Solutions</span>
          <h2>Built for every portfolio size.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(56,189,248,0.2)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem' }}>Single Towers</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>Perfect for independent committees and HOAs looking to digitize their standalone community.</p>
            <ul style={{ color: '#cbd5e1', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><span style={{ color: '#38bdf8' }}>✓</span> Rapid onboarding</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><span style={{ color: '#38bdf8' }}>✓</span> Automated billing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><span style={{ color: '#38bdf8' }}>✓</span> Resident self-service</li>
            </ul>
          </div>
          <div style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(168,85,247,0.2)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem' }}>Enterprise Portfolios</h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>For property management companies overseeing dozens of buildings and thousands of units.</p>
            <ul style={{ color: '#cbd5e1', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><span style={{ color: '#a855f7' }}>✓</span> Multi-property dashboard</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><span style={{ color: '#a855f7' }}>✓</span> Global reporting</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}><span style={{ color: '#a855f7' }}>✓</span> Custom role permissions</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="customers" className="premium-section" style={{ textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '3rem' }}>Trusted by innovative property managers across the region</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap', opacity: 0.5, filter: 'grayscale(100%)' }}>
          {/* Dummy customer logos using text for now */}
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem' }}>Acme Properties</h2>
          <h2 style={{ fontFamily: 'Inter', fontSize: '1.8rem', fontWeight: 800, fontStyle: 'italic' }}>ELEVATE</h2>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', letterSpacing: '0.2em' }}>URBAN LIVING</h2>
          <h2 style={{ fontFamily: 'Inter', fontSize: '1.8rem', fontWeight: 300 }}>Skyline Group</h2>
        </div>
      </section>

      <section className="premium-section" style={{ textAlign: 'center', paddingBottom: '12rem' }}>
        <h2>Ready to transform your building?</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.1rem' }}>Join the next generation of property managers running on Fluxora.</p>
        <div className="premium-actions" style={{ justifyContent: 'center' }}>
          <Link to="/signup" className="btn-premium primary">Create Free Workspace</Link>
        </div>
      </section>

      <footer className="premium-footer">
        <p>© 2026 Fluxora Operating System. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Landing
