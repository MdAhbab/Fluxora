const SiteFooter = () => {
  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div>
          <div className="logo footer-logo">Fluxora</div>
          <p className="muted">
            Apartment operations, finance, and community in one modern platform.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#features">Modules</a></li>
            <li><a href="#modules">Workflows</a></li>
            <li><a href="#pricing">Access</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <p className="muted">123 Innovation Drive, Dhaka</p>
          <p className="muted">hello@fluxora.com</p>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Fluxora. All rights reserved.</div>
    </footer>
  )
}

export default SiteFooter
