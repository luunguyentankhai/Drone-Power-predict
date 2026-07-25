/* ---------- trạng thái ---------- */
let routes = [
  { id: rid(), name: 'route_A', capacity: 3.5 },
  { id: rid(), name: 'route_B', capacity: 2.8 },
  { id: rid(), name: 'route_C', capacity: 4.2 },
];
let packages = [];
let pkgCounter = 0;

function rid(){ return 'r' + Math.random().toString(36).slice(2,9); }

const PALETTE = ['#4fd1c5','#f5a623','#7c9cff','#e8615a','#8de65a','#ff9ecb','#c39bff','#5ad1e6'];
const routeAssets = [
  { src: 'Assets/R1.jpeg', title: 'Route R1' },
  { src: 'Assets/R2_animation.gif', title: 'Route R2' },
  { src: 'Assets/R3_animation.gif', title: 'Route R3' },
  { src: 'Assets/R4_animation.gif', title: 'Route R4' },
  { src: 'Assets/R5_animation.gif', title: 'Route R5' },
  { src: 'Assets/R6_animation.gif', title: 'Route R6' },
  { src: 'Assets/R7_animation.gif', title: 'Route R7' },
];

/* ---------- tabs ---------- */
const tabButtons = document.querySelectorAll('.tab-btn');
const mainTab = document.getElementById('main-tab');
const routeTab = document.getElementById('route-tab');
const routeGallery = document.getElementById('route-gallery');

function switchTab(tabName){
  tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  mainTab.style.display = tabName === 'main' ? 'block' : 'none';
  routeTab.style.display = tabName === 'route' ? 'block' : 'none';
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
    if (btn.dataset.tab === 'route') renderRouteGallery();
  });
});

const imageModal = document.getElementById('image-modal');
const imageModalBackdrop = document.getElementById('image-modal-backdrop');
const imageModalClose = document.getElementById('image-modal-close');
const imageModalImg = document.getElementById('image-modal-img');
const imageModalTitle = document.getElementById('image-modal-title');

function openImageModal(src, title){
  imageModalImg.src = src;
  imageModalImg.alt = title;
  imageModalTitle.textContent = title;
  imageModal.classList.remove('hidden');
}

function closeImageModal(){
  imageModal.classList.add('hidden');
  imageModalImg.src = '';
  imageModalImg.alt = '';
}

imageModalBackdrop.addEventListener('click', closeImageModal);
imageModalClose.addEventListener('click', closeImageModal);

function renderRouteGallery(){
  routeGallery.innerHTML = routeAssets.map(asset => `
    <div class="route-card" data-src="${asset.src}" data-title="${asset.title}">
      <img src="${asset.src}" alt="${asset.title}">
      <div class="route-card-title">${asset.title}</div>
    </div>
  `).join('');

  routeGallery.querySelectorAll('.route-card').forEach(card => {
    card.addEventListener('click', () => {
      openImageModal(card.dataset.src, card.dataset.title);
    });
  });
}

/* ---------- hiển thị bảng tuyến đường ---------- */
const routeTbody = document.getElementById('route-tbody');
const pkgRouteSelect = document.getElementById('pkg-route');

function renderRoutes(){
  routeTbody.innerHTML = '';
  routes.forEach(r => {
    const tr = document.createElement('tr');
    tr.className = 'row-line';
    tr.innerHTML = `
      <td><input type="text" data-id="${r.id}" data-field="name" value="${r.name}"></td>
      <td><input type="number" min="0.1" step="0.1" data-id="${r.id}" data-field="capacity" value="${r.capacity}"></td>
      <td><button class="icon-btn" data-del="${r.id}" title="Xóa route">✕</button></td>
    `;
    routeTbody.appendChild(tr);
  });

  routeTbody.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', e => {
      const r = routes.find(x => x.id === e.target.dataset.id);
      if (!r) return;
      if (e.target.dataset.field === 'name') r.name = e.target.value || r.name;
      else r.capacity = parseFloat(e.target.value) || r.capacity;
      renderPkgRouteOptions();
      renderPkgList();
      hideResults();
    });
  });
  routeTbody.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.del;
      routes = routes.filter(r => r.id !== id);
      packages = packages.filter(p => p.routeId !== id);
      renderRoutes(); renderPkgRouteOptions(); renderPkgList();
      hideResults();
    });
  });
}

function renderPkgRouteOptions(){
  const prev = pkgRouteSelect.value;
  pkgRouteSelect.innerHTML = routes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  if (routes.some(r => r.id === prev)) pkgRouteSelect.value = prev;
}

document.getElementById('add-route-btn').addEventListener('click', () => {
  routes.push({ id: rid(), name: 'route_' + (routes.length + 1), capacity: 3.0 });
  renderRoutes(); renderPkgRouteOptions();
});

/* ---------- danh sách đơn hàng ---------- */
const pkgListEl = document.getElementById('pkg-list');
const pkgCountHint = document.getElementById('pkg-count-hint');
const runBtn = document.getElementById('run-btn');

function renderPkgList(){
  if (packages.length === 0){
    pkgListEl.innerHTML = '<span class="empty-note">No orders yet — add at least one order to run the simulation.</span>';
  } else {
    pkgListEl.innerHTML = packages.map(p => {
      const r = routes.find(r => r.id === p.routeId);
      const routeName = r ? r.name : '(route đã xóa)';
      return `<span class="pkg-chip">
        <span class="route-tag">${routeName}</span> · <span class="kg">${p.kg}kg</span>
        <button class="icon-btn" style="width:18px;height:18px;font-size:10px" data-delpkg="${p.id}">✕</button>
      </span>`;
    }).join('');
    pkgListEl.querySelectorAll('[data-delpkg]').forEach(btn => {
      btn.addEventListener('click', e => {
        packages = packages.filter(p => p.id !== e.target.dataset.delpkg);
        renderPkgList();
        hideResults();
      });
    });
  }
  const validPkgs = packages.filter(p => routes.some(r => r.id === p.routeId));
  pkgCountHint.textContent = `${validPkgs.length} orders waiting to be allocated`;
  runBtn.disabled = validPkgs.length === 0;
}

document.getElementById('add-pkg-btn').addEventListener('click', () => {
  const routeId = pkgRouteSelect.value;
  const kgInput = document.getElementById('pkg-kg');
  const kg = parseFloat(kgInput.value);
  if (!routeId || !kg || kg <= 0) return;
  pkgCounter++;
  packages.push({ id: 'p' + pkgCounter, label: 'ORD' + String(pkgCounter).padStart(3,'0'), routeId, kg: Math.round(kg*10)/10 });
  kgInput.value = '';
  renderPkgList();
  hideResults();
});

/* ---------- thuật toán đóng gói: Best-Fit Decreasing ---------- */
function binPackRoute(routeName, capacityKg, pkgs){
  const sorted = [...pkgs].sort((a,b) => b.kg - a.kg);
  const bins = [];
  const unassigned = [];
  let droneCounter = 0;

  function openBin(){
    droneCounter++;
    const bin = { droneTag: 'Drone ' + droneCounter, capacity: capacityKg, remaining: capacityKg, items: [] };
    bins.push(bin);
    return bin;
  }

  for (const pkg of sorted){
    if (pkg.kg > capacityKg + 1e-9){ unassigned.push(pkg); continue; }
    const candidates = bins.filter(b => b.remaining + 1e-9 >= pkg.kg);
    let target;
    if (candidates.length){
      target = candidates.reduce((a,b) => a.remaining < b.remaining ? a : b);
    } else {
      target = openBin();
    }
    target.remaining -= pkg.kg;
    target.items.push(pkg);
  }
  return { bins, unassigned };
}

/* ---------- hiển thị kết quả mô phỏng ---------- */
const routesContainer = document.getElementById('routes-container');
const simOutput = document.getElementById('sim-output');

function hideResults(){ simOutput.style.display = 'none'; }

function runSimulation(){
  const validPkgs = packages.filter(p => routes.some(r => r.id === p.routeId));
  if (validPkgs.length === 0) return;

  routesContainer.innerHTML = '';
  simOutput.style.display = 'block';

  const byRoute = {};
  validPkgs.forEach(p => { (byRoute[p.routeId] = byRoute[p.routeId] || []).push(p); });

  let delay = 0;
  Object.keys(byRoute).forEach(routeId => {
    const route = routes.find(r => r.id === routeId);
    const { bins, unassigned } = binPackRoute(route.name, route.capacity, byRoute[routeId]);

    const block = document.createElement('div');
    block.className = 'route-block';
    block.innerHTML = `<div class="route-title">${route.name} · max payload ${route.capacity}kg / drone</div>`;
    routesContainer.appendChild(block);

    bins.forEach(bin => {
      const row = document.createElement('div');
      row.className = 'drone-row';
      row.style.animationDelay = delay + 'ms';
      delay += 140;

      const usedKg = bin.capacity - bin.remaining;
      const pct = Math.round((usedKg / bin.capacity) * 100);
      const utilClass = pct >= 85 ? 'util-ok' : 'util-warn';

      row.innerHTML = `
        <div class="drone-tag">${bin.droneTag}</div>
        <div class="bay"><div class="bay-fill"></div></div>
        <div class="util-label ${utilClass}">${usedKg.toFixed(1)}/${bin.capacity}kg · ${pct}%</div>
      `;
      block.appendChild(row);

      const fillEl = row.querySelector('.bay-fill');
      bin.items.forEach((item, i) => {
        const seg = document.createElement('div');
        seg.className = 'pkg-block';
        const widthPct = (item.kg / bin.capacity) * 100;
        seg.style.background = PALETTE[i % PALETTE.length];
        seg.textContent = item.kg + 'kg';
        fillEl.appendChild(seg);
        setTimeout(() => { seg.style.width = widthPct + '%'; }, delay + i * 90);
      });
    });

    if (unassigned.length){
      const box = document.createElement('div');
      box.className = 'unassigned-box';
      box.style.opacity = 0;
      box.style.transition = 'opacity .4s';
      box.textContent = `⚠ ${unassigned.length} orders cannot fit any drone on ${route.name} (over ${route.capacity}kg/drone): ` +
        unassigned.map(p => p.label + '(' + p.kg + 'kg)').join(', ');
      block.appendChild(box);
      setTimeout(() => { box.style.opacity = 1; }, delay + 200);
      delay += 200;
    }

    const totalDrones = bins.length;
    const note = document.createElement('div');
    note.className = 'summary-note';
    note.textContent = `→ using ${totalDrones} drones for ${byRoute[routeId].length} orders on this route.`;
    block.appendChild(note);

    delay += 200;
  });

  simOutput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

runBtn.addEventListener('click', runSimulation);

/* ---------- khởi tạo ---------- */
renderRoutes();
renderPkgRouteOptions();
renderPkgList();