/* 8パス — shared interactions: nav, scroll reveals, hero intro */
(function () {
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');

  // sticky nav background after scroll; drop dark mode once past hero
  const hero = document.querySelector('.hero');
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (hero) {
      const past = y > hero.offsetHeight - 90;
      nav.classList.toggle('on-dark', !past && y < hero.offsetHeight);
      if (past) nav.classList.remove('on-dark');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
    });
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
      })
    );
  }

  // scroll reveals
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  // hero intro (staggered)
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero h1 .reveal-line > span').forEach((s, i) => {
      s.animate(
        [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }],
        { duration: 900, delay: 150 + i * 130, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' }
      );
    });
    const fadeUps = [
      ['.hero-kicker', 100],
      ['.hero-lead', 650],
      ['.hero-cta', 780],
      ['.hero-aside', 500],
    ];
    fadeUps.forEach(([sel, delay]) => {
      const el = document.querySelector(sel);
      if (el)
        el.animate(
          [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
          { duration: 800, delay, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' }
        );
    });
  });
})();
