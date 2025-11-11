// app.js - carousel, theme toggle, form handling
(function(){
  // ---------- Carousel ----------
  const carousel = document.getElementById('carousel');
  const slidesContainer = carousel.querySelector('.slides');
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');
  const indicatorsWrap = carousel.querySelector('.indicators');
  const autoplayDelay = 5000;
  let index = 0;
  let timer = null;
  let isPaused = false;

  // populate indicators
  slides.forEach((_,i)=>{
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Go to slide ' + (i+1));
    btn.dataset.index = i;
    if(i===0) btn.classList.add('active');
    indicatorsWrap.appendChild(btn);
  });
  const indicators = Array.from(indicatorsWrap.children);

  function goTo(i){
    index = (i + slides.length) % slides.length;
    slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
    indicators.forEach(ind => ind.classList.remove('active'));
    indicators[index].classList.add('active');
  }
  function next(){ goTo(index + 1); }
  function prev(){ goTo(index - 1); }

  nextBtn.addEventListener('click', ()=>{ next(); restartTimer(); });
  prevBtn.addEventListener('click', ()=>{ prev(); restartTimer(); });

  indicators.forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const i = Number(e.currentTarget.dataset.index);
      goTo(i);
      restartTimer();
    });
  });

  function startTimer(){ stopTimer(); timer = setInterval(()=>{ if(!isPaused) next(); }, autoplayDelay); }
  function stopTimer(){ if(timer) clearInterval(timer); }
  function restartTimer(){ stopTimer(); startTimer(); }

  carousel.addEventListener('mouseenter', ()=> isPaused = true);
  carousel.addEventListener('mouseleave', ()=> isPaused = false);
  carousel.addEventListener('focusin', ()=> isPaused = true);
  carousel.addEventListener('focusout', ()=> isPaused = false);

  carousel.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') { next(); restartTimer(); }
    if(e.key === 'ArrowLeft') { prev(); restartTimer(); }
  });

  goTo(0);
  startTimer();

  // ---------- Theme toggle ----------
  const THEME_KEY = 'globesole_theme';
  const docRoot = document.documentElement;

  function getPreferredTheme(){
    const stored = localStorage.getItem(THEME_KEY);
    if(stored) return stored;
    const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefers ? 'light' : 'dark';
  }

  function applyTheme(theme){
    if(theme === 'light') {
      docRoot.setAttribute('data-theme', 'light');
      document.getElementById('theme-toggle').setAttribute('aria-pressed','true');
    } else {
      docRoot.removeAttribute('data-theme');
      document.getElementById('theme-toggle').setAttribute('aria-pressed','false');
    }
  }

  const themeToggle = document.getElementById('theme-toggle');
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  themeToggle.addEventListener('click', ()=>{
    const current = docRoot.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const nextTheme = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  });

  // Allow keyboard toggle via Space/Enter when focused
  themeToggle.addEventListener('keydown', (e)=>{
    if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); themeToggle.click(); }
  });

  // ---------- Contact form handling ----------
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');
  const formNotice = document.getElementById('formNotice');

  function showNotice(msg, success = true){
    formNotice.textContent = msg;
    formNotice.style.color = success ? '' : '#f88';
  }

  clearBtn.addEventListener('click', ()=> contactForm.reset());

  contactForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    showNotice('Sending...', true);
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    // Basic validation
    if(!formData.get('email') || !formData.get('message')){
      showNotice('Please fill email and message fields.', false);
      submitBtn.disabled = false;
      return;
    }

    // Replace with your actual endpoint (Formspree, Netlify Forms or your API)
    const ENDPOINT = contactForm.getAttribute('action') || '/.netlify/functions/contact';

    try{
      // If using Formspree, endpoint expects POST with form data
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if(res.ok){
        showNotice('Message sent — we will contact you within one business day.', true);
        contactForm.reset();
      } else {
        const json = await res.json().catch(()=>null);
        const msg = json && json.error ? json.error : 'Failed to send form. Please email contact@globesole.example';
        showNotice(msg, false);
      }
    }catch(err){
      console.error(err);
      showNotice('Network error — please try again later or email contact@globesole.example', false);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---------- Footer year ----------
  document.getElementById('year').textContent = new Date().getFullYear();
})();