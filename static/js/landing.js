window.addEventListener('load', () => {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    })
  }, { root: null, rootMargin: '0px', threshold: 0.1 });

  document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
});

