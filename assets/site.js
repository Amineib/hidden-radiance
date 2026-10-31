/* Hidden Radiance — shared behaviour: header, reveal on scroll, lightbox, forms. */

/* Adresse e-mail qui reçoit les formulaires. Tant qu'elle est vide, les messages
   sont envoyés vers les messages Instagram de @hidden__radiance. */
const HR_EMAIL = 'hradiance.pro@gmail.com';
const HR_IG = 'hidden___radiance';

(function(){
  /* header: menu on phones, solid background once the page scrolls */
  const hdr = document.querySelector('.hdr'), btn = document.querySelector('.menu-btn');
  if (hdr && btn){
    btn.addEventListener('click', ()=>{ const o = hdr.classList.toggle('open'); btn.setAttribute('aria-expanded', o); btn.textContent = o ? 'Fermer' : 'Menu'; });
    hdr.querySelectorAll('nav a').forEach(a=>a.addEventListener('click', ()=>{ hdr.classList.remove('open'); btn.setAttribute('aria-expanded', false); btn.textContent = 'Menu'; }));
  }
  if (hdr){ const solid = ()=>hdr.classList.toggle('solid', scrollY > 40); addEventListener('scroll', solid, {passive:true}); solid(); }

  /* reveal on scroll */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es=>es.forEach(e=>{ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px'}) : null;
  document.querySelectorAll('.rv').forEach(el=>io ? io.observe(el) : el.classList.add('in'));

  /* lightbox for any [data-lb] group */
  const groups = {};
  document.querySelectorAll('[data-lb]').forEach(el=>{ (groups[el.dataset.lb] = groups[el.dataset.lb] || []).push(el); });
  if (Object.keys(groups).length){
    const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-label','Image en grand');
    lb.innerHTML = `<div class="lb-top"><span class="mono" id="lbCount"></span><button type="button" id="lbClose">Fermer</button></div>
      <div class="lb-stage"><img id="lbImg" alt=""></div>
      <div class="lb-cap"><p id="lbCap"></p><div class="lb-nav"><button type="button" id="lbPrev">Précédente</button><button type="button" id="lbNext">Suivante</button></div></div>`;
    document.body.appendChild(lb);
    const img = lb.querySelector('#lbImg'), cap = lb.querySelector('#lbCap'), cnt = lb.querySelector('#lbCount');
    let g = null, i = 0, last = null;
    const show = ()=>{ const el = g[i], im = el.querySelector('img'); img.src = el.dataset.full || im.currentSrc || im.src; img.alt = im.alt;
      cap.innerHTML = `<b>${el.dataset.title || ''}</b>${el.dataset.cap || ''}`; cnt.textContent = `${i+1} / ${g.length}`; };
    const open = (el)=>{ g = groups[el.dataset.lb]; i = g.indexOf(el); last = document.activeElement; show(); lb.classList.add('open'); document.body.classList.add('locked'); lb.querySelector('#lbClose').focus(); };
    const close = ()=>{ lb.classList.remove('open'); document.body.classList.remove('locked'); last && last.focus && last.focus(); };
    const step = d=>{ i = (i + d + g.length) % g.length; show(); };
    Object.values(groups).flat().forEach(el=>el.addEventListener('click', e=>{ e.preventDefault(); open(el); }));
    lb.querySelector('#lbClose').addEventListener('click', close);
    lb.querySelector('#lbPrev').addEventListener('click', ()=>step(-1));
    lb.querySelector('#lbNext').addEventListener('click', ()=>step(1));
    lb.addEventListener('click', e=>{ if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
    addEventListener('keydown', e=>{ if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
    let sx = null; lb.addEventListener('touchstart', e=>{ sx = e.touches[0].clientX; }, {passive:true});
    lb.addEventListener('touchend', e=>{ if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; });
  }

  /* forms: e-mail when an address is set, otherwise Instagram messages */
  document.querySelectorAll('form[data-hr-form]').forEach(f=>{
    const note = f.querySelector('.form-note');
    f.addEventListener('submit', async e=>{
      e.preventDefault();
      if (!f.reportValidity()) return;
      const data = Object.fromEntries(new FormData(f).entries());
      const subject = f.dataset.subject || 'Hidden Radiance';
      const body = f.dataset.hrForm === 'signup'
        ? `Bonjour,\n\nJe souhaite recevoir les informations : ${subject}.\n\nMon e-mail : ${data.email}\n`
        : `Bonjour,\n\n${data.message}\n\n${data.nom}\n${data.email}\n`;
      if (HR_EMAIL){
        location.href = `mailto:${HR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        if (note){ note.textContent = 'Votre messagerie s’ouvre avec le message prêt à être envoyé.'; note.classList.add('ok'); }
      } else {
        try { await navigator.clipboard.writeText(`${subject}\n\n${body}`); } catch(err){}
        window.open(`https://ig.me/m/${HR_IG}`, '_blank', 'noopener');
        if (note){ note.textContent = `Votre message est copié : collez-le dans la conversation Instagram @${HR_IG} qui vient de s’ouvrir.`; note.classList.add('ok'); }
      }
    });
  });
})();
