import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest, authStore } from '../lib/api'

const Settings = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('user')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [userData, setUserData] = useState({ name: '', phone: '' })
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '' })
  const [buildingData, setBuildingData] = useState({
    name: '', address: '', website: '', num_floors: 0, total_units: 0, year_built: 2020
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const building = authStore.getBuilding()
        const query = building ? `?building_id=${building.id}` : ''
        const payload = await apiRequest(`/api/settings/${query}`)
        if (payload.user) {
          setUserData({ name: payload.user.name || '', phone: payload.user.phone || '' })
        }
        if (payload.building) {
          setBuildingData({
            name: payload.building.name || '',
            address: payload.building.address || '',
            website: payload.building.website || '',
            num_floors: payload.building.num_floors || 0,
            total_units: payload.building.total_units || 0,
            year_built: payload.building.year_built || new Date().getFullYear(),
          })
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const handleUserUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')
    try {
      const payload = await apiRequest('/api/settings/', {
        method: 'PATCH',
        body: { section: 'user', ...userData }
      })
      if (payload.user) authStore.setSession({ user: payload.user })
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')
    try {
      const payload = await apiRequest('/api/settings/', {
        method: 'PATCH',
        body: { section: 'password', ...passwordData }
      })
      if (payload.token) authStore.setSession({ token: payload.token })
      setMessage('Password changed successfully.')
      setPasswordData({ current_password: '', new_password: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuildingUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setError('')
    try {
      const building = authStore.getBuilding()
      const payload = await apiRequest('/api/settings/', {
        method: 'PATCH',
        body: { section: 'building', building_id: building?.id, ...buildingData }
      })
      if (payload.building) authStore.setSession({ building: payload.building })
      setMessage('Building information updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedData = async () => {
    if (!window.confirm("This will populate your database with dummy users, buildings, and metrics. Proceed?")) return
    setIsLoading(true)
    setMessage('')
    setError('')
    try {
      const res = await apiRequest('/api/seed/', { method: 'POST', body: {} })
      setMessage(res.detail || 'Data seeded successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page dashboard">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <Link to="/" className="logo">Fluxora</Link>
          <p className="muted">Live Building OS</p>
        </div>
        <nav className="dash-nav module-nav">
          <Link to="/dashboard">Back to Dashboard</Link>
          <hr style={{ opacity: 0.1, margin: '1rem 0' }} />
          <button className={`nav-link ${activeTab === 'user' ? 'active' : ''}`} onClick={() => setActiveTab('user')}>Profile Settings</button>
          <button className={`nav-link ${activeTab === 'building' ? 'active' : ''}`} onClick={() => setActiveTab('building')}>Building Info</button>
        </nav>
      </aside>

      <main className="dash-main module-main">
        <header className="dash-topbar">
          <div>
            <p className="eyebrow">Administration</p>
            <h1>System Settings</h1>
          </div>
          <div className="dash-actions">
            <button className="btn primary" onClick={() => navigate('/dashboard')}>Done</button>
          </div>
        </header>

        <section className="module-panel dynamic-panel">
          {message && <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', marginBottom: '1rem' }}>{message}</div>}
          {error && <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

          {activeTab === 'user' && (
            <div className="settings-section">
              <h2>Profile details</h2>
              <form className="admin-form" onSubmit={handleUserUpdate} style={{ maxWidth: '400px', marginBottom: '3rem' }}>
                <label>
                  <span>Full Name</span>
                  <input type="text" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} required />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input type="text" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} required />
                </label>
                <button type="submit" className="btn primary" disabled={isLoading}>Update Profile</button>
              </form>

              <h2>Change password</h2>
              <form className="admin-form" onSubmit={handlePasswordUpdate} style={{ maxWidth: '400px' }}>
                <label>
                  <span>Current Password</span>
                  <input type="password" value={passwordData.current_password} onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })} required />
                </label>
                <label>
                  <span>New Password</span>
                  <input type="password" value={passwordData.new_password} onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })} required />
                </label>
                <button type="submit" className="btn" disabled={isLoading}>Update Password</button>
              </form>
            </div>
          )}

          {activeTab === 'building' && (
            <div className="settings-section">
              <h2>Building Information</h2>
              <p className="muted" style={{ marginBottom: '1.5rem' }}>Update core infrastructural details for the current active building.</p>
              <form className="admin-form" onSubmit={handleBuildingUpdate} style={{ maxWidth: '600px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ gridColumn: '1 / -1' }}>
                  <span>Building Name</span>
                  <input type="text" value={buildingData.name} onChange={e => setBuildingData({ ...buildingData, name: e.target.value })} required />
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  <span>Address</span>
                  <input type="text" value={buildingData.address} onChange={e => setBuildingData({ ...buildingData, address: e.target.value })} required />
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  <span>Website / Domain</span>
                  <input type="text" value={buildingData.website} onChange={e => setBuildingData({ ...buildingData, website: e.target.value })} />
                </label>
                <label>
                  <span>Number of Floors</span>
                  <input type="number" value={buildingData.num_floors} onChange={e => setBuildingData({ ...buildingData, num_floors: parseInt(e.target.value) })} required />
                </label>
                <label>
                  <span>Total Units</span>
                  <input type="number" value={buildingData.total_units} onChange={e => setBuildingData({ ...buildingData, total_units: parseInt(e.target.value) })} required />
                </label>
                <label>
                  <span>Year Built</span>
                  <input type="number" value={buildingData.year_built} onChange={e => setBuildingData({ ...buildingData, year_built: parseInt(e.target.value) })} required />
                </label>
                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                  <button type="submit" className="btn primary" disabled={isLoading}>Save Building Info</button>
                </div>
              </form>
            </div>
          )}

        </section>
      </main>
    </div>
  )
}

export default Settings
