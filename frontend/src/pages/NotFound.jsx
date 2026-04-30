import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="page not-found">
      <div className="not-found-card">
        <p className="eyebrow">404</p>
        <h1>That page is not here.</h1>
        <p className="muted">Return to the main experience and continue exploring Fluxora.</p>
        <Link to="/" className="btn primary">Go home</Link>
      </div>
    </div>
  )
}

export default NotFound
