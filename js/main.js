(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* nav */
  const nav = document.getElementById('nav');
  const onNav = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onNav, { passive: true });
  onNav();

  /* hero parallax */
  const heroMedia = document.getElementById('heroMedia');
  const hero = document.querySelector('.hero');
  let heroH = hero.offsetHeight;
  addEventListener('resize', () => heroH = hero.offsetHeight);
  if (!reduced) {
    addEventListener('scroll', () => {
      const y = clamp(scrollY, 0, heroH);
      heroMedia.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
    }, { passive: true });
  }

  /* reveals, used sparingly */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* pinned voyage */
  const voyage = document.getElementById('voyage');
  const track = document.getElementById('voyageTrack');
  const path = document.getElementById('orbitPath');
  const craft = document.getElementById('craft');
  const pinned = () => !reduced && innerWidth > 960;
  const total = () => voyage.offsetHeight - innerHeight;

  if (pinned()) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    let target = 0, current = -1, raf = null;

    const measure = () => { target = clamp(scrollY - voyage.offsetTop, 0, total()) / total() || 0; };

    const tick = () => {
      measure();
      if (current < 0) current = target;
      current += (target - current) * 0.085;
      if (Math.abs(target - current) < 0.0004) current = target;
      const w = track.scrollWidth - innerWidth;
      track.style.transform = `translate3d(${-current * w}px, 0, 0)`;
      path.style.strokeDashoffset = len * (1 - current);
      const p = path.getPointAtLength(len * current);
      const r = path.getBoundingClientRect();
      craft.style.left = `${r.left + p.x * r.width / 1200}px`;
      craft.style.top = `${r.top + p.y * r.height / 120}px`;
      raf = requestAnimationFrame(tick);
    };
    addEventListener('scroll', measure, { passive: true });
    addEventListener('resize', () => { if (!pinned()) cancelAnimationFrame(raf); else raf ??= requestAnimationFrame(tick); });
    raf = requestAnimationFrame(tick);
  }

  /* inquiry form (demo: no backend) */
  const form = document.getElementById('inqForm');
  const sent = document.getElementById('sentMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    sent.hidden = false;
    form.reset();
  });
})();
