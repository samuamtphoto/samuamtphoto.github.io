/* SM VISUALS — interacción */
(function(){
  'use strict';
  var P = window.PROYECTOS || [];
  var byId = {}; P.forEach(function(p){ byId[p.id] = p; });
  var lang = 'es';
  var $ = function(s, c){ return (c || document).querySelector(s); };
  var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var T = {
    es:{foto:'Foto',video:'Vídeo',fotos:'fotos',videos:'vídeos',reels:'reels',cerrar:'Cerrar',siguiente:'Siguiente proyecto',ver:'Ver vídeo',reel:'Reel',film:'Film'},
    en:{foto:'Photo',video:'Video',fotos:'photos',videos:'videos',reels:'reels',cerrar:'Close',siguiente:'Next project',ver:'Watch video',reel:'Reel',film:'Film'}
  };
  var PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z" fill="currentColor"/></svg>';
  function thumb(id){ return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; }

  /* ── Idioma ── */
  function setLang(l){
    lang = l;
    document.documentElement.lang = l;
    $$('[data-es]').forEach(function(el){ var v = el.getAttribute('data-' + l); if(v !== null) el.innerHTML = v; });
    $$('[data-es-placeholder]').forEach(function(el){ el.placeholder = el.getAttribute('data-' + l + '-placeholder'); });
    $$('.lang button').forEach(function(b){ var on = b.dataset.lang === l; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
    try{ localStorage.setItem('smv_lang', l); }catch(e){}
    if(openId) renderPanel(openId, true);
  }
  $$('.lang button').forEach(function(b){ b.addEventListener('click', function(){ setLang(b.dataset.lang); }); });

  /* ── Cabecera y menú móvil ── */
  var header = $('.site-header'), navbar = $('.navbar');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  $('.menu-btn').addEventListener('click', function(){
    var open = navbar.classList.toggle('open');
    this.setAttribute('aria-expanded', open);
  });
  $$('.main-links a').forEach(function(a){ a.addEventListener('click', function(){ navbar.classList.remove('open'); $('.menu-btn').setAttribute('aria-expanded', false); }); });

  /* ── Apariciones suaves ── */
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:.05});
    $$('.reveal').forEach(function(el){ io.observe(el); });
  } else { $$('.reveal').forEach(function(el){ el.classList.add('in'); }); }

  /* ── Vídeo del hero: no cargar en ahorro de datos ── */
  var hv = $('.hero video');
  if(hv && navigator.connection && navigator.connection.saveData){ hv.removeAttribute('autoplay'); hv.pause(); }

  /* ── Filtros del portfolio ── */
  $$('.filters button').forEach(function(b){
    b.addEventListener('click', function(){
      $$('.filters button').forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
      var f = b.dataset.filter;
      $$('.card').forEach(function(c){ c.classList.toggle('hidden', f !== 'todo' && (' ' + c.dataset.svc + ' ').indexOf(' ' + f + ' ') < 0); });
    });
  });
  /* Enlaces "Ver ejemplos" de servicios → filtra el portfolio */
  $$('[data-goto]').forEach(function(a){
    a.addEventListener('click', function(e){
      var b = $('.filters button[data-filter="' + a.dataset.goto + '"]');
      if(b){ e.preventDefault(); b.click(); $('#trabajo').scrollIntoView({behavior:'smooth'}); }
    });
  });

  /* ── Previsualizaciones de vídeo en bucle (solo cuando se ven) ── */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var prevIO = ('IntersectionObserver' in window && !reduce && !saveData) ? new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v = e.target.querySelector('video.prev');
      if(e.isIntersecting){
        if(!v){ v = document.createElement('video'); v.className = 'prev'; v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.preload = 'none'; v.src = e.target.dataset.prev; (e.target.querySelector('.frame') || e.target).appendChild(v); v.addEventListener('playing', function(){ v.classList.add('on'); }); }
        var pr = v.play(); if(pr && pr.catch) pr.catch(function(){});
      } else if(v){ v.pause(); }
    });
  }, {threshold:.55}) : null;
  function watchPrev(root){ if(prevIO) $$('[data-prev]', root).forEach(function(el){ prevIO.observe(el); }); }
  watchPrev(document);

  /* ── Servicios desplegables ── */
  $$('.service button').forEach(function(b){
    b.addEventListener('click', function(){
      var li = b.parentNode, open = li.hasAttribute('data-open');
      if(open) li.removeAttribute('data-open'); else li.setAttribute('data-open', '');
      b.setAttribute('aria-expanded', !open);
      var v = li.querySelector('.s-media video');
      if(v){
        if(!open){ if(!v.src && v.dataset.lazy) v.src = v.dataset.lazy; var pr = v.play(); if(pr && pr.catch) pr.catch(function(){}); }
        else v.pause();
      }
    });
  });

  /* ── Testimonios rotativos ── */
  (function(){
    var box = $('.quote-main'); if(!box) return;
    var slides = $$('.q-slide', box), dots = $$('.q-dots button', box);
    if(slides.length < 2) return;
    var i = 0, t = null, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(n){
      n = (n + slides.length) % slides.length; if(n === i) return;
      var out = slides[i];
      out.classList.toggle('is-active', false); out.classList.toggle('is-leaving', true); out.setAttribute('aria-hidden','true'); dots[i].classList.toggle('is-active', false);
      setTimeout(function(){ out.classList.toggle('is-leaving', false); }, 1700);
      i = n;
      slides[i].classList.toggle('is-active', true); slides[i].setAttribute('aria-hidden','false'); dots[i].classList.toggle('is-active', true);
    }
    function start(){ if(!reduce){ clearInterval(t); t = setInterval(function(){ go(i + 1); }, 4000); } }
    dots.forEach(function(d, k){ d.addEventListener('click', function(){ go(k); start(); }); });
    start();
  })();

  /* ── Bloqueo de scroll ── */
  var locks = 0;
  function lock(){ if(locks++ === 0) document.documentElement.style.overflow = 'hidden'; }
  function unlock(){ if(--locks <= 0){ locks = 0; document.documentElement.style.overflow = ''; } }

  /* ── Panel de proyecto ── */
  var panel = $('#panel'), openId = null, lastFocus = null;
  function counts(p){
    var t = T[lang], out = [];
    var v = p.videos.filter(function(x){ return !x.v; }).length, r = p.videos.filter(function(x){ return x.v; }).length;
    if(p.fotos.length) out.push(p.fotos.length + ' ' + t.fotos);
    if(v) out.push(v + ' ' + (v === 1 ? t.video.toLowerCase() : t.videos));
    if(r) out.push(r + ' ' + t.reels);
    return out.join(' · ');
  }
  function vcard(v, label){
    var src = v.src ? ' data-src="' + v.src + '" data-prev="' + v.prev + '"' : ' data-yt="' + v.yt + '"';
    return '<button class="vcard' + (v.v ? ' vertical' : '') + '"' + src + ' data-v="' + (v.v ? 1 : 0) + '" aria-label="' + esc(T[lang].ver + ': ' + v.t) + '">' +
      '<div class="frame"><img src="' + (v.src ? v.poster : thumb(v.yt)) + '" alt="" loading="lazy" decoding="async"><span class="play">' + PLAY + '</span>' +
      '<span class="vt"><small>' + esc(label || (v.v ? T[lang].reel : T[lang].film)) + '</small>' + esc(v.t) + '</span></div></button>';
  }
  function track(path, title){ try{ if(window.goatcounter && window.goatcounter.count) window.goatcounter.count({path:path, title:title, event:true}); }catch(e){} }
  var panelTab = {id:null, tab:'fotos', all:false};
  function renderPanel(id, keepScroll){
    var p = byId[id]; if(!p) return;
    var idx = P.indexOf(p), next = P[(idx + 1) % P.length], t = T[lang];
    var films = p.videos.filter(function(v){ return !v.v; }), reels = p.videos.filter(function(v){ return v.v; });
    var h = '<div class="panel-bar"><span class="chip">' + p.n + ' — ' + esc(p.titulo[lang]) + '</span><button class="btn" data-close>' + t.cerrar + ' ✕</button></div>';
    h += '<header class="panel-head"><h2 class="display" id="panel-title">' + esc(p.titulo[lang]) + '</h2><div><p class="eyebrow" style="color:var(--warm);margin-bottom:12px">' + esc(p.meta[lang]) + '</p><p>' + esc(p.intro[lang]) + '</p><p class="eyebrow" style="margin-top:18px;color:var(--mute)">' + counts(p) + '</p></div></header>';
    h += '<div class="panel-body">';
    var es = lang === 'es', both = p.fotos.length && p.videos.length;
    if(panelTab.id !== id){ panelTab = {id:id, tab:'fotos', all:false}; }
    var tab = both ? panelTab.tab : (p.fotos.length ? 'fotos' : 'videos');
    if(both){
      h += '<div class="panel-tabs" role="tablist">'
        + '<button role="tab" data-tab="fotos" aria-selected="' + (tab === 'fotos') + '">' + (es ? 'Fotos' : 'Photos') + ' <span>' + p.fotos.length + '</span></button>'
        + '<button role="tab" data-tab="videos" aria-selected="' + (tab === 'videos') + '">' + (es ? 'Vídeos' : 'Videos') + ' <span>' + p.videos.length + '</span></button></div>';
    }
    var vids = '';
    if(films.length) vids += '<div class="panel-videos">' + films.map(function(v){ return vcard(v); }).join('') + '</div>';
    if(reels.length) vids += '<div class="panel-videos verticals">' + reels.map(function(v){ return vcard(v); }).join('') + '</div>';
    if(vids) h += '<div class="panel-pane" data-pane="videos"' + (tab === 'videos' ? '' : ' hidden') + '>' + vids + '</div>';
    if(p.fotos.length){
      var LIM = 24, cut = !panelTab.all && p.fotos.length > LIM + 6;
      h += '<div class="panel-pane" data-pane="fotos"' + (tab === 'fotos' ? '' : ' hidden') + '><div class="masonry">' + p.fotos.map(function(f, i){
        return '<button data-i="' + i + '" aria-label="' + esc(f.a) + '"' + (cut && i >= LIM ? ' class="is-extra"' : '') + '><img src="' + f.m + '" width="' + f.w + '" height="' + f.h + '" alt="' + esc(f.a) + '" loading="lazy" decoding="async"></button>';
      }).join('') + '</div>';
      if(cut) h += '<div class="panel-more"><button class="btn" data-more>' + (es ? 'Ver las ' + p.fotos.length + ' fotos' : 'See all ' + p.fotos.length + ' photos') + ' ↓</button></div>';
      h += '</div>';
    }
    var Q = window.TESTIMONIO;
    if(Q && Q.proyecto === id){
      h += '<figure class="quote"><div class="mark" aria-hidden="true">“</div><div><blockquote><p>' + esc(Q.texto) + '</p></blockquote><footer><strong>' + esc(Q.autor) + '</strong>' + esc(Q.rol[lang]) + '</footer></div></figure>';
    }
    h += '<div class="panel-next"><button data-next="' + next.id + '"><span><small>' + t.siguiente + '</small>' + esc(next.titulo[lang]) + '</span> →</button></div></div>';
    var st = panel.scrollTop;
    panel.innerHTML = h;
    watchPrev(panel);
    if(keepScroll) panel.scrollTop = st;
  }
  function openPanel(id, push){
    if(!byId[id]) return;
    if(!openId){ lastFocus = document.activeElement; lock(); }
    openId = id;
    renderPanel(id);
    panel.scrollTop = 0;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    setTimeout(function(){ var c = $('[data-close]', panel); if(c) c.focus({preventScroll:true}); }, 60);
    if(push !== false) history.pushState({p:id}, '', '#' + id);
    track('proyecto-' + id, byId[id].titulo.es);
  }
  function closePanel(push){
    if(!openId) return;
    openId = null;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    unlock();
    if(lastFocus) lastFocus.focus({preventScroll:true});
    if(push !== false) history.pushState({}, '', location.pathname + location.search);
  }
  $$('.card').forEach(function(c){ c.addEventListener('click', function(){ openPanel(c.dataset.id); }); });
  panel.addEventListener('click', function(e){
    var t = e.target.closest('button'); if(!t) return;
    if(t.dataset.tab){
      panelTab.tab = t.dataset.tab;
      $$('.panel-tabs button', panel).forEach(function(b){ b.setAttribute('aria-selected', b === t); });
      $$('.panel-pane', panel).forEach(function(pn){ pn.hidden = pn.dataset.pane !== t.dataset.tab; });
      var tabs = $('.panel-tabs', panel); if(tabs && panel.scrollTop > tabs.offsetTop) panel.scrollTop = tabs.offsetTop - 70;
      return;
    }
    if(t.hasAttribute('data-more')){
      panelTab.all = true;
      $$('.masonry .is-extra', panel).forEach(function(b){ b.classList.toggle('is-extra', false); });
      t.parentNode.hidden = true;
      return;
    }
    if(t.hasAttribute('data-close')) return closePanel();
    if(t.dataset.next){ openPanel(t.dataset.next, false); history.replaceState({p:t.dataset.next}, '', '#' + t.dataset.next); return; }
    if(t.dataset.yt || t.dataset.src) return openVideo(t);
    if(t.dataset.i !== undefined) return openPhotos(byId[openId].fotos, +t.dataset.i);
  });
  window.addEventListener('popstate', function(){
    var id = location.hash.slice(1);
    if(viewer.classList.contains('open')) closeViewer();
    if(byId[id]) openPanel(id, false); else closePanel(false);
  });

  /* ── Visor (fotos y vídeo) ── */
  var viewer = $('#viewer'), stage = $('.v-stage', viewer), vCount = $('.v-count', viewer);
  var list = [], cur = 0, vFocus = null, clearTimer = null;
  function showViewer(){ clearTimeout(clearTimer); vFocus = document.activeElement; viewer.classList.add('open'); viewer.setAttribute('aria-hidden', 'false'); lock(); setTimeout(function(){ $('.v-close', viewer).focus({preventScroll:true}); }, 50); }
  function closeViewer(){
    if(!viewer.classList.contains('open')) return;
    viewer.classList.remove('open'); viewer.setAttribute('aria-hidden', 'true');
    clearTimer = setTimeout(function(){ stage.innerHTML = ''; }, 400);
    unlock(); if(vFocus) vFocus.focus({preventScroll:true});
  }
  function drawPhoto(){
    clearTimeout(clearTimer);
    var f = list[cur];
    stage.innerHTML = '<img src="' + f.s + '" alt="' + esc(f.a) + '">';
    vCount.textContent = (cur + 1) + ' / ' + list.length;
    var n = list[(cur + 1) % list.length]; if(n){ var pre = new Image(); pre.src = n.s; }
  }
  function openPhotos(fotos, i){ list = fotos; cur = i; viewer.classList.remove('is-video'); drawPhoto(); showViewer(); }
  function step(d){ if(!list.length) return; cur = (cur + d + list.length) % list.length; drawPhoto(); }
  function openVideo(btn){
    track('video-' + (btn.dataset.yt || (btn.dataset.src || '').split('/').pop().split('.')[0]), btn.getAttribute('aria-label') || '');
    clearTimeout(clearTimer);
    list = [];
    var vertical = btn.dataset.v === '1';
    viewer.classList.add('is-video');
    var inner = btn.dataset.src
      ? '<video src="' + btn.dataset.src + '" controls autoplay playsinline></video>'
      : '<iframe src="https://www.youtube-nocookie.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    stage.innerHTML = '<div class="yt' + (vertical ? ' vertical' : '') + '">' + inner + '</div>';
    showViewer();
  }
  $('.v-close', viewer).addEventListener('click', closeViewer);
  $('.v-prev', viewer).addEventListener('click', function(){ step(-1); });
  $('.v-next', viewer).addEventListener('click', function(){ step(1); });
  viewer.addEventListener('click', function(e){ if(e.target === viewer || e.target === stage) closeViewer(); });
  var sx = null;
  viewer.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, {passive:true});
  viewer.addEventListener('touchend', function(e){ if(sx === null) return; var dx = e.changedTouches[0].clientX - sx; if(Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; }, {passive:true});
  document.addEventListener('keydown', function(e){
    if(viewer.classList.contains('open')){
      if(e.key === 'Escape') closeViewer();
      if(e.key === 'ArrowRight') step(1);
      if(e.key === 'ArrowLeft') step(-1);
      return;
    }
    if(openId && e.key === 'Escape') closePanel();
  });

  /* ── Vídeos destacados en portada ── */
  $$('.vcard').forEach(function(b){ if(!b.closest('#panel')) b.addEventListener('click', function(){ openVideo(b); }); });

  /* ── Formulario (Formspree) ── */
  var form = $('#contactForm');
  if(form) form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = $('button[type=submit]', form); btn.disabled = true;
    fetch(form.action, {method:'POST', body:new FormData(form), headers:{'Accept':'application/json'}})
      .then(function(r){ if(!r.ok) throw 0; form.classList.add('sent'); })
      .catch(function(){ btn.disabled = false; alert(lang === 'es' ? 'No se pudo enviar. Escríbeme a info@smvisuals.es' : 'Could not send. Please email info@smvisuals.es'); });
  });

  /* ── Inicio ── */
  try{ if(localStorage.getItem('smv_lang') === 'en') setLang('en'); }catch(e){}
  var start = location.hash.slice(1);
  if(byId[start]){ history.replaceState({p:start}, '', '#' + start); openPanel(start, false); }
})();
