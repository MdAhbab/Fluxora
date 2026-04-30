import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, authApi, authStore, normalizeList } from '../lib/api'
import '../dashboard-3d.css'

const money = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
})

const getModuleLinks = (role) => {
  const base = [['overview', 'Overview']]
  if (['admin', 'committee'].includes(role)) {
    return [
      ...base,
      ['finance', 'Financial Oversight'],
      ['operations', 'Command Center'],
      ['access', 'Site Security'],
      ['community', 'Community HQ'],
      ['units', 'Real Estate'],
    ]
  }
  if (role === 'resident') {
    return [
      ...base,
      ['finance', 'My Billing'],
      ['operations', 'Service Hub'],
      ['community', 'Social & Updates'],
      ['units', 'My Building'],
    ]
  }
  if (role === 'staff') {
    return [
      ...base,
      ['access', 'Security Hub'],
      ['operations', 'Task List'],
      ['community', 'Notices'],
    ]
  }
  return base
}

const emptySections = {
  invoices: [],
  expenses: [],
  notices: [],
  appointments: [],
  visitors: [],
  tickets: [],
  vendors: [],
  resources: [],
  bookings: [],
  polls: [],
  documents: [],
  staff: [],
  attendance: [],
  directory: [],
  chat_rooms: [],
  messages: [],
  listings: [],
  gate_logs: [],
  lifts: [],
  waste: [],
  units: [],
  assets: [],
  asset_maintenance: [],
  parking_slots: [],
  vehicles: [],
  notifications: [],
  emergency_contacts: [],
}

const statusText = (value) => String(value || 'unknown').replaceAll('_', ' ')

const statusClass = (value) => `status-badge ${value || 'pending'}`

const formatDate = (value) => {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: value.includes('T') ? 'short' : undefined }).format(new Date(value))
}

const ModuleGroup = ({ id, children }) => {
  const { activeModule = 'overview' } = useParams()
  if (activeModule !== id) return null
  return <>{children}</>
}

const ModulePanel = ({ title, children }) => {
  return (
    <section className="module-panel dynamic-panel">
      {title && (
        <div className="module-head">
          <div>
            <h2>{title}</h2>
          </div>
        </div>
      )}
      {children}
    </section>
  )
}

const EmptyState = ({ text }) => <p className="empty-state">{text}</p>

const Dashboard = () => {
  const navigate = useNavigate()
  const { activeModule = 'overview' } = useParams()
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [buildingId, setBuildingId] = useState(authStore.getBuilding()?.id || '')
  const [activeRoom, setActiveRoom] = useState(null)
  const [chatDraft, setChatDraft] = useState('')
  const [roomMessages, setRoomMessages] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  const sections = summary?.sections || emptySections
  const metrics = summary?.metrics || {}
  const building = summary?.building
  const me = summary?.me || authStore.getUser()
  const residentId = summary?.current_resident_id

  const residentById = useMemo(() => {
    const map = new Map()
    sections.directory.forEach((resident) => map.set(resident.id, resident))
    return map
  }, [sections.directory])

  const resourceById = useMemo(() => {
    const map = new Map()
    sections.resources.forEach((resource) => map.set(resource.id, resource))
    return map
  }, [sections.resources])

  const appointmentById = useMemo(() => {
    const map = new Map()
    sections.appointments.forEach((appointment) => map.set(appointment.id, appointment))
    return map
  }, [sections.appointments])

  const maxExpense = useMemo(() => {
    const totals = sections.expenses.map((expense) => Number(expense.total) || 0)
    return totals.length ? Math.max(...totals, 1) : 1
  }, [sections.expenses])

  const loadDashboard = useCallback(async (nextBuildingId = buildingId) => {
    if (!authStore.getToken()) {
      navigate('/login')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const query = nextBuildingId ? `?building_id=${nextBuildingId}` : ''
      const payload = await apiRequest(`/api/dashboard/summary/${query}`)
      setSummary(payload)
      if (payload?.building?.id) {
        setBuildingId(payload.building.id)
        localStorage.setItem('fluxora_building', JSON.stringify(payload.building))
      }
      const nextRooms = payload?.sections?.chat_rooms || []
      setActiveRoom((current) => {
        if (current && nextRooms.some((room) => room.id === current)) return current
        return nextRooms[0]?.id || null
      })
      setRoomMessages(payload?.sections?.messages || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [buildingId, navigate])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadDashboard])

  useEffect(() => {
    if (!activeRoom) {
      setRoomMessages([])
      return undefined
    }
    let isCurrent = true
    const loadRoomMessages = async () => {
      setIsLoadingMessages(true)
      try {
        const payload = await apiRequest(`/api/chat/messages/?room_id=${activeRoom}`)
        if (isCurrent) {
          setRoomMessages(normalizeList(payload))
        }
      } catch (err) {
        if (isCurrent) {
          setError(err.message)
        }
      } finally {
        if (isCurrent) setIsLoadingMessages(false)
      }
    }
    loadRoomMessages()
    return () => {
      isCurrent = false
    }
  }, [activeRoom, summary?.sections?.messages])

  const runAction = async (label, fn) => {
    setActionMessage('')
    setError('')
    try {
      await fn()
      setActionMessage(label)
      await loadDashboard(buildingId)
    } catch (err) {
      setError(err.message)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Token may already be invalid; local cleanup still matters.
    }
    authStore.clear()
    navigate('/login')
  }

  const payInvoice = (invoiceId) => runAction('Payment recorded.', () => (
    apiRequest('/api/payments/checkout/', { method: 'POST', body: { invoice_id: invoiceId, method: 'bKash' } })
  ))

  const addExpense = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    runAction('Expense logged.', () => apiRequest('/api/expenses/', {
      method: 'POST',
      body: {
        building: building.id,
        category: form.get('category'),
        amount: Number(form.get('amount')),
        description: form.get('description'),
        date: form.get('date'),
        created_by: me.id,
      },
    }))
    event.currentTarget.reset()
  }

  const addNotice = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    runAction('Notice published.', () => apiRequest('/api/notices/', {
      method: 'POST',
      body: {
        building: building.id,
        title: form.get('title'),
        body: form.get('body'),
        is_pinned: form.get('is_pinned') === 'on',
        publish_date: new Date().toISOString(),
        expiry_date: form.get('expiry_date') ? new Date(form.get('expiry_date')).toISOString() : null,
        created_by: me.id,
      },
    }))
    event.currentTarget.reset()
  }

  const scanVisitor = (token) => runAction('Visitor checked in.', () => (
    apiRequest('/api/visitors/scan/', { method: 'POST', body: { qr_token: token, handled_by: me.id } })
  ))

  const moveTicket = (ticket) => {
    const next = ticket.status === 'open' ? 'in_progress' : ticket.status === 'in_progress' ? 'resolved' : ticket.status === 'resolved' ? 'closed' : 'open'
    return runAction('Ticket status updated.', () => (
      apiRequest(`/api/tickets/${ticket.id}/status/`, { method: 'PATCH', body: { status: next } })
    ))
  }

  const addBooking = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const date = form.get('date')
    const start = form.get('start')
    const end = form.get('end')
    if (!residentId) {
      setError('A resident profile is required to create a booking.')
      return
    }
    runAction('Booking requested.', () => apiRequest('/api/bookings/', {
      method: 'POST',
      body: {
        resource: Number(form.get('resource')),
        resident: residentId,
        start_time: new Date(`${date}T${start}`).toISOString(),
        end_time: new Date(`${date}T${end}`).toISOString(),
        purpose: form.get('purpose'),
        status: 'pending',
      },
    }))
    event.currentTarget.reset()
  }

  const votePoll = (pollId, optionId) => {
    if (!residentId) {
      setError('A resident profile is required to vote.')
      return
    }
    runAction('Vote submitted.', () => apiRequest(`/api/polls/${pollId}/vote/`, {
      method: 'POST',
      body: { option_id: optionId, resident_id: residentId },
    }))
  }

  const sendMessage = (event) => {
    event.preventDefault()
    if (!residentId || !activeRoom || !chatDraft.trim()) return
    runAction('Message sent.', () => apiRequest('/api/chat/messages/', {
      method: 'POST',
      body: { room: activeRoom, resident: residentId, content: chatDraft.trim() },
    }))
    setChatDraft('')
  }

  const createParkingLayout = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    runAction('Parking layout generated.', () => apiRequest('/api/parking/layout/', {
      method: 'POST',
      body: {
        building_id: building.id,
        rows: Number(form.get('rows')),
        columns: Number(form.get('columns')),
        prefix: form.get('prefix') || 'P',
      },
    }))
  }

  const updateSlot = (slot) => {
    const next = slot.status === 'available' ? 'reserved' : slot.status === 'reserved' ? 'occupied' : 'available'
    runAction('Parking slot updated.', () => apiRequest(`/api/parking/slots/${slot.id}/`, {
      method: 'PATCH',
      body: { status: next },
    }))
  }

  const addVehicle = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    runAction('Vehicle assigned.', () => apiRequest('/api/vehicles/', {
      method: 'POST',
      body: {
        resident: Number(form.get('resident')),
        parking_slot: Number(form.get('parking_slot')),
        vehicle_number: form.get('vehicle_number'),
        type: form.get('type'),
      },
    }))
    event.currentTarget.reset()
  }

  const activeMessages = roomMessages

  const recentActivity = useMemo(() => {
    const activities = []
    sections.tickets.forEach(t => activities.push({ id: `t-${t.id}`, type: 'Ticket', title: t.category, desc: t.description, date: new Date(t.created_at || Date.now()) }))
    sections.notices.forEach(n => activities.push({ id: `n-${n.id}`, type: 'Notice', title: n.title, desc: 'New notice published', date: new Date(n.publish_date || Date.now()) }))
    sections.visitors.forEach(v => activities.push({ id: `v-${v.id}`, type: 'Visitor', title: `Visitor checkout`, desc: `Status: ${v.status}`, date: new Date(v.checkin_time || Date.now()) }))
    
    return activities.sort((a, b) => b.date - a.date).slice(0, 5)
  }, [sections])

  const floors = useMemo(() => {
    if (!sections.units) return []
    const map = {}
    sections.units.forEach(u => {
      if (!map[u.floor]) map[u.floor] = []
      map[u.floor].push(u)
    })
    return Object.keys(map).sort((a, b) => Number(a) - Number(b)).map(f => ({
      floor: f,
      units: map[f]
    }))
  }, [sections.units])

  if (isLoading && !summary) {
    return (
      <div className="dashboard-loading">
        <div className="loading-card">
          <span />
          <h1>Loading Fluxora operations</h1>
          <p>Pulling live data from the Django database.</p>
        </div>
      </div>
    )
  }

  if (!summary && error) {
    return (
      <div className="dashboard-loading">
        <div className="loading-card">
          <h1>Dashboard unavailable</h1>
          <p>{error}</p>
          <Link className="btn primary" to="/login">Return to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <Link to="/" className="logo">Fluxora</Link>
          <p className="muted">Live Building OS</p>
        </div>
        <label className="building-switcher">
          <span>Building</span>
          <select value={buildingId} onChange={(event) => loadDashboard(event.target.value)}>
            {(summary?.buildings || []).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <nav className="dash-nav module-nav">
          {getModuleLinks(me?.role).map(([id, label]) => (
            <Link key={id} to={`/dashboard/${id}`} className={activeModule === id ? 'active' : ''}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="dash-main module-main">
        <header className="dash-topbar">
          <div>
            <p className="eyebrow">Dynamic dashboard</p>
            <h1>{building?.name || 'Fluxora'} command center</h1>
            <p className="muted">{me?.name || 'User'} · {statusText(me?.role)} · {building?.address}</p>
          </div>
          <div className="dash-actions">
            <button className="btn ghost" type="button" onClick={() => loadDashboard(buildingId)}>Refresh</button>
            <Link className="btn ghost" to="/settings">Settings</Link>
            <button className="btn primary" type="button" onClick={logout}>Logout</button>
          </div>
        </header>

        {error && <div className="dashboard-alert error">{error}</div>}
        {actionMessage && <div className="dashboard-alert">{actionMessage}</div>}

        <ModuleGroup id="overview">
          <section id="overview" className="dash-grid">
            {['admin', 'committee'].includes(me?.role) ? (
              <>
                <div className="kpi-card"><p>Total Collections</p><h3>{money.format(metrics.payments_total || 0)}</h3><span className="trend">Real-time revenue</span></div>
                <div className="kpi-card"><p>Outstanding</p><h3>{money.format(metrics.outstanding || 0)}</h3><span className="trend">Actionable dues</span></div>
                <div className="kpi-card"><p>Active Tickets</p><h3>{metrics.open_tickets || 0}</h3><span className="trend">Maintenance load</span></div>
                <div className="kpi-card"><p>Occupancy Rate</p><h3>{metrics.occupancy_rate || 0}%</h3><span className="trend">{metrics.occupied_units}/{metrics.total_units} units</span></div>
              </>
            ) : me?.role === 'resident' ? (
              <>
                <div className="kpi-card"><p>My Balance</p><h3>{money.format(sections.invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + Number(i.amount), 0))}</h3><span className="trend">Next due: {formatDate(sections.invoices[0]?.due_date)}</span></div>
                <div className="kpi-card"><p>Active Requests</p><h3>{sections.tickets.filter(t => t.status !== 'closed').length}</h3><span className="trend">Maintenance updates</span></div>
                <div className="kpi-card"><p>Visitors Today</p><h3>{sections.appointments.filter(a => new Date(a.scheduled_time).toDateString() === new Date().toDateString()).length}</h3><span className="trend">Security pre-clearance</span></div>
                <div className="kpi-card"><p>Community Health</p><h3>{sections.polls.length}</h3><span className="trend">Active votes</span></div>
              </>
            ) : (
              <>
                <div className="kpi-card"><p>Gate Logins</p><h3>{sections.gate_logs.length}</h3><span className="trend">Last 24h</span></div>
                <div className="kpi-card"><p>Visitor Scans</p><h3>{sections.visitors.length}</h3><span className="trend">Check-in volume</span></div>
                <div className="kpi-card"><p>System Status</p><h3>{sections.lifts.filter(l => l.status === 'operational').length}/{sections.lifts.length}</h3><span className="trend">Lift operational</span></div>
                <div className="kpi-card"><p>Pending Tasks</p><h3>{metrics.open_tickets || 0}</h3><span className="trend">Assigned to you</span></div>
              </>
            )}
          </section>

          <div className="overview-widgets">
            <div className="widget-card map-widget">
              <div className="widget-header">
                <h3>Property Location</h3>
                <button className="btn ghost small">Edit Location</button>
              </div>
              <div className="map-container">
                <iframe 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(building?.address || 'Dhaka, Bangladesh')}&t=&z=14&ie=UTF8&iwloc=&output=embed`} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  title="Building Location Map"
                />
              </div>
            </div>

            <div className="widget-card activity-widget">
              <div className="widget-header">
                <h3>Recent Activity Feed</h3>
              </div>
              <div className="activity-timeline">
                {recentActivity.length === 0 ? <p className="muted">No recent activity found.</p> : recentActivity.map(act => (
                  <div className="activity-item" key={act.id}>
                    <div className="activity-icon">{act.type[0]}</div>
                    <div className="activity-details">
                      <strong>{act.title}</strong>
                      <span>{act.desc}</span>
                    </div>
                    <time>{act.date.toLocaleDateString()}</time>
                  </div>
                ))}
              </div>
            </div>

            <div className="widget-card quick-actions-widget">
              <div className="widget-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-action-grid">
                {['admin', 'committee'].includes(me?.role) ? (
                  <>
                    <Link to="/dashboard/finance" className="action-btn"><span>💰</span> Log Payment</Link>
                    <Link to="/dashboard/operations" className="action-btn"><span>🔧</span> New Ticket</Link>
                    <Link to="/dashboard/community" className="action-btn"><span>📢</span> Post Notice</Link>
                    <Link to="/dashboard/access" className="action-btn"><span>🚗</span> Assign Parking</Link>
                  </>
                ) : me?.role === 'resident' ? (
                  <>
                    <Link to="/dashboard/finance" className="action-btn"><span>💳</span> Pay Bills</Link>
                    <Link to="/dashboard/operations" className="action-btn"><span>🛠️</span> Request Fix</Link>
                    <Link to="/dashboard/community" className="action-btn"><span>💬</span> Open Chat</Link>
                    <Link to="/dashboard/access" className="action-btn"><span>🎟️</span> Visitor Pass</Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard/access" className="action-btn"><span>🔍</span> Scan Visitor</Link>
                    <Link to="/dashboard/operations" className="action-btn"><span>📝</span> View Tasks</Link>
                    <Link to="/dashboard/community" className="action-btn"><span>📣</span> Read Notices</Link>
                  </>
                )}
              </div>
            </div>

            <div className="widget-card chart-widget">
              <div className="widget-header">
                <h3>Expenses by Category</h3>
              </div>
              <div className="fake-chart dynamic-chart">
                {sections.expenses.length === 0 ? (
                  <p className="muted" style={{ alignSelf: 'center', width: '100%', textAlign: 'center' }}>No expense data available.</p>
                ) : sections.expenses.map((exp, i) => {
                  const h = Math.round((Number(exp.total) / maxExpense) * 100) || 5;
                  return (
                    <div key={i} className="chart-bar" style={{ height: `${h}%` }}>
                      <span className="chart-tooltip">{money.format(Number(exp.total))}</span>
                      <span className="chart-label">{exp.category.slice(0, 3)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ModuleGroup>

        <ModuleGroup id="finance">
          <ModulePanel title="Financial Management">
            <div className="module-table dense-table">
              {sections.invoices.length === 0 && <EmptyState text="No invoices found. Run the seed command to populate demo billing." />}
              {sections.invoices.map((invoice) => (
                <div className="table-row" key={invoice.id}>
                  <strong>{invoice.resident_name || `Resident #${invoice.resident}`}</strong>
                  <span>{invoice.unit_number || 'No unit'}</span>
                  <span>{money.format(Number(invoice.amount))}</span>
                  <span>{formatDate(invoice.due_date)}</span>
                  <span className={statusClass(invoice.status)}>{statusText(invoice.status)}</span>
                  <button type="button" onClick={() => payInvoice(invoice.id)} disabled={invoice.status === 'paid'}>Pay bKash</button>
                </div>
              ))}
            </div>
          </ModulePanel>

          {['admin', 'committee'].includes(me?.role) && (
            <ModulePanel title="Expense Tracking">
              <form className="inline-form admin-form" onSubmit={addExpense}>
                <input name="category" placeholder="Category" required />
                <input name="amount" type="number" min="1" placeholder="Amount" required />
                <input name="description" placeholder="Description" />
                <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                <button type="submit">Log expense</button>
              </form>
              <div className="bar-list">
                {sections.expenses.map((expense) => (
                  <div className="bar-row" key={expense.category}>
                    <span>{expense.category}</span>
                    <div><i style={{ width: `${Math.round((Number(expense.total) / maxExpense) * 100)}%` }} /></div>
                    <strong>{money.format(Number(expense.total))}</strong>
                  </div>
                ))}
              </div>
            </ModulePanel>
          )}
        </ModuleGroup>

        <ModuleGroup id="operations">
          <ModulePanel title="Complaint & Maintenance Tracker">
            <div className="kanban">
              {['open', 'in_progress', 'resolved', 'closed'].map((lane) => (
                <div className="kanban-lane" key={lane}>
                  <h3>{statusText(lane)}</h3>
                  {sections.tickets.filter((ticket) => ticket.status === lane).map((ticket) => (
                    <button className="ticket-card" key={ticket.id} type="button" onClick={() => moveTicket(ticket)}>
                      <strong>{ticket.category}</strong>
                      <span>{ticket.resident_name} · {ticket.priority}</span>
                      <small>{ticket.description}</small>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </ModulePanel>

          <ModulePanel title="Assets & Compliance">
            <div className="provider-grid">
              {sections.assets.map((asset) => (
                <article className="provider-tile" key={asset.id}>
                  <strong>{asset.name}</strong>
                  <span>{asset.type} · {statusText(asset.status)}</span>
                  <small>Warranty: {asset.warranty_expiry || 'Not tracked'}</small>
                </article>
              ))}
              {sections.asset_maintenance.map((item) => (
                <article className="provider-tile" key={`m-${item.id}`}>
                  <strong>Maintenance #{item.id}</strong>
                  <span>{item.scheduled_date} · {money.format(Number(item.cost || 0))}</span>
                  <small>{item.description}</small>
                </article>
              ))}
            </div>
          </ModulePanel>

          <ModulePanel title="Resource Booking">
            <form className="inline-form admin-form" onSubmit={addBooking}>
              <select name="resource" required>
                <option value="">Resource</option>
                {sections.resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
              </select>
              <input name="date" type="date" required />
              <input name="start" type="time" required />
              <input name="end" type="time" required />
              <input name="purpose" placeholder="Purpose" />
              <button type="submit">Book</button>
            </form>
            <div className="module-table">
              {sections.bookings.map((booking) => (
                <div className="table-row" key={booking.id}>
                  <strong>{booking.resource_name || resourceById.get(booking.resource)?.name || `Resource #${booking.resource}`}</strong>
                  <span>{formatDate(booking.start_time)}</span>
                  <span className={statusClass(booking.status)}>{statusText(booking.status)}</span>
                </div>
              ))}
            </div>
          </ModulePanel>
        </ModuleGroup>

        <ModuleGroup id="access">
          <ModulePanel title="Visitor Management">
            <div className="module-table">
              {sections.appointments.length === 0 && <EmptyState text="No visitor appointments scheduled yet." />}
              {sections.appointments.map((appointment) => (
                <div className="table-row" key={appointment.id}>
                  <strong>{appointment.visitor_name}</strong>
                  <span>{appointment.visitor_phone}</span>
                  <code>{appointment.qr_token}</code>
                  <span>{formatDate(appointment.scheduled_time)}</span>
                  <button type="button" onClick={() => scanVisitor(appointment.qr_token)}>Scan in</button>
                </div>
              ))}
            </div>
            <div className="notice-list">
              {sections.visitors.map((visitor) => {
                const appointment = appointmentById.get(visitor.appointment)
                return (
                  <div className="notice-item" key={visitor.id}>
                    <strong>{appointment?.visitor_name || `Appointment #${visitor.appointment}`}</strong>
                    <span>{formatDate(visitor.checkin_time || visitor.checkout_time)}</span>
                    <span className={statusClass(visitor.status)}>{statusText(visitor.status)}</span>
                  </div>
                )
              })}
            </div>
          </ModulePanel>

          <ModulePanel title="Security, Gate, Lift, Waste">
            <div className="provider-grid">
              {sections.gate_logs.map((log) => <article className="provider-tile" key={`g-${log.id}`}><strong>Gate {statusText(log.event_type)}</strong><span>{formatDate(log.timestamp)}</span></article>)}
              {sections.lifts.map((lift) => <article className={`provider-tile lift-tile ${lift.status}`} key={`l-${lift.id}`}><strong>{lift.name}</strong><span>{statusText(lift.status)}</span></article>)}
              {sections.waste.map((item) => <article className="provider-tile" key={`w-${item.id}`}><strong>Waste collection</strong><span>{formatDate(item.schedule_time)}</span><small>{item.recurring}</small></article>)}
            </div>
          </ModulePanel>

          <ModulePanel title="Parking Blueprint & Access">
            {['admin', 'committee'].includes(me?.role) && (
              <form className="inline-form admin-form" onSubmit={createParkingLayout}>
                <input name="prefix" placeholder="Prefix" defaultValue={sections.parking_layout?.prefix || 'P'} />
                <input name="rows" type="number" min="1" max="12" defaultValue={sections.parking_layout?.rows || 4} />
                <input name="columns" type="number" min="1" max="12" defaultValue={sections.parking_layout?.columns || 6} />
                <button type="submit">Draw Blueprint</button>
              </form>
            )}
            <div className="gamified-parking-lot" style={{ '--cols': sections.parking_layout?.columns || 6 }}>
              {sections.parking_slots.map((slot) => (
                <button className={`gamified-slot ${slot.status}`} key={slot.id} type="button" onClick={() => updateSlot(slot)}>
                  <span className="slot-number">{slot.slot_number}</span>
                </button>
              ))}
            </div>
            {['admin', 'committee'].includes(me?.role) && (
              <form className="inline-form admin-form" onSubmit={addVehicle}>
                <select name="resident" required>
                  <option value="">Resident</option>
                  {sections.directory.map((resident) => <option key={resident.id} value={resident.id}>{resident.name}</option>)}
                </select>
                <select name="parking_slot" required>
                  <option value="">Slot</option>
                  {sections.parking_slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.slot_number}</option>)}
                </select>
                <input name="vehicle_number" placeholder="DHAKA-METRO-GA-11-2233" required />
                <select name="type"><option value="car">Car</option><option value="motorbike">Motorbike</option><option value="bicycle">Bicycle</option></select>
                <button type="submit">Assign vehicle</button>
              </form>
            )}
          </ModulePanel>
        </ModuleGroup>

        <ModuleGroup id="community">
          <ModulePanel title="Digital Notice Board">
            {['admin', 'committee'].includes(me?.role) && (
              <form className="inline-form admin-form" onSubmit={addNotice}>
                <input name="title" placeholder="Title" required />
                <input name="body" placeholder="Notice body" required />
                <input name="expiry_date" type="date" />
                <label className="check-line"><input name="is_pinned" type="checkbox" /> Pin</label>
                <button type="submit">Publish</button>
              </form>
            )}
            <div className="notice-list">
              {sections.notices.map((notice) => (
                <div className="notice-item" key={notice.id}>
                  <strong>{notice.is_pinned ? 'Pinned: ' : ''}{notice.title}</strong>
                  <span>{formatDate(notice.publish_date)}</span>
                </div>
              ))}
            </div>
          </ModulePanel>

          <ModulePanel title="Polls & Surveys">
            {sections.polls.map((poll) => {
              const totalVotes = poll.total_votes
                ?? (poll.options || []).reduce((sum, option) => sum + (option.votes || 0), 0)
              return (
                <article className="poll-card" key={poll.id}>
                  <h3>{poll.question}</h3>
                  <p className="muted">{totalVotes ? `${totalVotes} votes recorded` : 'No votes recorded yet'}</p>
                  {(poll.options || []).map((option) => {
                    const percentage = option.percentage
                      ?? (totalVotes ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0)
                    return (
                      <button className="poll-row" key={option.id} type="button" onClick={() => votePoll(poll.id, option.id)}>
                        <span>{option.option_text}</span>
                        <i style={{ width: `${percentage}%` }} />
                        <strong>{totalVotes ? `${percentage}%` : 'Vote'}</strong>
                      </button>
                    )
                  })}
                </article>
              )
            })}
          </ModulePanel>

          <ModulePanel title="Secure Document Repository">
            <div className="provider-grid">
              {sections.documents.map((doc) => (
                <article className="provider-tile" key={doc.id}>
                  <strong>{doc.title}</strong>
                  <span>v{doc.version} · {doc.mime_type || 'file'}</span>
                  <small>{doc.file_path}</small>
                </article>
              ))}
            </div>
          </ModulePanel>

          <ModulePanel title="Group Chat">
            <div className="chat-shell">
              <aside className="chat-rooms">
                {sections.chat_rooms.map((room) => (
                  <button className={room.id === activeRoom ? 'active' : ''} key={room.id} type="button" onClick={() => setActiveRoom(room.id)}>
                    <strong>{room.name}</strong>
                    <span>{room.is_public ? 'Public room' : 'Private room'}</span>
                  </button>
                ))}
              </aside>
              <div className="chat-panel">
                <div className="chat-toolbar"><h3>Messages</h3><span>{isLoadingMessages ? 'Loading...' : `${activeMessages.length} loaded`}</span></div>
                <div className="chat-feed rich-chat">
                  {activeMessages.map((message) => {
                    const author = residentById.get(message.resident)
                    return (
                      <article className={`message-bubble ${message.resident === residentId ? 'mine' : ''}`} key={message.id}>
                        <div><strong>{author?.name || `Resident #${message.resident}`}</strong><time>{formatDate(message.sent_at)}</time></div>
                        <p>{message.content}</p>
                      </article>
                    )
                  })}
                </div>
                <form className="chat-composer" onSubmit={sendMessage}>
                  <textarea value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Message the room" />
                  <div><span>{residentId ? 'Ready' : 'Resident profile required'}</span><button type="submit">Send</button></div>
                </form>
              </div>
            </div>
          </ModulePanel>
        </ModuleGroup>

        <ModuleGroup id="units">
          <ModulePanel title="Units & Occupancy">
            <div className="building-3d-wrapper">
              <div className="module-head" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div>
                  <h2>3D Building Structure</h2>
                  <p className="muted">Hover over floors to view real-time occupancy data.</p>
                </div>
              </div>
              <div className="building-3d-container">
                <div className="building-3d">
                  {floors.map((floorData, index) => (
                    <div 
                      className="floor-3d" 
                      key={floorData.floor}
                      style={{ transform: `translateZ(${index * 50}px)` }}
                    >
                      <div className="floor-info">
                        <h4>Floor {floorData.floor}</h4>
                        <p>{floorData.units.length} total units</p>
                        <div className="unit-list">
                          {floorData.units.map(u => {
                            const res = sections.directory.find(item => item.unit === u.id)
                            return (
                              <span 
                                key={u.id} 
                                className={`unit-badge ${res ? 'occupied' : 'vacant'}`}
                                title={res ? `Occupied by ${res.name}` : 'Vacant'}
                              >
                                {u.unit_number}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {floors.length === 0 && <div style={{ color: '#64748b', textAlign: 'center', marginTop: '100px', transform: 'rotateX(-60deg) rotateZ(-45deg)' }}>No units data available</div>}
                </div>
              </div>
            </div>

            <div className="unit-grid">
              {sections.units.map((unit) => {
                const resident = sections.directory.find((item) => item.unit === unit.id)
                return (
                  <article className={`unit-tile ${unit.status}`} key={unit.id}>
                    <strong>{unit.unit_number}</strong>
                    <span>Floor {unit.floor} · {unit.type}</span>
                    <p>{resident?.name || 'No resident assigned'}</p>
                    <i>{statusText(unit.status)}</i>
                  </article>
                )
              })}
            </div>
          </ModulePanel>
        </ModuleGroup>
      </main>
    </div>
  )
}

export default Dashboard
