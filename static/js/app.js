document.addEventListener('DOMContentLoaded',()=>{
  // Basic KPI demo placeholders
  const el=(id)=>document.getElementById(id)
  if(el('kpi-collections')) el('kpi-collections').textContent='৳ 0'
  if(el('kpi-bookings')) el('kpi-bookings').textContent='0'
  if(el('kpi-tickets')) el('kpi-tickets').textContent='0'
  if(el('kpi-sos')) el('kpi-sos').textContent='0'
});
{% extends 'base.html' %}
{% block title %}Login · Fluxora{% endblock %}
{% block content %}
<section class="auth">
  <div class="card auth-card">
    <h1>Login</h1>
    <form method="post" action="">
      {% csrf_token %}
      <div class="field">
        <label>Email</label>
        <input type="email" name="email" required />
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" name="password" required />
      </div>
      <button class="btn primary" type="submit">Sign in</button>
    </form>
    <p class="muted">Don't have an account? <a href="{% url 'signup' %}">Sign up</a></p>
  </div>
</section>
{% endblock %}

