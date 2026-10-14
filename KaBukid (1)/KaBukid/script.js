(() => {
  'use strict';

  /* ---------- Settings: change these to fit your shop ---------- */
  const CURRENCY = '₱'; // Philippine peso
  const FREE_DELIVERY_OVER = 500;
  const DELIVERY_FEE = 50;
  const STORAGE_CART = 'kabukid-sako';
  const STORAGE_THEME = 'kabukid-theme';

  /* ---------- Product data ----------
     unit  = what one price covers (bundle, kilo, 100g, sack).
     stock = how many of that unit can be ordered.
     avail = the amount shown on the card.
     shape = which drawing to use. */
  const PRODUCTS = [
    { id: 'sitaw', name: 'Sitaw', cat: 'vegetables', price: 50, unit: 'bundle', stock: 50, avail: '50 bundles', shape: 'bundle', c: '#3f9a45', c2: '#ffc928' },
    { id: 'talong', name: 'Talong', cat: 'vegetables', price: 40, unit: 'kilo', stock: 25, avail: '25 kg', shape: 'long', c: '#5b2a6e', c2: '#3f8a45' },
    { id: 'kangkong', name: 'Kangkong', cat: 'vegetables', price: 30, unit: 'kilo', stock: 10, avail: '10 kg', shape: 'leaf', c: '#2f8a3f', c2: '#a6e0ad', low: true },
    { id: 'carrots', name: 'Carrots', cat: 'vegetables', price: 100, unit: 'kilo', stock: 50, avail: '50 kg', shape: 'long', c: '#ee8a2b', c2: '#3f8a45' },

    { id: 'avocado', name: 'Avocado', cat: 'fruits', price: 50, unit: 'kilo', stock: 20, avail: '20 kg', shape: 'pear', c: '#4b7a2e', c2: '#8a5a2b' },
    { id: 'grapes', name: 'Grapes', cat: 'fruits', price: 200, unit: 'kilo', stock: 20, avail: '20 kg', shape: 'cluster', c: '#6e2a5c', c2: '#3f8a45' },
    { id: 'dragonfruit', name: 'Dragon Fruit', cat: 'fruits', price: 150, unit: 'kilo', stock: 30, avail: '30 kg', shape: 'dragon', c: '#d6246e', c2: '#3f9a45' },

    { id: 'bigas', name: '5kg Bigas', cat: 'crops', price: 220, unit: 'sack', stock: 50, avail: '50 sacks', shape: 'sack', c: '#efe3c0', c2: '#17803d' },
    { id: 'blackbeans', name: 'Black Beans', cat: 'crops', price: 15, unit: '100g', stock: 100, avail: '10 kg', shape: 'seeds', c: '#2b2b35', c2: '#555555' },
    { id: 'munggo', name: 'Munggo', cat: 'crops', price: 55, unit: 'kilo', stock: 25, avail: '25 kg', shape: 'seeds', c: '#6f9a3a', c2: '#3f6a1f' },
    { id: 'corn', name: 'Corn', cat: 'crops', price: 60, unit: 'kilo', stock: 50, avail: '50 kg', shape: 'ear', c: '#f2c84b', c2: '#3f8a45' }
  ];

  /* Product photos: put these files in an "assets" folder next to index.html.
     If a file is missing, the drawing for that product is shown instead. */
  const IMAGE_FILES = {
    sitaw: 'sitaw.jpeg', talong: 'talong.jpeg', kangkong: 'kangkong.jpeg', carrots: 'carrots.jpeg',
    avocado: 'avocado.jpeg', grapes: 'grapes.jpeg', dragonfruit: 'dragonfruit.jpeg',
    bigas: 'bigas.jpeg', blackbeans: 'blackbeans.jpeg', munggo: 'munggo.jpeg', corn: 'corn.jpeg'
  };
  PRODUCTS.forEach(p => { p.img = 'assets/' + IMAGE_FILES[p.id]; });

  const HERO_IDS = ['sitaw', 'talong', 'kangkong', 'avocado', 'dragonfruit', 'bigas'];
  const CAT_LABEL = { vegetables: 'Vegetables', fruits: 'Fruits', crops: 'Crops & grains' };

  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const today = new Date();

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = n => CURRENCY + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- Storage that fails safely ---------- */
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }
  };

  /* ---------- Product artwork (simple SVG shapes) ---------- */
  function art(p) {
    const c = p.c, d = p.c2;
    switch (p.shape) {
      case 'bundle':
        return `<path d="M30 12 C28 40 30 70 34 90 M42 10 C41 40 42 70 44 92 M54 10 C55 40 55 70 53 92 M66 12 C68 40 66 70 62 90" stroke="${c}" stroke-width="7" stroke-linecap="round" fill="none"/><rect x="24" y="44" width="52" height="10" rx="5" fill="${d}"/>`;
      case 'long':
        return `<g transform="rotate(30 50 50)"><path d="M50 18 C68 30 64 76 50 94 C36 76 32 30 50 18Z" fill="${c}"/><path d="M50 18 C46 10 38 6 32 8 C38 12 44 14 50 18Z M50 18 C54 9 62 5 68 7 C62 11 56 14 50 18Z" fill="${d}"/><path d="M44 38 C42 52 43 64 46 76" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
      case 'leaf':
        return `<path d="M50 92 C12 72 10 30 50 8 C90 30 88 72 50 92Z" fill="${c}"/><path d="M50 90 V22 M50 70 L32 56 M50 58 L68 44 M50 46 L34 34" stroke="${d}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
      case 'pear':
        return `<path d="M50 8 C62 8 66 24 74 38 C84 54 80 86 50 90 C20 86 16 54 26 38 C34 24 38 8 50 8Z" fill="${c}"/><circle cx="50" cy="64" r="12" fill="${d}"/><circle cx="46" cy="60" r="3" fill="#fff" opacity=".3"/>`;
      case 'dragon':
        return `<ellipse cx="50" cy="56" rx="29" ry="34" fill="${c}"/><path d="M50 22 C42 12 30 14 26 22 C34 24 42 26 50 22Z M50 22 C58 12 70 14 74 22 C66 24 58 26 50 22Z M24 46 C14 44 10 54 14 62 C20 58 24 54 24 46Z M76 46 C86 44 90 54 86 62 C80 58 76 54 76 46Z M32 80 C28 90 38 94 44 90 C40 86 36 84 32 80Z M68 80 C72 90 62 94 56 90 C60 86 64 84 68 80Z" fill="${d}"/><circle cx="42" cy="48" r="3" fill="#fff" opacity=".3"/>`;
      case 'cluster': {
        const pts = [[34, 36], [50, 34], [66, 36], [42, 52], [58, 52], [50, 68], [50, 82]];
        return `<path d="M50 8 V26" stroke="${d}" stroke-width="4" stroke-linecap="round"/><path d="M50 14 C58 8 68 10 72 16 C64 20 56 20 50 14Z" fill="${d}"/>` +
          pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="#fff" opacity=".25"/>`).join('');
      }
      case 'ear': {
        let g = `<path d="M50 20 V94" stroke="${d}" stroke-width="3" stroke-linecap="round"/><ellipse cx="50" cy="13" rx="5" ry="8" fill="${c}"/>`;
        for (let i = 0; i < 6; i++) {
          const y = 28 + i * 11;
          g += `<ellipse cx="40" cy="${y}" rx="10" ry="5" fill="${c}" transform="rotate(-35 40 ${y})"/><ellipse cx="60" cy="${y}" rx="10" ry="5" fill="${c}" transform="rotate(35 60 ${y})"/>`;
        }
        return g;
      }
      case 'seeds': {
        const s = [[30, 34, 20], [58, 28, -30], [72, 50, 40], [40, 56, -10], [62, 74, 25], [28, 76, -40], [50, 88, 5]];
        return s.map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="8" fill="${c}" transform="rotate(${a} ${x} ${y})"/><ellipse cx="${x - 3}" cy="${y - 2}" rx="5" ry="2" fill="#fff" opacity=".2" transform="rotate(${a} ${x} ${y})"/>`).join('');
      }
      case 'sack':
        return `<path d="M34 10 L66 10 L62 26 C84 34 90 58 86 74 C84 90 70 90 50 90 C30 90 16 90 14 74 C10 58 16 34 38 26 Z" fill="${c}" stroke="${d}" stroke-width="3" stroke-linejoin="round"/><path d="M36 26 Q50 34 64 26" stroke="${d}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="50" cy="62" r="14" fill="${d}"/><path d="M50 52 V72 M42 58 L50 52 L58 58" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      default:
        return '';
    }
  }
  const artSvg = p => `<svg viewBox="0 0 100 100" aria-hidden="true">${art(p)}</svg>`;
  const photo = p => `<img class="photo" src="${p.img}" alt="${p.name}" data-id="${p.id}" loading="lazy" decoding="async">`;

  /* If a photo file can't be loaded, swap in the drawing for that product. */
  document.addEventListener('error', e => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.classList.contains('photo')) return;
    const p = byId[img.dataset.id];
    if (p) img.outerHTML = artSvg(p);
  }, true);

  /* ---------- Sako (cart) state ---------- */
  let cart = {};
  try {
    const raw = store.get(STORAGE_CART);
    const parsed = raw ? JSON.parse(raw) : {};
    Object.keys(parsed || {}).forEach(id => {
      const q = parsed[id];
      if (byId[id] && Number.isInteger(q) && q > 0) cart[id] = Math.min(q, byId[id].stock);
    });
  } catch (e) { cart = {}; }

  const saveCart = () => store.set(STORAGE_CART, JSON.stringify(cart));
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.keys(cart).reduce((sum, id) => sum + byId[id].price * cart[id], 0);
  const deliveryFor = sub => (sub === 0 || sub >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE);

  /* ---------- Elements ---------- */
  const grid = $('#productGrid');
  const emptyState = $('#emptyState');
  const resultCount = $('#resultCount');
  const searchInput = $('#search');
  const sortSelect = $('#sort');
  const drawer = $('#drawer');
  const overlay = $('#overlay');
  const toastEl = $('#toast');

  const filters = { cat: 'all', q: '', sort: 'featured' };

  /* ---------- Toast ---------- */
  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------- Catalog ---------- */
  function stepperHtml(p, q) {
    return `<div class="stepper" role="group" aria-label="${p.name} quantity">
      <button type="button" data-action="dec" data-id="${p.id}" aria-label="Remove one ${p.name}">&minus;</button>
      <output aria-live="polite">${q}</output>
      <button type="button" data-action="inc" data-id="${p.id}" aria-label="Add one more ${p.name}"${q >= p.stock ? ' disabled' : ''}>+</button>
    </div>`;
  }

  function controlsHtml(p) {
    const q = cart[p.id] || 0;
    if (!q) {
      return `<button class="btn btn-primary btn-small" type="button" data-action="add" data-id="${p.id}" aria-label="Add ${p.name} to Sako">Add to Sako</button>`;
    }
    return stepperHtml(p, q);
  }

  function cardHtml(p) {
    const badge = p.low ? '<span class="badge badge-warn">Low stock</span>' : '';
    return `<article class="card" data-id="${p.id}" style="--tile:${p.c}">
      <div class="card-art">${photo(p)}<div class="badges">${badge}</div></div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <button class="link-btn farmer-link" type="button" data-chat-product="${p.id}">Message farmer ↗</button>
        <p class="avail">Available: <strong>${p.avail}</strong></p>
        <div class="card-foot">
          <p class="price"><strong>${money(p.price)}</strong><span>/ ${p.unit}</span></p>
          <div class="card-actions">${controlsHtml(p)}</div>
        </div>
      </div>
    </article>`;
  }

  function visibleProducts() {
    const q = filters.q.trim().toLowerCase();
    const list = PRODUCTS.filter(p => {
      if (filters.cat !== 'all' && p.cat !== filters.cat) return false;
      if (q && !(p.name.toLowerCase().includes(q) || CAT_LABEL[p.cat].toLowerCase().includes(q))) return false;
      return true;
    });
    const order = Object.fromEntries(PRODUCTS.map((p, i) => [p.id, i]));
    const sorters = {
      featured: (a, b) => order[a.id] - order[b.id],
      name: (a, b) => a.name.localeCompare(b.name),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price
    };
    return list.slice().sort(sorters[filters.sort]);
  }

  function renderCatalog() {
    const list = visibleProducts();
    grid.innerHTML = list.map(cardHtml).join('');
    emptyState.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    resultCount.textContent = list.length
      ? `${list.length} product${list.length === 1 ? '' : 's'}`
      : 'No products found';
  }

  function updateCard(id) {
    const card = grid.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;
    const active = document.activeElement;
    const wasAction = active && card.contains(active) ? active.dataset.action : null;
    card.querySelector('.card-actions').innerHTML = controlsHtml(byId[id]);
    if (wasAction) {
      const next = card.querySelector(`[data-action="${wasAction}"]:not([disabled])`) || card.querySelector('[data-action]:not([disabled])');
      if (next) next.focus();
    }
  }

  /* ---------- Sako actions ---------- */
  function setQty(id, qty) {
    const p = byId[id];
    if (!p) return;
    qty = Math.max(0, Math.min(p.stock, qty));
    if (qty === 0) delete cart[id]; else cart[id] = qty;
    saveCart();
    updateCard(id);
    renderCart();
  }

  /* ---------- Sako drawer ---------- */
  const viewCart = $('#viewCart');
  const viewCheckout = $('#viewCheckout');
  const viewDone = $('#viewDone');
  const checkoutBtn = $('#checkoutBtn');
  const placeBtn = $('#placeBtn');
  const backBtn = $('#backBtn');
  const drawerFoot = $('#drawerFoot');

  function renderCart() {
    const ids = Object.keys(cart);
    const count = cartCount();
    $('#cartCount').textContent = count;
    $('#cartBtn').setAttribute('aria-label', `Open your Sako, ${count} item${count === 1 ? '' : 's'}`);

    $('#cartEmpty').hidden = ids.length > 0;
    $('#cartItems').innerHTML = ids.map(id => {
      const p = byId[id];
      const q = cart[id];
      return `<li class="cart-item" style="--tile:${p.c}">
        <div class="cart-thumb">${photo(p)}</div>
        <div>
          <p class="cart-name">${p.name}</p>
          <p class="cart-unit">${money(p.price)} / ${p.unit}</p>
        </div>
        <p class="cart-line">${money(p.price * q)}</p>
        <div class="cart-controls">
          ${stepperHtml(p, q)}
          <button class="link-btn" type="button" data-action="remove" data-id="${p.id}">Remove</button>
        </div>
      </li>`;
    }).join('');

    const sub = subtotal();
    const del = deliveryFor(sub);
    $('#tSub').textContent = money(sub);
    $('#tDel').textContent = sub === 0 ? money(0) : (del === 0 ? 'Free' : money(del));
    $('#tTotal').textContent = money(sub + del);

    const left = FREE_DELIVERY_OVER - sub;
    $('#meterText').textContent = sub === 0
      ? `Free delivery on orders over ${money(FREE_DELIVERY_OVER)}`
      : (left > 0 ? `Add ${money(left)} more for free delivery` : 'You have free delivery');
    $('#meterFill').style.width = Math.min(100, (sub / FREE_DELIVERY_OVER) * 100) + '%';

    checkoutBtn.disabled = ids.length === 0;
  }

  function setView(next) {
    viewCart.hidden = next !== 'cart';
    viewCheckout.hidden = next !== 'checkout';
    viewDone.hidden = next !== 'done';
    drawerFoot.hidden = next === 'done';
    checkoutBtn.hidden = next !== 'cart';
    placeBtn.hidden = next !== 'checkout';
    backBtn.hidden = next !== 'checkout';
    $('#drawerTitle').textContent = next === 'checkout' ? 'Checkout' : (next === 'done' ? 'Thank you' : 'Your Sako');
  }

  let lastFocus = null;
  function openDrawer(next) {
    lastFocus = document.activeElement;
    setView(next || 'cart');
    drawer.inert = false;
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
    $('#closeDrawer').focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.inert = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function fillDeliveryDays() {
    const opts = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      opts.push(`<option value="${label}">${label}</option>`);
    }
    $('#oDay').innerHTML = opts.join('');
  }

  viewCheckout.addEventListener('submit', e => {
    e.preventDefault();
    if (!cartCount()) return;
    const total = subtotal() + deliveryFor(subtotal());
    const name = $('#oName').value.trim().split(' ')[0] || 'there';
    const day = $('#oDay').value;
    const num = 'KB-' + String(Math.floor(10000 + Math.random() * 90000));
    $('#doneText').textContent = `Thanks, ${name}. Order ${num} for ${money(total)} is set for ${day}.`;
    cart = {};
    saveCart();
    renderCart();
    renderCatalog();
    viewCheckout.reset();
    setView('done');
    $('#doneBtn').focus();
  });

  checkoutBtn.addEventListener('click', () => { setView('checkout'); $('#oName').focus(); });
  backBtn.addEventListener('click', () => setView('cart'));
  $('#doneBtn').addEventListener('click', closeDrawer);
  $('#closeDrawer').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  $('#cartBtn').addEventListener('click', () => openDrawer('cart'));

  document.addEventListener('keydown', e => {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key !== 'Tab') return;
    const focusables = $$('button:not([disabled]), input, select, textarea, a[href]', drawer).filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });


  /* ---------- Fly-to-Sako effect ---------- */
  function flyToCart(card) {
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const src = card.querySelector('.card-art img, .card-art svg');
    const target = $('#cartBtn');
    if (!src || !target || !src.animate) return;
    const size = 76;
    const a = src.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const x0 = a.left + a.width / 2 - size / 2;
    const y0 = a.top + a.height / 2 - size / 2;
    const dx = t.left + t.width / 2 - size / 2 - x0;
    const dy = t.top + t.height / 2 - size / 2 - y0;
    const fly = document.createElement('div');
    fly.className = 'fly';
    fly.style.left = x0 + 'px';
    fly.style.top = y0 + 'px';
    fly.style.setProperty('--tile', byId[card.dataset.id].c);
    fly.appendChild(src.cloneNode(true));
    document.body.appendChild(fly);
    const anim = fly.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 80}px) scale(0.75)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.7 }
    ], { duration: 800, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' });
    anim.onfinish = () => {
      fly.remove();
      target.animate([
        { transform: 'scale(1) rotate(0)' },
        { transform: 'scale(1.18) rotate(-6deg)' },
        { transform: 'scale(0.96) rotate(3deg)' },
        { transform: 'scale(1) rotate(0)' }
      ], { duration: 420, easing: 'ease-out' });
      $('#cartCount').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 360 });
    };
    anim.oncancel = () => fly.remove();
  }

  /* ---------- Delegated clicks for add / step / remove ---------- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.action;
    if (act === 'add') { flyToCart(btn.closest('.card')); setQty(id, 1); toast(`${byId[id].name} added to your Sako`); }
    else if (act === 'inc') { flyToCart(btn.closest('.card')); setQty(id, (cart[id] || 0) + 1); }
    else if (act === 'dec') setQty(id, (cart[id] || 0) - 1);
    else if (act === 'remove') setQty(id, 0);
  });

  /* ---------- Filters ---------- */
  $$('#catChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      filters.cat = chip.dataset.cat;
      $$('#catChips .chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      renderCatalog();
    });
  });
  searchInput.addEventListener('input', () => { filters.q = searchInput.value; renderCatalog(); });
  sortSelect.addEventListener('change', () => { filters.sort = sortSelect.value; renderCatalog(); });

  $('#clearFilters').addEventListener('click', () => {
    filters.cat = 'all'; filters.q = ''; filters.sort = 'featured';
    searchInput.value = ''; sortSelect.value = 'featured';
    $$('#catChips .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.cat === 'all')));
    renderCatalog();
  });

  /* ---------- Hero ticket: what is available now ---------- */
  function renderHarvestTag() {
    $('#tagDate').textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    $('#tagList').innerHTML = HERO_IDS.map(id => {
      const p = byId[id];
      return `<li><span>${p.name}</span><span class="leader" aria-hidden="true"></span><span class="qty">${p.avail}</span></li>`;
    }).join('');
    const start = new Date(today.getFullYear(), 0, 0);
    const doy = Math.floor((today - start) / 86400000);
    $('#tagFoot').textContent = `Lot ${String(doy).padStart(3, '0')} · cut before 7 am`;
  }

  /* ---------- Contact form (demo) ---------- */
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cName').value.trim().split(' ')[0] || 'there';
    $('#contactNote').textContent = `Thanks, ${name}. This demo form does not send anything yet. Connect it to your email service or backend to receive messages.`;
    e.target.reset();
  });

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const savedTheme = store.get(STORAGE_THEME);
  if (savedTheme === 'light' || savedTheme === 'dark') root.setAttribute('data-theme', savedTheme);
  $('#themeBtn').addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set(STORAGE_THEME, next);
  });

  /* ---------- Start ---------- */
  fillDeliveryDays();
  renderHarvestTag();
  renderCatalog();
  renderCart();
  setView('cart');
})();
