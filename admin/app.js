/* BuyClub.us System — Frontend Operacional, Administrativo e de Vendas */

// Biblioteca de Ícones SVG Profissionais
const icons = {
  brand: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  summary: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1 0 7.75"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  orders: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  archive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  catalog: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  products: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 12.5V21h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="6.5"/></svg>`,
  reports: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  map: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 15 22 22 18 22 2 15 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="15" y1="6" x2="15" y2="22"/></svg>`,
  profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  emergency: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  logout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  refresh: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  dollar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  truck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  xCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  flash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
  clipboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  pdf: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
};

const supervisors = [
  { user: 'CW', password: 'cwhacker2026@', name: 'Charles', initials: 'CH', role: 'SUPERVISOR' },
  { user: 'KMR', password: 'kmradm2026@', name: 'KMR', initials: 'KM', role: 'SUPERVISOR' },
  { user: 'FR', password: 'fradm2026@', name: 'Fernando', initials: 'FE', role: 'SUPERVISOR' }
];

const catalog = [
  ['Retatrutide 60mg', 'New Life'], ['Tirzepatide 120mg', 'NEW'], ['Tirzepatide 60mg', 'New Life'],
  ['GHK-Cu 100mg', 'New Life'], ['GLOW 70mg', 'New Life'], ['KLOW 80mg', 'New Life'],
  ['AOD-9604 5mg', 'New Life'], ['NAD+ 500mg', 'New Life'], ['CJC-1295 + Ipamorelin 10mg', 'New Life'],
  ['Tesamorelin 20mg', 'New Life'], ['MOTS-c 40mg', 'New Life'], ['Semax 10mg', 'New Life'],
  ['Selank 10mg', 'New Life'], ['Epithalon 50mg', 'New Life'], ['SS-31 50mg', 'New Life'],
  ['CBL-514 20mg', 'New Life'], ['Retatrutide 40mg', 'Usa Peptides'], ['Tirzepatide 120mg', 'Usa Peptides'],
  ['Tirzepatide 60mg', 'Usa Peptides'], ['Tirzepatide 30mg', 'Usa Peptides'], ['Beauty Stack', 'Usa Peptides'],
  ['GHK-Cu 100mg', 'Usa Peptides'], ['GLOW Stack', 'Usa Peptides'], ['KLOW Stack', 'Usa Peptides'],
  ['SLU-PP-332 10mg', 'Usa Peptides'], ['AOD-9604 10mg', 'Usa Peptides'], ['PT-141 10mg', 'Usa Peptides'],
  ['NAD+ 500mg', 'Usa Peptides'], ['HGH-FRAG 10mg', 'Usa Peptides'], ['BPC-157 10mg + TB-500 10mg', 'Usa Peptides'],
  ['CJC-1295 + Ipamorelin', 'Usa Peptides'], ['Tesamorelin 10mg', 'Usa Peptides'], ['MOTS-c 10mg', 'Usa Peptides'],
  ['Semax 10mg', 'Usa Peptides'], ['Epithalon 10mg', 'Usa Peptides'], ['SS-31 10mg', 'Usa Peptides'],
  ['MT2 10mg', 'Usa Peptides'], ['Trestolone Enanthate ZPHC — 50 mg/ml (10 ampoules)', 'ZPHC'],
  ['HGH FRAGMENT 176-191aa (50MG) ZPHC', 'ZPHC'], ['CYT-3 ZPHC — 6 mg “triple-cut” (100 tablets × 6 mg)', 'ZPHC'],
  ['SLU-PP-332 100mg', 'ZPHC'], ['ZPtrop 80 — Somatropina 16 UI/VIAL', 'ZPHC'],
  ['Retatrutida ZPHC 60mg', 'ZPHC'], ['Tirzepatida TG 15mg — 4 ampola', 'TG']
];

// Lista de Estados do Brasil
const brazilStatesList = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const paraguay = {
  ASU: ['Asunción'], ALTO_PARANA: ['Ciudad del Este', 'Presidente Franco', 'Hernandarias'],
  CENTRAL: ['San Lorenzo', 'Luque', 'Capiatá', 'Lambaré', 'Fernando de la Mora', 'Mariano Roque Alonso'],
  ITAPUA: ['Encarnación', 'Hohenau'], CAAGUAZU: ['Coronel Oviedo', 'Caaguazú'], GUAIRA: ['Villarrica'],
  AMAMBAY: ['Pedro Juan Caballero'], CONCEPCION: ['Concepción'], BOQUERON: ['Filadelfia'],
  CANINDEYU: ['Salto del Guairá'], MISIONES: ['San Juan Bautista'], PARAGUARI: ['Paraguarí'],
  CORDILLERA: ['Caacupé'], ÑEEMBUCU: ['Pilar'], PRESIDENTE_HAYES: ['Villa Hayes'],
  SAN_PEDRO: ['San Pedro de Ycuamandiyú'], ALTO_PARAGUAY: ['Fuerte Olimpo']
};

const countryNames = { BR: 'Brasil', PY: 'Paraguai' };
const generalAdmin = { user: 'adm', password: 'acessdenied', name: 'Administrador geral', initials: 'AD', role: 'ADMIN' };

// Cache para evitar requisições repetidas à API do IBGE
const ibgeCitiesCache = {};

let currentUser = null;
let activeTab = 'summary';
let sellerActiveTab = 'sales';
let drawerOpen = false;
let map = null;

/* Funções Utilitárias */
const read = (k, d = []) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const money = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

function storedSupervisors() { return read('atlasSupervisorAccounts'); }
function allSupervisors() {
  const overrides = read('atlasSupervisorProfiles');
  return [...supervisors, ...storedSupervisors()].map(x => ({ ...x, ...(overrides.find(o => o.user.toLowerCase() === x.user.toLowerCase()) || {}) }));
}
function sellers() { return read('atlasSellers').filter(s => s.supervisor.toLowerCase() === currentUser?.user.toLowerCase()); }
function allSellers() { return read('atlasSellers'); }
function products() { return read('atlasProducts'); }
function sales() { return read('atlasSales'); }
function orders() { return read('atlasOrders'); }
function systemCatalog() { return [...catalog, ...read('atlasCustomCatalog').map(x => [x.name, x.brand])]; }
function customCatalog() { return read('atlasCustomCatalog'); }

function dayStart(days = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

function periodSales(sid, period) {
  const now = new Date();
  const start = period === 'day' ? dayStart() : period === '7days' ? dayStart(6) : period === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.getFullYear(), 0, 1);
  return sales().filter(x => (!sid || x.sellerId === sid) && new Date(x.createdAt) >= start);
}

function sellerRevenue(id, period = 'day') { return periodSales(id, period).reduce((a, x) => a + x.total, 0); }

function supervisorRevenue(supUser, period = 'day') {
  const supSellers = allSellers().filter(s => s.supervisor.toLowerCase() === supUser.toLowerCase());
  const sellerIds = supSellers.map(s => s.id);
  return periodSales(null, period).filter(x => sellerIds.includes(x.sellerId)).reduce((a, x) => a + x.total, 0);
}

function stock(sid) { return products().filter(p => p.sellerId === sid).reduce((a, p) => a + Number(p.stock || 0), 0); }
function phoneLink(v) { const d = String(v || '').replace(/\D/g, ''); return d ? `https://wa.me/${d.startsWith('55') ? d : '55' + d}` : '#'; }
function avatarFor(u) { return u?.initials || String(u?.name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'US'; }

function locationLabel(country) { return country === 'PY' ? 'Departamento' : 'Estado/UF'; }

// Carregamento de Cidades Oficiais (API do IBGE para o Brasil)
async function fetchCitiesForRegion(country, uf, citySelect, targetCity = '') {
  citySelect.innerHTML = '<option value="">Carregando lista de cidades...</option>';
  citySelect.disabled = true;

  if (!uf) {
    citySelect.innerHTML = '<option value="">Selecione o estado primeiro</option>';
    citySelect.disabled = false;
    return;
  }

  if (country === 'BR') {
    try {
      if (!ibgeCitiesCache[uf]) {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?ordenacao=nome`);
        const data = await res.json();
        ibgeCitiesCache[uf] = data.map(m => m.nome);
      }
      const cities = ibgeCitiesCache[uf];
      citySelect.innerHTML = `<option value="">Selecione a cidade (${cities.length} disponíveis)</option>` +
        cities.map(c => `<option value="${esc(c)}" ${targetCity === c ? 'selected' : ''}>${esc(c)}</option>`).join('');
    } catch (e) {
      citySelect.innerHTML = '<option value="">Erro ao carregar cidades via IBGE</option>';
    }
  } else if (country === 'PY') {
    const list = paraguay[uf] || [];
    citySelect.innerHTML = `<option value="">Selecione a cidade</option>` +
      list.map(x => `<option value="${esc(x)}" ${targetCity === x ? 'selected' : ''}>${esc(x)}</option>`).join('');
  }
  citySelect.disabled = false;
}

async function geocodePublic(city, region, country) {
  try {
    const q = encodeURIComponent(`${city}, ${region}, ${country === 'PY' ? 'Paraguay' : 'Brazil'}`);
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=pt-BR&q=${q}`, { headers: { 'Accept': 'application/json' } });
    const d = await r.json();
    return d[0] ? { lat: Number(d[0].lat), lng: Number(d[0].lon) } : null;
  } catch (e) {
    return null;
  }
}

/* Modal de Confirmação Prévia com Aviso */
function confirmActionModal({ title, subtitle, warningText, confirmText = 'Confirmar e Salvar', cancelText = 'Cancelar', onConfirm }) {
  const m = modal(`
    <div class="confirm-dialog-wrap">
      <div class="confirm-icon">${icons.flash}</div>
      <h2>${esc(title)}</h2>
      ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
      <div class="confirm-warning-box">
        <strong>⚠️ Atenção antes de salvar:</strong>
        <span>${esc(warningText || 'Confirme se todas as informações inseridas estão corretas. Esta alteração será aplicada imediatamente no sistema.')}</span>
      </div>
      <div class="confirm-dialog-actions flex justify-end gap-3 mt-6">
        <button type="button" class="outline-btn cancel-dialog">${esc(cancelText)}</button>
        <button type="button" class="primary-btn confirm-dialog">${icons.check} ${esc(confirmText)}</button>
      </div>
    </div>
  `);

  m.querySelector('.cancel-dialog').onclick = () => m.remove();
  m.querySelector('.confirm-dialog').onclick = () => {
    m.remove();
    if (typeof onConfirm === 'function') onConfirm();
  };
}

/* Gerador Universal de Relatórios em PDF */
function exportUniversalPDF({ title, subtitle, headers = [], rows = [], fileName = 'relatorio.pdf' }) {
  if (!window.jspdf) {
    alert('Biblioteca PDF ainda está sendo carregada. Tente novamente em alguns segundos.');
    return;
  }

  const doc = new window.jspdf.jsPDF('p', 'mm', 'a4');
  const nowStr = new Date().toLocaleString('pt-BR');

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BUYCLUB.US SYSTEM', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${title.toUpperCase()} — Relatório Oficial`, 14, 19);
  doc.text(`Gerado em: ${nowStr}`, 130, 19);

  let startY = 36;
  if (subtitle) {
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.text(subtitle, 14, startY);
    startY += 8;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(241, 245, 249);
  doc.rect(14, startY, 182, 7, 'F');
  doc.setTextColor(15, 23, 42);

  const colWidth = 182 / (headers.length || 1);
  headers.forEach((h, i) => {
    doc.text(String(h), 16 + (i * colWidth), startY + 5);
  });

  startY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  rows.forEach((r, rowIdx) => {
    if (startY > 275) {
      doc.addPage();
      startY = 20;
    }
    if (rowIdx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY - 4, 182, 7, 'F');
    }
    r.forEach((cell, i) => {
      const cellText = String(cell || '—').replace(/<[^>]*>?/gm, '');
      doc.text(cellText.length > 32 ? cellText.substring(0, 30) + '...' : cellText, 16 + (i * colWidth), startY);
    });
    startY += 7;
  });

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`BuyClub.us System © 2026 — Documento gerado por ${currentUser?.name || 'Sistema'}`, 14, 288);

  doc.save(fileName);
  showToast('Relatório PDF gerado com sucesso!');
}

/* Sessão e Navegação */
function login(user) {
  currentUser = user;
  document.getElementById('loginScreen').style.display = 'none';
  if (user.role === 'ADMIN') { activeTab = 'adminHome'; renderAdmin(); }
  else if (user.role === 'SUPERVISOR') { activeTab = 'summary'; renderSupervisor(); }
  else { sellerActiveTab = 'sales'; renderSeller(); }
}

function logout() {
  currentUser = null;
  location.reload();
}

function appFooter() {
  return `
    <footer class="app-footer">
      <div class="footer-container">
        <div><b>BuyClub.us System</b> &copy; 2026 — Plataforma Operacional de Gestão</div>
        <div class="footer-links">
          <span>Ambiente Seguro</span> · <span>Suporte Operacional</span>
        </div>
      </div>
    </footer>
  `;
}

function navContent() {
  const admin = currentUser.role === 'ADMIN';
  return `
    <div class="app-brand">
      <div class="brand-mark">${icons.brand}</div>
      <div><b>buyclub<span>.us</span></b><small>system</small></div>
    </div>
    <div class="side-label">${admin ? 'ADMINISTRAÇÃO GERAL' : 'NAVEGAÇÃO OPERACIONAL'}</div>
    ${admin ? `
      <button class="side-link ${activeTab === 'adminHome' ? 'active' : ''}" data-admin-tab="adminHome">${icons.summary} <span>Visão Consolidada</span></button>
      <button class="side-link ${activeTab === 'adminUsers' ? 'active' : ''}" data-admin-tab="adminUsers">${icons.users} <span>Usuários e Acessos</span></button>
      <button class="side-link ${activeTab === 'sellers' ? 'active' : ''}" data-admin-tab="sellers">${icons.users} <span>Meus Vendedores</span></button>
      <button class="side-link ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">${icons.orders} <span>Pedidos em Reposição</span></button>
      <button class="side-link ${activeTab === 'catalog' ? 'active' : ''}" data-admin-tab="catalog">${icons.catalog} <span>Catálogo do Sistema</span></button>
      <button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products">${icons.products} <span>Atribuir Produtos</span></button>
      <button class="side-link ${activeTab === 'adminReports' ? 'active' : ''}" data-admin-tab="adminReports">${icons.reports} <span>Relatórios Globais</span></button>
      <button class="side-link ${activeTab === 'profile' ? 'active' : ''}" data-admin-tab="profile">${icons.profile} <span>Meus Dados</span></button>
    ` : `
      <button class="side-link ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">${icons.summary} <span>Resumo da Equipe</span></button>
      <button class="side-link ${activeTab === 'sellers' ? 'active' : ''}" data-tab="sellers">${icons.users} <span>Vendedores</span></button>
      <button class="side-link ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">${icons.orders} <span>Pedidos em Reposição</span></button>
      <button class="side-link ${activeTab === 'archived' ? 'active' : ''}" data-tab="archived">${icons.archive} <span>Arquivados / Histórico</span></button>
      <button class="side-link ${activeTab === 'catalog' ? 'active' : ''}" data-tab="catalog">${icons.catalog} <span>Catálogo do Sistema</span></button>
      <button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-tab="products">${icons.products} <span>Atribuir Produtos</span></button>
      <button class="side-link ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">${icons.reports} <span>Relatórios</span></button>
      <button class="side-link ${activeTab === 'map' ? 'active' : ''}" data-tab="map">${icons.map} <span>Mapa</span></button>
      <button class="side-link ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile">${icons.profile} <span>Meus Dados</span></button>
    `}
    <div class="side-danger">
      <button id="emergencyBtn">${icons.emergency} <span>Botão de Emergência</span></button>
      <small>Exclusão permanente de dados</small>
    </div>
    <div class="side-account">
      <div class="avatar small">${avatarFor(currentUser)}</div>
      <div class="min-w-0 flex-1">
        <b>${esc(currentUser.name)}</b>
        <small>${admin ? 'Administrador geral' : 'Supervisor'}</small>
      </div>
      <button id="logoutSide" title="Sair do sistema">${icons.logout}</button>
    </div>
  `;
}

function sellerNavContent() {
  return `
    <div class="app-brand">
      <div class="brand-mark">${icons.brand}</div>
      <div><b>buyclub<span>.us</span></b><small>vendedor</small></div>
    </div>
    <div class="side-label">MENU DO VENDEDOR</div>
    <button class="side-link ${sellerActiveTab === 'sales' ? 'active' : ''}" data-seller-tab="sales">
      ${icons.chart} <span>Registrar Baixas / Vendas</span>
    </button>
    <button class="side-link ${sellerActiveTab === 'newOrder' ? 'active' : ''}" data-seller-tab="newOrder">
      ${icons.orders} <span>Pedido de Reposição</span>
    </button>
    <button class="side-link ${sellerActiveTab === 'myOrders' ? 'active' : ''}" data-seller-tab="myOrders">
      ${icons.clipboard} <span>Acompanhar Meus Pedidos</span>
    </button>
    <button class="side-link ${sellerActiveTab === 'archived' ? 'active' : ''}" data-seller-tab="archived">
      ${icons.archive} <span>Arquivados / Histórico</span>
    </button>
    <div class="side-account mt-auto">
      <div class="avatar small">${avatarFor(currentUser)}</div>
      <div class="min-w-0 flex-1">
        <b>${esc(currentUser.name)}</b>
        <small>@${esc(currentUser.user)}</small>
      </div>
      <button class="logoutSellerSideBtn" title="Sair do sistema">${icons.logout}</button>
    </div>
  `;
}

function appFrame(title, sub, body) {
  const container = document.querySelector('.app-layout') || document.querySelector('main');
  container.innerHTML = `
    <div class="app-layout w-full min-h-screen flex">
      <aside class="app-sidebar desktop-only">${navContent()}</aside>
      <div id="appDrawerOverlay" class="drawer-overlay ${drawerOpen ? 'open' : ''}"></div>
      <aside id="appDrawer" class="app-sidebar drawer-sidebar ${drawerOpen ? 'open' : ''}">
        <div class="flex justify-end p-2 sm:hidden">
          <button id="closeDrawer" class="close-btn" style="position:static;">×</button>
        </div>
        ${navContent()}
      </aside>

      <section class="app-content flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <header class="app-header glass-panel flex justify-between items-center">
            <div class="flex items-center gap-3">
              <button id="hamburgerBtn" class="hamburger-btn" title="Abrir Menu">${icons.menu}</button>
              <div>
                <div class="eyebrow">BUYCLUB.US SYSTEM · ${new Date().toLocaleDateString('pt-BR')}</div>
                <h1>${title}</h1>
                <p>${sub}</p>
              </div>
            </div>
            <div class="header-actions">
              <button id="refreshPage" class="outline-btn" title="Atualizar Dados">${icons.refresh} <span class="hidden-mobile">Atualizar</span></button>
              <div class="avatar">${avatarFor(currentUser)}</div>
            </div>
          </header>
          <div class="page-body">${body}</div>
        </div>
        ${appFooter()}
      </section>
    </div>
  `;

  const drawer = document.getElementById('appDrawer');
  const overlay = document.getElementById('appDrawerOverlay');
  const toggleBtn = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('closeDrawer');

  const openDrawer = () => { drawerOpen = true; drawer?.classList.add('open'); overlay?.classList.add('open'); };
  const closeDrawer = () => { drawerOpen = false; drawer?.classList.remove('open'); overlay?.classList.remove('open'); };

  if (toggleBtn) toggleBtn.onclick = () => drawerOpen ? closeDrawer() : openDrawer();
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (overlay) overlay.onclick = closeDrawer;

  document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
    activeTab = b.dataset.tab;
    closeDrawer();
    currentUser.role === 'SUPERVISOR' ? renderSupervisor() : renderAdmin();
  });

  document.querySelectorAll('[data-admin-tab]').forEach(b => b.onclick = () => {
    activeTab = b.dataset.adminTab;
    closeDrawer();
    renderAdmin();
  });
  
  const logoutBtn = document.getElementById('logoutSide');
  if (logoutBtn) logoutBtn.onclick = logout;
  
  const refreshBtn = document.getElementById('refreshPage');
  if (refreshBtn) refreshBtn.onclick = () => {
    currentUser.role === 'SUPERVISOR' ? renderSupervisor() : renderAdmin();
    showToast('Dados atualizados com sucesso');
  };
}

function modal(content) {
  const m = document.createElement('div');
  m.className = 'modal open';
  m.innerHTML = `<div class="modal-card glass-panel"><button class="close-btn" type="button">×</button>${content}</div>`;
  document.body.appendChild(m);
  
  const close = () => m.remove();
  m.querySelector('.close-btn').onclick = close;
  m.onclick = e => { if (e.target === m) close(); };
  return m;
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const t = document.createElement('div');
  t.className = 'toast glass-panel show';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

/* Telas do Supervisor */
function renderSupervisor() {
  if (activeTab === 'profile') return renderProfile();
  if (activeTab === 'sellers') return renderSellersPage();
  if (activeTab === 'orders') return renderSupervisorOrdersPage();
  if (activeTab === 'archived') return renderArchivedPage();
  if (activeTab === 'catalog') return renderCatalogPage();
  if (activeTab === 'products') return renderProductsPage();
  if (activeTab === 'reports') return renderReportsPage();
  if (activeTab === 'map') return renderMapPage();
  renderSummary();
}

function renderAdmin() {
  if (activeTab === 'profile') return renderProfile();
  if (activeTab === 'adminUsers') return renderAdminUsers();
  if (activeTab === 'sellers') return renderSellersPage();
  if (activeTab === 'orders') return renderSupervisorOrdersPage();
  if (activeTab === 'catalog') return renderCatalogPage();
  if (activeTab === 'products') return renderProductsPage();
  if (activeTab === 'adminReports') return renderAdminReportsPage();
  renderAdminHome();
}

/* RESUMO DA EQUIPE */
function renderSummary() {
  const ss = sellers();
  const rows = ss.map(s => ({ s, xs: periodSales(s.id, 'day') }));
  const rev = rows.reduce((a, r) => a + r.xs.reduce((x, v) => x + v.total, 0), 0);
  const qty = rows.reduce((a, r) => a + r.xs.reduce((x, v) => x + v.quantity, 0), 0);
  const totalStockValue = products().filter(p => ss.some(s => s.id === p.sellerId)).reduce((a, p) => a + (p.price * p.stock), 0);

  appFrame('Resumo da Equipe', 'Visão financeira e operacional dos vendedores vinculados a você.', `
    <div class="page-toolbar flex justify-between items-center mb-4">
      <div><b>Painel Consolidado</b></div>
      <button id="pdfSummary" class="outline-btn">${icons.pdf} Gerar PDF Resumo</button>
    </div>

    <div class="stats-grid">
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Faturamento Hoje</span><span class="metric-icon cyan">${icons.dollar}</span></div>
        <div class="metric-value">${money(rev)}</div>
        <div class="trend neutral">Registros do dia</div>
      </div>
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Últimos 7 dias</span><span class="metric-icon purple">${icons.chart}</span></div>
        <div class="metric-value">${money(ss.reduce((a, s) => a + sellerRevenue(s.id, '7days'), 0))}</div>
        <div class="trend neutral">Acumulado da equipe</div>
      </div>
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Itens Vendidos</span><span class="metric-icon green">${icons.check}</span></div>
        <div class="metric-value">${qty}</div>
        <div class="trend neutral">Baixas realizadas</div>
      </div>
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Valor em Estoque</span><span class="metric-icon orange">${icons.products}</span></div>
        <div class="metric-value">${money(totalStockValue)}</div>
        <div class="trend neutral">${ss.reduce((a, s) => a + stock(s.id), 0)} un. em campo</div>
      </div>
    </div>

    <div class="analytics-grid">
      <div class="panel glass-panel chart-panel">
        <div class="panel-head">
          <div><h2>Performance Financeira</h2><p>Faturamento diário acumulado nos últimos 7 dias</p></div>
          <span class="chart-live">AO VIVO</span>
        </div>
        <div class="chart-wrap"><canvas id="supervisorChart"></canvas></div>
      </div>

      <div class="panel glass-panel">
        <div class="panel-head">
          <div><h2>Ranking da Equipe</h2><p>Vendedores por faturamento hoje</p></div>
        </div>
        <div class="ranking-list">
          ${rows.sort((a, b) => b.xs.reduce((x, v) => x + v.total, 0) - a.xs.reduce((x, v) => x + v.total, 0)).map((r, i) => `
            <div class="rank-row">
              <span class="rank-number">0${i + 1}</span>
              <span>
                <b>${esc(r.s.name)}</b>
                <small>${r.xs.reduce((x, v) => x + v.quantity, 0)} itens · ${esc(r.s.city)}/${esc(r.s.uf)}</small>
              </span>
              <strong>${money(r.xs.reduce((x, v) => x + v.total, 0))}</strong>
            </div>
          `).join('') || '<div class="empty-state compact-empty"><strong>Sem vendas hoje</strong></div>'}
        </div>
      </div>
    </div>
  `);

  document.getElementById('pdfSummary').onclick = () => {
    exportUniversalPDF({
      title: 'Resumo da Equipe',
      subtitle: `Supervisor: ${currentUser.name} | Total em Estoque: ${money(totalStockValue)}`,
      headers: ['Vendedor', 'Cidade/UF', 'Itens Hoje', 'Faturamento Hoje', 'Estoque Total'],
      rows: ss.map(s => [
        s.name,
        `${s.city}/${s.uf}`,
        `${periodSales(s.id, 'day').reduce((a, x) => a + x.quantity, 0)} un.`,
        money(sellerRevenue(s.id, 'day')),
        `${stock(s.id)} un.`
      ]),
      fileName: 'buyclub-resumo-equipe.pdf'
    });
  };

  if (window.Chart) {
    const labels = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    });
    new Chart(document.getElementById('supervisorChart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Faturamento',
          data: labels.map((_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - 6 + i);
            return sales().filter(x => ss.some(s => s.id === x.sellerId) && new Date(x.createdAt).toDateString() === d.toDateString()).reduce((a, x) => a + x.total, 0);
          }),
          borderColor: '#0284c7',
          backgroundColor: 'rgba(2, 132, 199, 0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#0284c7'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => money(c.raw) } } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(15,23,42,0.06)' }, ticks: { color: '#64748b', callback: v => money(v) } },
          x: { grid: { display: false }, ticks: { color: '#64748b' } }
        }
      }
    });
  }
}

/* ABA DE VENDEDORES */
function renderSellersPage() {
  const ss = sellers();
  const allProds = products();
  const totalTeamStockQty = ss.reduce((a, s) => a + stock(s.id), 0);
  const totalTeamStockVal = ss.reduce((a, s) => a + allProds.filter(p => p.sellerId === s.id && p.stock > 0).reduce((x, p) => x + (p.price * p.stock), 0), 0);

  appFrame('Vendedores', 'Gerencie seus vendedores com a quantidade exata de produtos e o valor total em reais sob posse de cada um.', `
    <div class="stats-grid mb-6">
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Total de Vendedores</span><span class="metric-icon cyan">${icons.users}</span></div>
        <div class="metric-value">${ss.length}</div>
        <div class="trend neutral">Equipe sob supervisão</div>
      </div>
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Quantidade em Campo</span><span class="metric-icon orange">${icons.products}</span></div>
        <div class="metric-value" style="color: var(--accent-orange);">${totalTeamStockQty} <small style="font-size: 14px; color: var(--text-secondary);">unidades</small></div>
        <div class="trend neutral">Total de itens ativos com vendedores</div>
      </div>
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Patrimônio em Posse (R$)</span><span class="metric-icon green">${icons.dollar}</span></div>
        <div class="metric-value" style="color: var(--accent-green);">${money(totalTeamStockVal)}</div>
        <div class="trend neutral">Valor total em mercadorias ativas</div>
      </div>
    </div>

    <div class="page-toolbar flex justify-between items-center mb-4 gap-3 flex-wrap">
      <div><b>Listagem da Equipe de Vendas</b></div>
      <div class="flex gap-2">
        <button id="pdfSellersBtn" class="outline-btn">${icons.pdf} Exportar PDF Vendedores</button>
        <button id="newSeller" class="primary-btn">+ Cadastrar Vendedor</button>
      </div>
    </div>

    <div class="panel glass-panel">
      ${ss.length ? `
        <div class="data-table">
          <div class="table-head seller-head">
            <span>Vendedor & Login</span>
            <span>Localização / WhatsApp</span>
            <span>Estoque em Posse (Qtd)</span>
            <span>Valor em Posse (R$)</span>
            <span>Faturamento Hoje</span>
            <span>Ações de Gestão</span>
          </div>
          ${ss.map(s => {
            const sActiveProds = allProds.filter(p => p.sellerId === s.id && p.stock > 0);
            const stockVal = sActiveProds.reduce((a, p) => a + (p.price * p.stock), 0);
            const stockQty = sActiveProds.reduce((a, p) => a + p.stock, 0);
            const todayRev = periodSales(s.id, 'day').reduce((a, x) => a + x.total, 0);
            return `
              <div class="table-row seller-row">
                <span data-label="Vendedor">
                  <b>${esc(s.name)}</b>
                  <small>@${esc(s.user)}</small>
                </span>
                <span data-label="Localização / Contato">
                  <b>${esc(s.city)} / ${esc(s.uf)}</b>
                  <small>${s.whatsapp ? `<a class="whatsapp-link" target="_blank" href="${phoneLink(s.whatsapp)}">WhatsApp: ${esc(s.whatsapp)}</a>` : 'Sem WhatsApp'}</small>
                </span>
                <span data-label="Estoque (Qtd)">
                  <strong class="text-slate-800 font-extrabold text-sm">${stockQty} unidades</strong>
                  <small>${sActiveProds.length} produto(s) ativos</small>
                </span>
                <span data-label="Valor (R$)">
                  <strong class="highlight-val text-sm">${money(stockVal)}</strong>
                  <small style="color: var(--text-muted);">Total disponível</small>
                </span>
                <span data-label="Faturamento Hoje">
                  <b style="color: var(--accent-cyan);">${money(todayRev)}</b>
                </span>
                <span data-label="Ações" class="actions">
                  <button class="small-btn view-seller-prods" data-id="${s.id}">Ver Produtos (${sActiveProds.length})</button>
                  <button class="small-btn edit-seller" data-id="${s.id}">Editar</button>
                  <button class="delete-btn del-seller" data-id="${s.id}">Excluir</button>
                </span>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="empty-state"><strong>Nenhum vendedor cadastrado</strong><span>Clique no botão acima para adicionar membros à sua equipe.</span></div>'}
    </div>
  `);

  document.getElementById('newSeller').onclick = () => sellerModal();
  document.querySelectorAll('.edit-seller').forEach(b => b.onclick = () => sellerModal(ss.find(x => x.id === b.dataset.id)));
  document.querySelectorAll('.del-seller').forEach(b => b.onclick = () => deleteSeller(b.dataset.id));
  document.querySelectorAll('.view-seller-prods').forEach(b => b.onclick = () => viewSellerProductsModal(b.dataset.id));

  document.getElementById('pdfSellersBtn').onclick = () => {
    exportUniversalPDF({
      title: 'Relatório de Vendedores e Estoque em Campo',
      subtitle: `Supervisor: ${currentUser.name} | Total em Mercadorias: ${money(totalTeamStockVal)}`,
      headers: ['Vendedor', 'Localização', 'Produtos Ativos', 'Quantidade (un)', 'Valor Estoque (R$)', 'Vendas Hoje'],
      rows: ss.map(s => {
        const sProds = allProds.filter(p => p.sellerId === s.id && p.stock > 0);
        return [
          s.name,
          `${s.city}/${s.uf}`,
          `${sProds.length} tipos`,
          `${sProds.reduce((a, p) => a + p.stock, 0)} un.`,
          money(sProds.reduce((a, p) => a + (p.price * p.stock), 0)),
          money(sellerRevenue(s.id, 'day'))
        ];
      }),
      fileName: 'buyclub-vendedores-estoque.pdf'
    });
  };
}

/* MODAL DE CADASTRO DE VENDEDOR COM API DO IBGE INTEGRADAS */
function sellerModal(existing) {
  const c = existing?.country || 'BR';
  const m = modal(`
    <h2>${existing ? 'Editar' : 'Cadastrar'} vendedor</h2>
    <p>O vendedor ficará vinculado a ${esc(currentUser.name)}.</p>
    <form id="entityForm" class="seller-form">
      <label>Nome completo<input name="name" class="control" value="${esc(existing?.name)}" required></label>
      <label>Login<input name="user" class="control" value="${esc(existing?.user)}" ${existing ? 'readonly' : ''} required></label>
      <label>Senha ${existing ? '<small>(opcional)</small>' : ''}
        <div class="password-wrap">
          <input id="sellerPassword" class="control" name="password" type="password" ${existing ? '' : 'required'}>
          <button type="button" class="field-toggle" data-target="sellerPassword">Mostrar</button>
        </div>
      </label>
      <label>Confirmar senha
        <div class="password-wrap">
          <input id="sellerPasswordConfirm" class="control" name="passwordConfirm" type="password" ${existing ? '' : 'required'}>
          <button type="button" class="field-toggle" data-target="sellerPasswordConfirm">Mostrar</button>
        </div>
      </label>
      <label>WhatsApp<input name="whatsapp" class="control" value="${esc(existing?.whatsapp)}" placeholder="5541999999999" required></label>
      <div class="form-grid">
        <label>País
          <select name="country" id="countrySelect" class="control">
            <option value="BR" ${c === 'BR' ? 'selected' : ''}>Brasil</option>
            <option value="PY" ${c === 'PY' ? 'selected' : ''}>Paraguai</option>
          </select>
        </label>
        <label id="regionLabel">${locationLabel(c)}
          <select name="uf" id="ufSelect" class="control" required>
            <option value="">Selecione</option>
          </select>
        </label>
      </div>
      <label>Cidade
        <select name="city" id="citySelect" class="control" required>
          <option value="">Selecione o estado primeiro</option>
        </select>
      </label>
      <div id="entityError" class="login-error"></div>
      
      <div class="p-4 bg-sky-50 rounded-xl border border-sky-100 mt-2">
        <span class="text-xs font-bold text-slate-700 block">Botão de confirmação de cadastro:</span>
        <button type="button" id="triggerSaveSeller" class="primary-btn w-full mt-2">${icons.check} Salvar Vendedor</button>
      </div>
    </form>
  `);

  const countrySelect = m.querySelector('#countrySelect');
  const ufSelect = m.querySelector('#ufSelect');
  const citySelect = m.querySelector('#citySelect');

  const populateStates = () => {
    const selectedCountry = countrySelect.value;
    if (selectedCountry === 'BR') {
      ufSelect.innerHTML = `<option value="">Selecione o Estado</option>` +
        brazilStatesList.map(u => `<option value="${u}" ${existing?.uf === u ? 'selected' : ''}>${u}</option>`).join('');
    } else {
      ufSelect.innerHTML = `<option value="">Selecione o Departamento</option>` +
        Object.keys(paraguay).map(u => `<option value="${u}" ${existing?.uf === u ? 'selected' : ''}>${u.replaceAll('_', ' ')}</option>`).join('');
    }
  };

  populateStates();

  if (existing?.uf) {
    fetchCitiesForRegion(c, existing.uf, citySelect, existing.city);
  }

  countrySelect.onchange = () => {
    populateStates();
    citySelect.innerHTML = '<option value="">Selecione o estado primeiro</option>';
  };

  ufSelect.onchange = () => {
    fetchCitiesForRegion(countrySelect.value, ufSelect.value, citySelect);
  };

  m.querySelectorAll('.field-toggle').forEach(b => b.onclick = () => {
    const i = m.querySelector('#' + b.dataset.target);
    i.type = i.type === 'password' ? 'text' : 'password';
    b.textContent = i.type === 'password' ? 'Mostrar' : 'Ocultar';
  });

  const saveSellerHandler = async () => {
    const form = m.querySelector('#entityForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const f = new FormData(form);
    const list = read('atlasSellers');
    const user = String(f.get('user')).trim();

    if (!existing && [...supervisors, ...read('atlasSellerAccounts')].some(x => x.user.toLowerCase() === user.toLowerCase())) {
      m.querySelector('#entityError').textContent = 'Este login já está em uso.';
      return;
    }
    if (f.get('password') !== f.get('passwordConfirm')) {
      m.querySelector('#entityError').textContent = 'As senhas não conferem.';
      return;
    }

    confirmActionModal({
      title: existing ? 'Salvar Alterações do Vendedor' : 'Cadastrar Novo Vendedor',
      subtitle: `Vendedor: ${f.get('name')}`,
      warningText: 'Confirma as informações cadastrais e vinculação ao supervisor?',
      confirmText: 'Salvar Cadastro',
      onConfirm: async () => {
        let geo = await geocodePublic(f.get('city'), f.get('uf'), f.get('country'));
        let s = existing || { id: uid(), supervisor: currentUser.user };
        s.name = f.get('name');
        s.user = user;
        s.country = f.get('country');
        s.whatsapp = String(f.get('whatsapp')).replace(/\D/g, '');
        s.uf = f.get('uf');
        s.city = f.get('city');
        s.lat = geo?.lat || null;
        s.lng = geo?.lng || null;
        if (f.get('password')) s.password = f.get('password');

        const pos = list.findIndex(x => x.id === s.id);
        pos >= 0 ? list[pos] = s : list.push(s);
        write('atlasSellers', list);

        const ac = read('atlasSellerAccounts');
        const ai = ac.findIndex(x => x.id === s.id);
        ai >= 0 ? ac[ai] = s : ac.push(s);
        write('atlasSellerAccounts', ac);

        m.remove();
        renderSellersPage();
        showToast('Vendedor salvo com sucesso');
      }
    });
  };

  m.querySelector('#triggerSaveSeller').onclick = saveSellerHandler;
}

function deleteSeller(id) {
  const s = sellers().find(x => x.id === id) || allSellers().find(x => x.id === id);
  confirmActionModal({
    title: `Excluir Vendedor: ${s.name}`,
    subtitle: 'Exclusão de conta e vínculos',
    warningText: 'ATENÇÃO: Todas as vendas registradas e produtos atribuídos a este vendedor também serão permanentemente removidos.',
    confirmText: 'Confirmar Exclusão',
    onConfirm: () => {
      write('atlasSellers', read('atlasSellers').filter(x => x.id !== id));
      write('atlasSellerAccounts', read('atlasSellerAccounts').filter(x => x.id !== id));
      write('atlasProducts', products().filter(x => x.sellerId !== id));
      write('atlasSales', sales().filter(x => x.sellerId !== id));
      renderSellersPage();
      showToast('Vendedor removido');
    }
  });
}

/* PEDIDOS EM REPOSIÇÃO (SUPERVISOR) */
function renderSupervisorOrdersPage() {
  const teamSellers = sellers();
  const teamSellerIds = teamSellers.map(s => s.id);
  const activeOrders = orders().filter(o => (teamSellerIds.includes(o.sellerId) || o.supervisor.toLowerCase() === currentUser.user.toLowerCase()) && o.status !== 'Entregue');

  const pendingCount = activeOrders.filter(o => o.status === 'Em análise' || o.status === 'Pendente').length;
  const onTheWayCount = activeOrders.filter(o => o.status === 'A caminho').length;
  const rejectedCount = activeOrders.filter(o => o.status === 'Rejeitado').length;

  appFrame('Pedidos em Reposição', 'Gerencie as solicitações ativas da equipe. Ao marcar como entregue, o pedido vai para Arquivados.', `
    <div class="stats-grid mb-6">
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Em análise</span><span class="metric-icon orange">${icons.clock}</span></div>
        <div class="metric-value" style="color: var(--accent-orange);">${pendingCount}</div>
        <div class="trend neutral">Aguardando avaliação</div>
      </div>
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>A caminho</span><span class="metric-icon cyan">${icons.truck}</span></div>
        <div class="metric-value" style="color: var(--accent-cyan);">${onTheWayCount}</div>
        <div class="trend neutral">Em transporte</div>
      </div>
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Rejeitados</span><span class="metric-icon red">${icons.xCircle}</span></div>
        <div class="metric-value" style="color: var(--accent-red);">${rejectedCount}</div>
        <div class="trend neutral">Solicitações negadas</div>
      </div>
    </div>

    <div class="panel glass-panel">
      <div class="panel-head flex-wrap gap-3">
        <div>
          <h2>Solicitações Ativas de Reposição</h2>
          <p>Altere o status conforme necessário. Ao concluir, clique em <b>Pedido Entregue</b> para mover para os Arquivados.</p>
        </div>
        <div class="flex gap-2 items-center flex-wrap">
          <select id="orderStatusFilter" class="control compact" style="min-width: 180px;">
            <option value="ALL" selected>Todos os Pedidos Ativos</option>
            <option value="Em análise">Somente Em Análise</option>
            <option value="A caminho">Somente A Caminho</option>
            <option value="Rejeitado">Somente Rejeitados</option>
          </select>
          <button id="pdfOrdersBtn" class="outline-btn compact">${icons.pdf} Exportar PDF Pedidos</button>
        </div>
      </div>

      <div id="ordersListContainer"></div>
    </div>
  `);

  const filterSelect = document.getElementById('orderStatusFilter');
  const drawOrdersList = () => {
    const selectedFilter = filterSelect.value;
    const filtered = activeOrders.filter(o => {
      const normalizedStatus = (o.status === 'Pendente') ? 'Em análise' : o.status;
      return selectedFilter === 'ALL' || normalizedStatus === selectedFilter;
    });

    const container = document.getElementById('ordersListContainer');

    if (!filtered.length) {
      container.innerHTML = `<div class="empty-state"><strong>Nenhum pedido ativo no momento</strong><span>Todos os pedidos foram atendidos ou não correspondem ao filtro.</span></div>`;
      return;
    }

    container.innerHTML = `
      <div class="data-table">
        <div class="table-head" style="grid-template-columns: 1.6fr 1.2fr 1.2fr 2fr 1.5fr 1.8fr;">
          <span>Vendedor</span>
          <span>Data Pedido</span>
          <span>Entrega Desejada</span>
          <span>Produtos Solicitados</span>
          <span>Status do Pedido</span>
          <span>Ações</span>
        </div>
        ${filtered.slice().reverse().map(o => {
          const seller = teamSellers.find(s => s.id === o.sellerId);
          const sellerName = seller?.name || o.sellerName || 'Vendedor Desconhecido';
          const sellerLocation = seller ? `${seller.city}/${seller.uf}` : '';
          
          const itemsList = o.items ? o.items : [{ name: o.productName, brand: o.brand || '', quantity: o.quantity }];
          const formattedItems = itemsList.map(i => `• <b>${esc(i.name)}</b> (${i.quantity} un.)`).join('<br>');
          
          const createdAtFormatted = o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : (o.date || '—');
          const deliveryDateFormatted = o.deliveryDate ? new Date(o.deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR') : (o.date || '—');

          const currentStatus = (o.status === 'Pendente') ? 'Em análise' : o.status;

          return `
            <div class="table-row" style="grid-template-columns: 1.6fr 1.2fr 1.2fr 2fr 1.5fr 1.8fr; padding: 14px 18px;">
              <span data-label="Vendedor">
                <b>${esc(sellerName)}</b>
                <small>${esc(sellerLocation)}</small>
              </span>
              <span data-label="Data Pedido"><small>${createdAtFormatted}</small></span>
              <span data-label="Entrega Desejada"><strong style="color: var(--accent-cyan); font-size: 13px;">${deliveryDateFormatted}</strong></span>
              <span data-label="Produtos Solicitados" style="font-size: 12px; line-height: 1.4;">${formattedItems}</span>
              <span data-label="Status do Pedido">
                <select class="control compact status-select-dropdown" data-id="${o.id}">
                  <option value="Em análise" ${currentStatus === 'Em análise' ? 'selected' : ''}>Em análise</option>
                  <option value="A caminho" ${currentStatus === 'A caminho' ? 'selected' : ''}>A caminho</option>
                  <option value="Rejeitado" ${currentStatus === 'Rejeitado' ? 'selected' : ''}>Rejeitado</option>
                </select>
              </span>
              <span data-label="Ações" class="actions">
                <button class="small-btn mark-delivered-btn" data-id="${o.id}" style="background: rgba(22, 163, 74, 0.12); color: var(--accent-green); border-color: rgba(22, 163, 74, 0.3);" title="Mover para Arquivados">
                  ${icons.check} Pedido Entregue
                </button>
                <button class="delete-btn delete-order" data-id="${o.id}" title="Excluir pedido permanentemente">Excluir</button>
              </span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.status-select-dropdown').forEach(sel => {
      sel.onchange = e => {
        const newStatus = e.target.value;
        const orderId = e.target.dataset.id;
        confirmActionModal({
          title: 'Alterar Status do Pedido',
          subtitle: `Atualizar pedido para: ${newStatus}`,
          warningText: 'Esta alteração atualizará a situação da solicitação para o vendedor imediatamente.',
          confirmText: 'Salvar Novo Status',
          onConfirm: () => updateOrderStatus(orderId, newStatus)
        });
      };
    });

    container.querySelectorAll('.mark-delivered-btn').forEach(b => {
      b.onclick = () => {
        confirmActionModal({
          title: 'Marcar Pedido como Entregue',
          subtitle: 'Conclusão e envio para Arquivados',
          warningText: 'Confirmar que estes produtos foram entregues ao vendedor? O pedido sairá da lista ativa e será arquivado.',
          confirmText: 'Sim, Marcar Entregue',
          onConfirm: () => markOrderAsDelivered(b.dataset.id)
        });
      };
    });

    container.querySelectorAll('.delete-order').forEach(b => b.onclick = () => deleteOrder(b.dataset.id));
  };

  filterSelect.onchange = drawOrdersList;
  drawOrdersList();

  document.getElementById('pdfOrdersBtn').onclick = () => {
    exportUniversalPDF({
      title: 'Relatório de Pedidos em Reposição',
      subtitle: `Supervisor: ${currentUser.name} | Solicitados Ativos`,
      headers: ['Vendedor', 'Data Pedido', 'Entrega Desejada', 'Produtos Solicitados', 'Status'],
      rows: activeOrders.map(o => {
        const itemsList = o.items ? o.items.map(i => `${i.name} (${i.quantity}un)`).join(', ') : `${o.productName} (${o.quantity}un)`;
        return [
          o.sellerName || 'Vendedor',
          o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : '—',
          o.deliveryDate ? new Date(o.deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—',
          itemsList,
          o.status
        ];
      }),
      fileName: 'buyclub-pedidos-reposicao.pdf'
    });
  };
}

function updateOrderStatus(orderId, newStatus) {
  const all = orders();
  const idx = all.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    all[idx].status = newStatus;
    write('atlasOrders', all);
    showToast(`Status alterado para: ${newStatus}`);
    renderSupervisorOrdersPage();
  }
}

function markOrderAsDelivered(orderId) {
  const all = orders();
  const idx = all.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    all[idx].status = 'Entregue';
    all[idx].deliveredAt = new Date().toISOString();
    write('atlasOrders', all);
    showToast('Pedido marcado como entregue e movido para Arquivados!');
    renderSupervisorOrdersPage();
  }
}

function deleteOrder(orderId) {
  confirmActionModal({
    title: 'Excluir Pedido Permanentemente',
    subtitle: 'Remoção direta de registro',
    warningText: 'Você está prestes a apagar definitivamente esta solicitação. Esta ação não poderá ser desfeita.',
    confirmText: 'Excluir Pedido',
    onConfirm: () => {
      write('atlasOrders', orders().filter(o => o.id !== orderId));
      showToast('Pedido excluído');
      renderSupervisorOrdersPage();
    }
  });
}

/* ABA ARQUIVADOS */
function renderArchivedPage() {
  const teamSellers = sellers();
  const teamSellerIds = teamSellers.map(s => s.id);
  const archivedOrders = orders().filter(o => (teamSellerIds.includes(o.sellerId) || o.supervisor.toLowerCase() === currentUser.user.toLowerCase()) && o.status === 'Entregue');
  const teamSales = sales().filter(x => teamSellerIds.includes(x.sellerId));

  appFrame('Arquivados / Histórico', 'Histórico completo de pedidos entregues e saídas de estoque (baixas) da sua equipe.', `
    <div class="page-toolbar flex justify-between items-center mb-4">
      <div><b>Histórico Geral da Equipe</b></div>
      <button id="pdfArchivedBtn" class="outline-btn">${icons.pdf} Exportar PDF Histórico</button>
    </div>

    <div class="panel glass-panel mb-6">
      <div class="panel-head">
        <div>
          <h2>Pedidos Entregues / Concluídos (${archivedOrders.length})</h2>
          <p>Pedidos que já foram atendidos e entregues aos vendedores.</p>
        </div>
      </div>
      ${archivedOrders.length ? `
        <div class="data-table">
          <div class="table-head" style="grid-template-columns: 1.6fr 1.2fr 1.2fr 2.5fr 1.2fr auto;">
            <span>Vendedor</span>
            <span>Data Solicitada</span>
            <span>Data Entrega</span>
            <span>Produtos Entregues</span>
            <span>Status</span>
            <span>Ações</span>
          </div>
          ${archivedOrders.slice().reverse().map(o => {
            const seller = teamSellers.find(s => s.id === o.sellerId);
            const sellerName = seller?.name || o.sellerName || 'Vendedor Desconhecido';
            const itemsList = o.items ? o.items : [{ name: o.productName, brand: o.brand || '', quantity: o.quantity }];
            const formattedItems = itemsList.map(i => `• <b>${esc(i.name)}</b> (${i.quantity} un.)`).join('<br>');
            const createdAtFormatted = o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : '—';
            const deliveredAtFormatted = o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString('pt-BR') : '—';

            return `
              <div class="table-row" style="grid-template-columns: 1.6fr 1.2fr 1.2fr 2.5fr 1.2fr auto; padding: 12px 16px;">
                <span data-label="Vendedor"><b>${esc(sellerName)}</b></span>
                <span data-label="Data Solicitada"><small>${createdAtFormatted}</small></span>
                <span data-label="Data Entrega"><small>${deliveredAtFormatted}</small></span>
                <span data-label="Produtos" style="font-size: 12px;">${formattedItems}</span>
                <span data-label="Status"><span class="status-pill style-green">Entregue</span></span>
                <span data-label="Ações">
                  <button class="delete-btn delete-archived-order" data-id="${o.id}">Excluir</button>
                </span>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="empty-state compact-empty"><strong>Nenhum pedido entregue arquivado até o momento.</strong></div>'}
    </div>

    <div class="panel glass-panel">
      <div class="panel-head">
        <div>
          <h2>Histórico Geral de Baixas de Estoque</h2>
          <p>Registro histórico das vendas realizadas por toda a sua equipe.</p>
        </div>
      </div>
      ${teamSales.length ? `
        <div class="data-table">
          <div class="table-head" style="grid-template-columns: 1.2fr 1.8fr 2fr 1fr 1.2fr;">
            <span>Data / Hora</span>
            <span>Vendedor</span>
            <span>Produto Vendido</span>
            <span>Quantidade</span>
            <span>Valor Total</span>
          </div>
          ${teamSales.slice().reverse().map(x => {
            const seller = teamSellers.find(s => s.id === x.sellerId);
            const prod = products().find(p => p.id === x.productId);
            return `
              <div class="table-row" style="grid-template-columns: 1.2fr 1.8fr 2fr 1fr 1.2fr; padding: 12px 16px;">
                <span data-label="Data / Hora"><small>${new Date(x.createdAt).toLocaleString('pt-BR')}</small></span>
                <span data-label="Vendedor"><b>${esc(seller?.name || 'Vendedor Removido')}</b></span>
                <span data-label="Produto">${esc(prod?.name || 'Produto Removido')}</span>
                <span data-label="Quantidade"><b>${x.quantity} un.</b></span>
                <span data-label="Valor Total"><strong class="highlight-val">${money(x.total)}</strong></span>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="empty-state compact-empty"><strong>Nenhuma baixa registrada no histórico.</strong></div>'}
    </div>
  `);

  document.querySelectorAll('.delete-archived-order').forEach(b => {
    b.onclick = () => {
      confirmActionModal({
        title: 'Excluir Pedido Arquivado',
        subtitle: 'Remoção permanente de histórico',
        warningText: 'Este pedido sairá definitivamente do registro de arquivados.',
        confirmText: 'Excluir do Arquivo',
        onConfirm: () => {
          write('atlasOrders', orders().filter(o => o.id !== b.dataset.id));
          showToast('Pedido removido do arquivo');
          renderArchivedPage();
        }
      });
    };
  });

  document.getElementById('pdfArchivedBtn').onclick = () => {
    exportUniversalPDF({
      title: 'Relatório de Arquivados e Baixas',
      subtitle: `Supervisor: ${currentUser.name} | Registro Histórico`,
      headers: ['Data', 'Vendedor', 'Tipo de Registro', 'Detalhes', 'Valor/Status'],
      rows: [
        ...archivedOrders.map(o => [
          o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString('pt-BR') : '—',
          o.sellerName || 'Vendedor',
          'Pedido Entregue',
          o.items ? o.items.map(i => `${i.name} (${i.quantity}un)`).join(', ') : `${o.productName}`,
          'Concluído'
        ]),
        ...teamSales.map(s => {
          const sel = teamSellers.find(v => v.id === s.sellerId);
          const prd = products().find(p => p.id === s.productId);
          return [
            new Date(s.createdAt).toLocaleDateString('pt-BR'),
            sel?.name || 'Vendedor',
            'Venda/Baixa',
            `${prd?.name || 'Produto'} (${s.quantity}un)`,
            money(s.total)
          ];
        })
      ],
      fileName: 'buyclub-historico-arquivados.pdf'
    });
  };
}

function renderCatalogPage() {
  const custom = customCatalog();
  appFrame('Catálogo do Sistema', 'Cadastre e gerencie os produtos públicos do sistema.', `
    <div class="page-toolbar flex justify-between items-center mb-4 gap-3 flex-wrap">
      <div><b>${systemCatalog().length} produto(s) no catálogo</b></div>
      <div class="flex gap-2">
        <button id="pdfCatalogBtn" class="outline-btn">${icons.pdf} Exportar PDF Catálogo</button>
        <button id="newSystemProduct" class="primary-btn">+ Cadastrar Produto</button>
      </div>
    </div>
    <div class="panel glass-panel">
      <div class="catalog-grid">
        ${systemCatalog().map((p, i) => {
          const isCustom = i >= catalog.length;
          const src = isCustom ? custom[i - catalog.length] : null;
          return `
            <div class="catalog-card">
              <div class="catalog-badge">${esc(p[1])}</div>
              <h3>${esc(p[0])}</h3>
              <small style="color: var(--text-secondary);">${isCustom ? 'Item personalizado' : 'Catálogo padrão'}</small>
              ${isCustom ? `
                <div class="catalog-actions">
                  <button class="small-btn edit-custom" data-id="${src.id}">Editar</button>
                  <button class="delete-btn del-custom" data-id="${src.id}">Excluir</button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `);

  document.getElementById('newSystemProduct').onclick = () => systemProductModal();
  document.querySelectorAll('.edit-custom').forEach(b => b.onclick = () => systemProductModal(custom.find(x => x.id === b.dataset.id)));
  document.querySelectorAll('.del-custom').forEach(b => b.onclick = () => {
    confirmActionModal({
      title: 'Remover Produto do Catálogo',
      subtitle: 'Exclusão de item personalizado',
      warningText: 'Este produto deixará de aparecer no catálogo do sistema para novos pedidos.',
      confirmText: 'Excluir Item',
      onConfirm: () => {
        write('atlasCustomCatalog', custom.filter(x => x.id !== b.dataset.id));
        renderCatalogPage();
      }
    });
  });

  document.getElementById('pdfCatalogBtn').onclick = () => {
    exportUniversalPDF({
      title: 'Catálogo Oficial de Produtos',
      subtitle: 'Catálogo geral de marcas e insumos',
      headers: ['Nº', 'Nome do Produto', 'Marca / Fabricante', 'Tipo'],
      rows: systemCatalog().map((p, i) => [
        `#${i + 1}`,
        p[0],
        p[1],
        i >= catalog.length ? 'Personalizado' : 'Catálogo Padrão'
      ]),
      fileName: 'buyclub-catalogo-oficial.pdf'
    });
  };
}

function systemProductModal(existing) {
  const m = modal(`
    <h2>${existing ? 'Editar' : 'Cadastrar'} produto no sistema</h2>
    <form id="entityForm" class="seller-form">
      <label>Nome do produto<input name="name" class="control" value="${esc(existing?.name)}" required></label>
      <label>Marca<input name="brand" class="control" value="${esc(existing?.brand)}" required></label>
      <button type="button" id="triggerSaveCatalog" class="primary-btn w-full mt-2">${icons.check} Salvar no Catálogo</button>
    </form>
  `);

  m.querySelector('#triggerSaveCatalog').onclick = () => {
    const form = m.querySelector('form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const f = new FormData(form);

    confirmActionModal({
      title: 'Salvar Produto no Catálogo',
      subtitle: `${f.get('name')} — ${f.get('brand')}`,
      warningText: 'Confirmar inclusão/alteração deste item no catálogo oficial?',
      confirmText: 'Confirmar e Salvar',
      onConfirm: () => {
        const list = customCatalog();
        const x = existing || { id: uid() };
        x.name = f.get('name');
        x.brand = f.get('brand');
        const i = list.findIndex(a => a.id === x.id);
        i >= 0 ? list[i] = x : list.push(x);
        write('atlasCustomCatalog', list);
        m.remove();
        renderCatalogPage();
        showToast('Produto salvo no catálogo');
      }
    });
  };
}

function renderProductsPage() {
  const ss = sellers();
  const allProds = products().filter(p => ss.some(s => s.id === p.sellerId));
  const totalVal = allProds.filter(p => p.stock > 0).reduce((a, p) => a + (p.price * p.stock), 0);

  appFrame('Atribuir Produtos', 'Visão consolidada do estoque em posse de cada vendedor.', `
    <div class="page-toolbar flex justify-between items-center mb-6 gap-3 flex-wrap">
      <div><b>Estoque Atribuído por Vendedor</b></div>
      <div class="flex gap-2">
        <button id="pdfStockBtn" class="outline-btn">${icons.pdf} Exportar PDF Estoque</button>
        <button id="newProduct" class="primary-btn">+ Atribuir Produto / Repor</button>
      </div>
    </div>

    ${ss.length ? `
      <div class="seller-attribution-grid">
        ${ss.map(s => {
          const sActiveProds = allProds.filter(p => p.sellerId === s.id && p.stock > 0);
          const totalStockQty = sActiveProds.reduce((a, p) => a + p.stock, 0);
          const totalStockValue = sActiveProds.reduce((a, p) => a + (p.price * p.stock), 0);

          return `
            <div class="seller-card glass-panel flex flex-col justify-between p-6 rounded-2xl">
              <div>
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h3 class="text-base font-extrabold text-slate-900">${esc(s.name)}</h3>
                    <small class="text-xs text-slate-500">@${esc(s.user)} · ${esc(s.city)}/${esc(s.uf)}</small>
                  </div>
                  <span class="catalog-badge">${sActiveProds.length} produto(s) ativo(s)</span>
                </div>

                <div class="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-100/70 rounded-xl border border-slate-200/60">
                  <div>
                    <small class="text-[10px] text-slate-500 font-bold uppercase block">Estoque Total</small>
                    <div class="text-sm font-extrabold text-slate-800">${totalStockQty} un.</div>
                  </div>
                  <div>
                    <small class="text-[10px] text-slate-500 font-bold uppercase block">Valor em R$</small>
                    <div class="highlight-val text-sm">${money(totalStockValue)}</div>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 mt-2">
                <button class="primary-btn flex-1 open-seller-prods-modal" data-id="${s.id}" style="height: 38px; font-size: 12px;">
                  Ver produtos (${sActiveProds.length})
                </button>
                <button class="outline-btn add-prod-to-seller" data-id="${s.id}" style="height: 38px; font-size: 12px; padding: 0 12px;" title="Atribuir novo produto ou repor">
                  + Atribuir / Repor
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : '<div class="empty-state"><strong>Nenhum vendedor cadastrado</strong><span>Cadastre vendedores antes de atribuir produtos.</span></div>'}
  `);

  document.getElementById('newProduct').onclick = () => productModal();
  document.querySelectorAll('.open-seller-prods-modal').forEach(b => b.onclick = () => viewSellerProductsModal(b.dataset.id));
  document.querySelectorAll('.add-prod-to-seller').forEach(b => b.onclick = () => productModal(null, b.dataset.id));

  document.getElementById('pdfStockBtn').onclick = () => {
    exportUniversalPDF({
      title: 'Relatório de Atribuição de Produtos',
      subtitle: `Supervisor: ${currentUser.name} | Patrimônio Total: ${money(totalVal)}`,
      headers: ['Vendedor', 'Produto', 'Marca', 'Preço Unit. (R$)', 'Quantidade (un)', 'Subtotal (R$)'],
      rows: allProds.filter(p => p.stock > 0).map(p => {
        const sel = ss.find(s => s.id === p.sellerId);
        return [
          sel?.name || 'Vendedor',
          p.name,
          p.brand,
          money(p.price),
          `${p.stock} un.`,
          money(p.price * p.stock)
        ];
      }),
      fileName: 'buyclub-atribuicao-estoque.pdf'
    });
  };
}

function viewSellerProductsModal(sellerId) {
  const seller = sellers().find(s => s.id === sellerId) || allSellers().find(s => s.id === sellerId);
  const sellerProds = products().filter(p => p.sellerId === sellerId && p.stock > 0);
  const totalVal = sellerProds.reduce((a, p) => a + (p.price * p.stock), 0);

  const m = modal(`
    <h2>Produtos em posse de ${esc(seller?.name)}</h2>
    <p>Valor total em estoque ativo: <strong class="highlight-val">${money(totalVal)}</strong> (${sellerProds.reduce((a, p) => a + p.stock, 0)} unidades em posse)</p>
    
    <div style="max-height: 400px; overflow-y: auto; margin-top: 14px;">
      ${sellerProds.length ? `
        <div class="data-table">
          <div class="table-head" style="grid-template-columns: 2fr 1fr 1fr 1.2fr auto;">
            <span>Produto</span><span>Preço (R$)</span><span>Estoque</span><span>Subtotal (R$)</span><span>Ações</span>
          </div>
          ${sellerProds.map(p => `
            <div class="table-row" style="grid-template-columns: 2fr 1fr 1fr 1.2fr auto; padding: 12px 16px;">
              <span data-label="Produto"><b>${esc(p.name)}</b><small>${esc(p.brand)}</small></span>
              <span data-label="Preço">${money(p.price)}</span>
              <span data-label="Estoque">${p.stock} un.</span>
              <span data-label="Subtotal"><strong class="highlight-val">${money(p.price * p.stock)}</strong></span>
              <span data-label="Ações" class="actions">
                <button class="small-btn edit-product-btn" data-id="${p.id}">Editar/Repor</button>
                <button class="delete-btn del-product-btn" data-id="${p.id}">Zerar/Excluir</button>
              </span>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-state"><strong>Nenhum produto ativo em posse deste vendedor.</strong></div>'}
    </div>
    
    <div class="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200">
      <button class="primary-btn add-more-prod" data-id="${sellerId}">+ Atribuir / Repor Produto</button>
    </div>
  `);

  m.querySelectorAll('.edit-product-btn').forEach(b => b.onclick = () => { m.remove(); productModal(products().find(p => p.id === b.dataset.id)); });
  m.querySelectorAll('.del-product-btn').forEach(b => b.onclick = () => {
    confirmActionModal({
      title: 'Remover Atribuição de Produto',
      subtitle: 'Exclusão de produto do vendedor',
      warningText: 'Este produto sairá do estoque sob posse do vendedor e desaparecerá da lista dele.',
      confirmText: 'Remover Produto',
      onConfirm: () => {
        deleteProduct(b.dataset.id);
        m.remove();
        viewSellerProductsModal(sellerId);
      }
    });
  });
  m.querySelector('.add-more-prod').onclick = () => { m.remove(); productModal(null, sellerId); };
}

function productModal(existing, preselectedSellerId) {
  const ss = sellers();
  if (!ss.length) return alert('Cadastre um vendedor antes de atribuir produtos.');
  
  const all = systemCatalog();
  const options = all.map((c, i) => `<option value="${i}" ${existing?.catalogIndex === i ? 'selected' : ''}>${esc(c[0])} · ${esc(c[1])}</option>`).join('');
  const targetSellerId = existing?.sellerId || preselectedSellerId || ss[0].id;

  const m = modal(`
    <h2>${existing ? 'Editar / Repor' : 'Atribuir / Repor'} produto ao vendedor</h2>
    <p>Selecione o produto do catálogo, defina o preço unitário em reais e a quantidade enviada ao estoque.</p>
    <form id="entityForm" class="seller-form">
      <label>Produto do catálogo
        <select name="catalog" class="control" ${existing ? 'disabled' : ''} required>${options}</select>
      </label>
      
      <div class="form-grid">
        <label>Preço Unitário (R$)
          <input name="price" id="prodPriceInput" class="control" type="number" min="0" step="0.01" placeholder="Ex: 150.00" value="${existing?.price || ''}" required>
        </label>
        <label>Quantidade em Estoque (Reposição)
          <input name="stock" id="prodStockInput" class="control" type="number" min="0" placeholder="Ex: 10" value="${existing?.stock || 0}" required>
        </label>
      </div>

      <div class="p-3 bg-sky-50 rounded-xl border border-sky-100 flex justify-between items-center my-1">
        <span class="text-xs font-bold text-slate-600">Valor Total do Lote (R$):</span>
        <strong id="calcTotalPreview" class="highlight-val text-base">${money((existing?.price || 0) * (existing?.stock || 0))}</strong>
      </div>

      <label>Vendedor responsável
        <select name="sellerId" class="control" ${existing ? 'disabled' : ''} required>
          ${ss.map(s => `<option value="${s.id}" ${targetSellerId === s.id ? 'selected' : ''}>${esc(s.name)} (@${esc(s.user)})</option>`).join('')}
        </select>
      </label>

      <button type="button" id="triggerSaveProd" class="primary-btn w-full mt-2">${icons.check} Confirmar Reposição / Atribuição</button>
    </form>
  `);

  const pInput = m.querySelector('#prodPriceInput');
  const sInput = m.querySelector('#prodStockInput');
  const prev = m.querySelector('#calcTotalPreview');

  const updateCalc = () => {
    const val = (Number(pInput.value) || 0) * (Number(sInput.value) || 0);
    prev.textContent = money(val);
  };

  pInput.oninput = updateCalc;
  sInput.oninput = updateCalc;

  m.querySelector('#triggerSaveProd').onclick = () => {
    const form = m.querySelector('form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const f = new FormData(form);

    confirmActionModal({
      title: 'Confirmar Reposição de Estoque',
      subtitle: `Preço: ${money(f.get('price'))} | Quantidade Reposta: ${f.get('stock')} un.`,
      warningText: 'Confirmar reposição deste produto para o vendedor? Se o produto estava oculto por falta de estoque, ele reaparecerá no painel do vendedor.',
      confirmText: 'Salvar Reposição',
      onConfirm: () => {
        const list = products();
        const i = Number(f.get('catalog'));
        const c = all[i];
        const selId = f.get('sellerId');

        let p = existing || list.find(x => x.sellerId === selId && (x.catalogIndex === i || x.name === c[0])) || { id: uid(), catalogIndex: i, sellerId: selId };
        
        p.name = c[0];
        p.brand = c[1];
        p.price = Number(f.get('price'));
        p.stock = Number(f.get('stock'));

        const pos = list.findIndex(x => x.id === p.id);
        pos >= 0 ? list[pos] = p : list.push(p);
        write('atlasProducts', list);

        m.remove();
        renderProductsPage();
        showToast('Estoque reposto com sucesso!');
      }
    });
  };
}

function deleteProduct(id) {
  write('atlasProducts', products().filter(x => x.id !== id));
  renderProductsPage();
}

function renderReportsPage() {
  const ss = sellers();
  appFrame('Relatórios Operacionais', 'Filtre faturamento por período e gere exportações em PDF.', `
    <div class="report-toolbar flex flex-wrap items-center justify-between gap-4 mb-4">
      <label class="font-bold text-xs text-slate-700">
        Período do Relatório
        <select id="reportPeriod" class="control mt-1">
          <option value="day">Hoje</option>
          <option value="7days">Últimos 7 dias</option>
          <option value="month">Este mês</option>
          <option value="year">Este ano</option>
        </select>
      </label>
      <button id="downloadPdf" class="primary-btn">${icons.pdf} Gerar PDF Consolidado</button>
    </div>
    <div id="reportResult"></div>
  `);

  const update = () => {
    const per = document.getElementById('reportPeriod').value;
    const rows = ss.map(s => {
      const xs = periodSales(s.id, per);
      return { s, xs, total: xs.reduce((a, x) => a + x.total, 0), qty: xs.reduce((a, x) => a + x.quantity, 0) };
    });

    const total = rows.reduce((a, x) => a + x.total, 0);
    const qty = rows.reduce((a, x) => a + x.qty, 0);

    document.getElementById('reportResult').innerHTML = `
      <div class="stats-grid report-stats mb-6">
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Faturamento</span><span class="metric-icon cyan">${icons.dollar}</span></div>
          <div class="metric-value">${money(total)}</div>
        </div>
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Itens Vendidos</span><span class="metric-icon purple">${icons.check}</span></div>
          <div class="metric-value">${qty}</div>
        </div>
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Vendedores com Baixa</span><span class="metric-icon green">${icons.users}</span></div>
          <div class="metric-value">${rows.filter(x => x.qty > 0).length}</div>
        </div>
      </div>

      <div class="panel glass-panel">
        <div class="panel-head">
          <div><h2>Detalhamento por Vendedor</h2></div>
        </div>
        ${ss.length ? `
          <div class="data-table">
            <div class="table-head">
              <span>Vendedor</span><span>Itens</span><span>Faturamento</span><span>Passado ao Supervisor</span><span>Estoque Atual</span>
            </div>
            ${rows.map(r => `
              <div class="table-row">
                <span data-label="Vendedor"><b>${esc(r.s.name)}</b><small>${esc(r.s.city)} / ${esc(r.s.uf)}</small></span>
                <span data-label="Itens">${r.qty} un.</span>
                <span data-label="Faturamento">${money(r.total)}</span>
                <span data-label="Passado ao Supervisor">${money(r.xs.filter(x => x.paidToSupervisor).reduce((a, x) => a + x.total, 0))}</span>
                <span data-label="Estoque">${stock(r.s.id)} un.</span>
              </div>
            `).join('')}
          </div>
        ` : '<div class="empty-state"><strong>Nenhum dado registrado para este período.</strong></div>'}
      </div>
    `;
  };

  document.getElementById('reportPeriod').onchange = update;
  document.getElementById('downloadPdf').onclick = () => pdfReport(document.getElementById('reportPeriod').value);
  update();
}

function pdfReport(per) {
  const ss = sellers();
  const rows = ss.map(s => {
    const xs = periodSales(s.id, per);
    return [
      s.name,
      `${s.city}/${s.uf}`,
      `${xs.reduce((a, x) => a + x.quantity, 0)} un.`,
      money(xs.reduce((a, x) => a + x.total, 0)),
      `${stock(s.id)} un.`
    ];
  });

  exportUniversalPDF({
    title: 'Relatório Operacional de Vendas',
    subtitle: `Supervisor: ${currentUser.name} | Período: ${per}`,
    headers: ['Vendedor', 'Localização', 'Itens Vendidos', 'Faturamento Total', 'Estoque Atual'],
    rows,
    fileName: `buyclub-relatorio-${per}.pdf`
  });
}

function renderMapPage() {
  appFrame('Mapa Operacional', 'Localização geográfica dos vendedores ativos.', `
    <div class="panel glass-panel">
      <div class="panel-head">
        <div><h2>Mapa da Equipe</h2><p>Marcadores geocodificados dos cadastros ativos.</p></div>
        <button class="outline-btn" id="mapRefresh">${icons.refresh} Atualizar Mapa</button>
      </div>
      <div id="teamMap" class="w-full h-[520px] rounded-xl overflow-hidden mt-2"></div>
    </div>
  `);

  setTimeout(() => {
    map = L.map('teamMap').setView([-14, -52], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

    sellers().filter(s => s.lat && s.lng).forEach(s => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="custom-marker">${esc((s.initials || s.name.slice(0, 2)).slice(0, 2))}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([s.lat, s.lng], { icon }).addTo(map).bindPopup(`
        <div style="color:#0f172a; padding: 4px;">
          <b>${esc(s.name)}</b><br>
          ${esc(s.city)} / ${esc(s.uf)}<br>
          ${countryNames[s.country] || 'Brasil'}<br>
          Estoque: ${stock(s.id)} un.<br>
          Faturamento hoje: ${money(sellerRevenue(s.id, 'day'))}
        </div>
      `);
    });

    document.getElementById('mapRefresh').onclick = renderMapPage;
  }, 50);
}

/* PAINEL DO VENDEDOR */
function renderSeller() {
  const sellerProducts = products().filter(p => p.sellerId === currentUser.id && Number(p.stock) > 0);
  
  const totalStockValue = sellerProducts.reduce((a, p) => a + (p.price * p.stock), 0);
  const totalStockQty = sellerProducts.reduce((a, p) => a + p.stock, 0);
  const todaySales = periodSales(currentUser.id, 'day');
  const todayTotal = todaySales.reduce((a, x) => a + x.total, 0);

  const fullSysCatalog = systemCatalog();
  const myOrders = orders().filter(o => o.sellerId === currentUser.id);

  let screenTitle = 'Registrar Baixas / Vendas do Dia';
  if (sellerActiveTab === 'newOrder') screenTitle = 'Pedido de Reposição';
  if (sellerActiveTab === 'myOrders') screenTitle = 'Acompanhar Meus Pedidos';
  if (sellerActiveTab === 'archived') screenTitle = 'Arquivados / Histórico do Vendedor';

  const container = document.querySelector('.app-layout') || document.body;

  container.innerHTML = `
    <div class="app-layout w-full min-h-screen flex">
      <aside class="app-sidebar desktop-only">${sellerNavContent()}</aside>
      <div id="sellerDrawerOverlay" class="drawer-overlay ${drawerOpen ? 'open' : ''}"></div>
      <aside id="sellerDrawer" class="app-sidebar drawer-sidebar ${drawerOpen ? 'open' : ''}">
        <div class="flex justify-end p-2 sm:hidden">
          <button id="closeSellerDrawer" class="close-btn" style="position:static;">×</button>
        </div>
        ${sellerNavContent()}
      </aside>

      <section class="app-content flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <header class="app-header glass-panel flex justify-between items-center">
            <div class="flex items-center gap-3">
              <button id="sellerHamburgerBtn" class="hamburger-btn" title="Abrir Menu">${icons.menu}</button>
              <div>
                <div class="eyebrow">BUYCLUB.US SYSTEM · PAINEL DO VENDEDOR</div>
                <h1 class="text-xl font-black text-slate-900">${screenTitle}</h1>
              </div>
            </div>
            <div class="header-actions">
              <button id="sellerPdfExport" class="outline-btn">${icons.pdf} <span class="hidden-mobile">PDF</span></button>
              <button id="sellerRefresh" class="outline-btn" title="Atualizar">${icons.refresh} <span class="hidden-mobile">Atualizar</span></button>
              <button id="sellerLogout" class="outline-btn" title="Sair">${icons.logout}</button>
              <div class="avatar">${avatarFor(currentUser)}</div>
            </div>
          </header>

          <div class="page-body">
            <div class="stats-grid seller-stats mb-6">
              <div class="metric-card glass-panel">
                <div class="metric-top"><span>Faturamento Hoje</span><span class="metric-icon cyan">${icons.dollar}</span></div>
                <div class="metric-value">${money(todayTotal)}</div>
                <div class="trend neutral">${todaySales.reduce((a, x) => a + x.quantity, 0)} itens vendidos hoje</div>
              </div>

              <div class="metric-card glass-panel">
                <div class="metric-top"><span>Valor em Estoque (R$)</span><span class="metric-icon green">${icons.products}</span></div>
                <div class="metric-value">${money(totalStockValue)}</div>
                <div class="trend neutral">Patrimônio ativo em posse</div>
              </div>

              <div class="metric-card glass-panel">
                <div class="metric-top"><span>Unidades em Posse</span><span class="metric-icon orange">${icons.catalog}</span></div>
                <div class="metric-value">${totalStockQty} <small style="font-size: 14px; color: var(--text-secondary);">un.</small></div>
                <div class="trend neutral">${sellerProducts.length} produtos disponíveis</div>
              </div>
            </div>

            ${sellerActiveTab === 'sales' ? renderSellerSalesTab(sellerProducts, todaySales) : ''}
            ${sellerActiveTab === 'newOrder' ? renderSellerNewOrderTab(fullSysCatalog) : ''}
            ${sellerActiveTab === 'myOrders' ? renderSellerMyOrdersTab(myOrders) : ''}
            ${sellerActiveTab === 'archived' ? renderSellerArchivedTab(myOrders) : ''}
          </div>
        </div>
        ${appFooter()}
      </section>
    </div>
  `;

  const drawer = document.getElementById('sellerDrawer');
  const overlay = document.getElementById('sellerDrawerOverlay');
  const toggleBtn = document.getElementById('sellerHamburgerBtn');
  const closeBtn = document.getElementById('closeSellerDrawer');

  const openDrawer = () => { drawerOpen = true; drawer?.classList.add('open'); overlay?.classList.add('open'); };
  const closeDrawer = () => { drawerOpen = false; drawer?.classList.remove('open'); overlay?.classList.remove('open'); };

  if (toggleBtn) toggleBtn.onclick = () => drawerOpen ? closeDrawer() : openDrawer();
  if (closeBtn) closeBtn.onclick = closeDrawer;
  if (overlay) overlay.onclick = closeDrawer;

  document.querySelectorAll('[data-seller-tab]').forEach(b => {
    b.onclick = () => {
      sellerActiveTab = b.dataset.sellerTab;
      closeDrawer();
      renderSeller();
    };
  });

  document.querySelectorAll('.logoutSellerSideBtn').forEach(b => b.onclick = logout);
  const sLogout = document.getElementById('sellerLogout');
  if (sLogout) sLogout.onclick = logout;

  document.getElementById('sellerRefresh').onclick = renderSeller;

  document.getElementById('sellerPdfExport').onclick = () => {
    exportUniversalPDF({
      title: `Painel Vendedor — ${currentUser.name}`,
      subtitle: `Estoque em Posse: ${money(totalStockValue)} (${totalStockQty} un)`,
      headers: ['Produto', 'Preço (R$)', 'Estoque', 'Subtotal (R$)'],
      rows: sellerProducts.map(p => [p.name, money(p.price), `${p.stock} un.`, money(p.price * p.stock)]),
      fileName: `vendedor-${currentUser.user}-relatorio.pdf`
    });
  };

  if (sellerActiveTab === 'sales') setupSalesTabEvents(sellerProducts);
  if (sellerActiveTab === 'newOrder') setupNewOrderTabEvents(fullSysCatalog);
}

function renderSellerSalesTab(sellerProducts, todaySales) {
  return `
    <div class="instruction-banner glass-panel mb-6 p-5 border-l-4 border-l-sky-500 bg-sky-50/60 flex items-start gap-4">
      <div class="icon-wrap text-sky-600">${icons.flash}</div>
      <div>
        <h3 class="text-base font-extrabold text-slate-800">Como Funciona o Registro de Baixas do Dia</h3>
        <p class="text-xs text-slate-600 mt-1 leading-relaxed">
          Selecione abaixo <b>somente os produtos disponíveis</b> e informe as vendas. 
          Ao zerar o estoque de um produto, <b>ele desaparecerá da sua lista</b> até que o supervisor realize a reposição.
        </p>
      </div>
    </div>

    <div class="panel glass-panel">
      <div class="panel-head flex-wrap gap-3">
        <div>
          <h2>Selecione os Produtos Vendidos Hoje</h2>
          <p>Ajuste as quantidades vendidas usando os botões <b>-</b> e <b>+</b> ou digite a quantidade.</p>
        </div>
        ${sellerProducts.length ? `
          <button id="registerSaleBtn" class="primary-btn" style="height: 42px;">
            ${icons.check} Confirmar Vendas do Dia (<span id="selectedBajasCount">0</span>)
          </button>
        ` : ''}
      </div>

      ${sellerProducts.length ? `
        <div class="data-table seller-bajas-table">
          <div class="table-head" style="grid-template-columns: 2.2fr 1.2fr 1.2fr 1.2fr 1.8fr;">
            <span>Produto & Marca</span>
            <span>Preço Unitário</span>
            <span>Estoque Disponível</span>
            <span>Subtotal Vendido</span>
            <span>Quantidade Vendida Hoje</span>
          </div>
          ${sellerProducts.map(p => `
            <div class="table-row baja-product-row" data-price="${p.price}" style="grid-template-columns: 2.2fr 1.2fr 1.2fr 1.2fr 1.8fr; padding: 14px 18px;">
              <span data-label="Produto">
                <b>${esc(p.name)}</b>
                <small class="text-xs text-slate-500">${esc(p.brand)}</small>
              </span>
              <span data-label="Preço">${money(p.price)}</span>
              <span data-label="Estoque Disponível"><strong class="text-slate-800">${p.stock} un.</strong></span>
              <span data-label="Subtotal"><strong class="highlight-val line-subtotal">${money(0)}</strong></span>
              <span data-label="Quantidade Vendida Hoje" class="qty-control-wrap flex items-center gap-2">
                <button type="button" class="qty-btn minus-btn" data-id="${p.id}">−</button>
                <input class="qty-input control baja-qty-input" data-id="${p.id}" data-max="${p.stock}" type="number" min="0" max="${p.stock}" value="0">
                <button type="button" class="qty-btn plus-btn" data-id="${p.id}">+</button>
              </span>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <strong>Nenhum produto em estoque no momento.</strong>
          <span>Você vendeu todos os seus itens ou ainda não possui estoque atribuído. Acesse a aba <b>Pedido de Reposição</b> para solicitar novos produtos.</span>
        </div>
      `}
    </div>

    <div class="panel glass-panel mt-6">
      <div class="panel-head">
        <div>
          <h2>Baixas Registradas Hoje</h2>
          <p>Histórico das movimentações e vendas já confirmadas no dia.</p>
        </div>
      </div>
      ${todaySales.length ? `
        <div class="data-table">
          <div class="table-head" style="grid-template-columns: 1.2fr 2fr 1fr 1.2fr;">
            <span>Horário</span><span>Produto</span><span>Quantidade</span><span>Valor Total (R$)</span>
          </div>
          ${todaySales.map(x => `
            <div class="table-row" style="grid-template-columns: 1.2fr 2fr 1fr 1.2fr; padding: 12px 16px;">
              <span data-label="Horário">${new Date(x.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span data-label="Produto">${esc(products().find(p => p.id === x.productId)?.name || 'Produto Removido')}</span>
              <span data-label="Quantidade"><b>${x.quantity} un.</b></span>
              <span data-label="Total"><strong class="highlight-val">${money(x.total)}</strong></span>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-state compact-empty"><strong>Nenhuma baixa registrada até o momento hoje.</strong></div>'}
    </div>
  `;
}

function setupSalesTabEvents(sellerProducts) {
  const inputs = [...document.querySelectorAll('.baja-qty-input')];
  const countSpan = document.getElementById('selectedBajasCount');

  const updateTotals = () => {
    let activeCount = 0;
    inputs.forEach(input => {
      const row = input.closest('.baja-product-row');
      const price = Number(row.dataset.price) || 0;
      const qty = Number(input.value) || 0;
      const subtotal = price * qty;
      
      row.querySelector('.line-subtotal').textContent = money(subtotal);
      if (qty > 0) activeCount += 1;
    });
    if (countSpan) countSpan.textContent = activeCount;
  };

  document.querySelectorAll('.minus-btn').forEach(btn => {
    btn.onclick = () => {
      const input = document.querySelector(`.baja-qty-input[data-id="${btn.dataset.id}"]`);
      let val = Number(input.value) || 0;
      if (val > 0) { input.value = val - 1; updateTotals(); }
    };
  });

  document.querySelectorAll('.plus-btn').forEach(btn => {
    btn.onclick = () => {
      const input = document.querySelector(`.baja-qty-input[data-id="${btn.dataset.id}"]`);
      let val = Number(input.value) || 0;
      let max = Number(input.dataset.max) || 0;
      if (val < max) { input.value = val + 1; updateTotals(); }
    };
  });

  inputs.forEach(i => i.oninput = updateTotals);

  const confirmBtn = document.getElementById('registerSaleBtn');
  if (confirmBtn) {
    confirmBtn.onclick = () => registerSale(sellerProducts);
  }
}

function renderSellerNewOrderTab(fullSysCatalog) {
  const defaultDeliveryDate = new Date();
  defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 2);
  const formattedDefaultDate = defaultDeliveryDate.toISOString().slice(0, 10);

  return `
    <div class="panel glass-panel">
      <div class="panel-head">
        <div>
          <h2>Solicitar Novo Pedido de Estoque</h2>
          <p>Escolha os produtos do catálogo oficial, defina a quantidade necessária e informe a data em que deseja a entrega.</p>
        </div>
      </div>

      <form id="sellerOrderBatchForm">
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-sky-50/80 border border-sky-100 rounded-2xl mb-6">
          <div class="flex items-center gap-3">
            <span class="icon-wrap text-sky-600">${icons.calendar}</span>
            <div>
              <label class="text-xs font-extrabold text-slate-700 block">Data Desejada para Receber a Entrega:</label>
              <input type="date" name="deliveryDate" class="control mt-1" style="max-width: 210px; background: #fff;" value="${formattedDefaultDate}" required>
            </div>
          </div>
          <div class="text-right flex items-center gap-4">
            <span id="orderBatchSummary" class="text-xs font-bold text-slate-600 block">0 item(ns) selecionado(s)</span>
            <button type="submit" class="primary-btn" style="height: 42px;">${icons.check} Enviar Pedido ao Supervisor</button>
          </div>
        </div>

        <div class="mb-4">
          <input type="text" id="catalogSearchInput" class="control" placeholder="Buscar produto no catálogo..." style="max-width: 380px;">
        </div>

        <div style="max-height: 450px; overflow-y: auto; padding-right: 4px;">
          <div class="data-table">
            <div class="table-head" style="grid-template-columns: 50px 2.5fr 1.2fr 1.2fr;">
              <span>Marcar</span>
              <span>Produto do Catálogo</span>
              <span>Marca</span>
              <span>Quantidade Desejada</span>
            </div>
            ${fullSysCatalog.map((c, idx) => `
              <div class="table-row catalog-item-row" data-search="${esc(c[0].toLowerCase())} ${esc(c[1].toLowerCase())}" style="grid-template-columns: 50px 2.5fr 1.2fr 1.2fr; padding: 12px 16px;">
                <span>
                  <input type="checkbox" class="order-catalog-check" data-idx="${idx}" style="width: 20px; height: 20px; cursor: pointer;">
                </span>
                <span data-label="Produto"><b class="text-slate-800">${esc(c[0])}</b></span>
                <span data-label="Marca"><span class="catalog-badge">${esc(c[1])}</span></span>
                <span data-label="Qtd Desejada">
                  <input type="number" class="control order-catalog-qty" data-idx="${idx}" min="1" value="1" disabled style="height: 36px; width: 90px; text-align: center;">
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </form>
    </div>
  `;
}

function setupNewOrderTabEvents(fullSysCatalog) {
  const checks = [...document.querySelectorAll('.order-catalog-check')];
  const searchInput = document.getElementById('catalogSearchInput');

  if (searchInput) {
    searchInput.oninput = () => {
      const term = searchInput.value.toLowerCase().trim();
      document.querySelectorAll('.catalog-item-row').forEach(row => {
        const text = row.dataset.search || '';
        row.style.display = text.includes(term) ? 'grid' : 'none';
      });
    };
  }

  const updateOrderSummary = () => {
    const selected = checks.filter(c => c.checked).length;
    document.getElementById('orderBatchSummary').textContent = `${selected} item(ns) selecionado(s)`;
  };

  checks.forEach(c => {
    c.onchange = () => {
      const qInput = document.querySelector(`.order-catalog-qty[data-idx="${c.dataset.idx}"]`);
      qInput.disabled = !c.checked;
      updateOrderSummary();
    };
  });

  document.getElementById('sellerOrderBatchForm').onsubmit = e => {
    e.preventDefault();
    const deliveryDate = new FormData(e.target).get('deliveryDate');
    const selectedChecks = checks.filter(c => c.checked);

    if (!selectedChecks.length) {
      alert('Selecione ao menos um produto do catálogo para fazer o pedido.');
      return;
    }

    const orderItems = selectedChecks.map(c => {
      const idx = Number(c.dataset.idx);
      const catItem = fullSysCatalog[idx];
      const qInput = document.querySelector(`.order-catalog-qty[data-idx="${idx}"]`);
      return {
        name: catItem[0],
        brand: catItem[1],
        quantity: Number(qInput.value) || 1
      };
    });

    confirmActionModal({
      title: 'Enviar Pedido de Reposição',
      subtitle: `Data da Entrega: ${new Date(deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR')} | ${orderItems.length} produto(s)`,
      warningText: 'Confirmar o envio desta solicitação para avaliação do seu supervisor?',
      confirmText: 'Enviar Pedido Agora',
      onConfirm: () => {
        const newOrder = {
          id: uid(),
          sellerId: currentUser.id,
          sellerName: currentUser.name,
          supervisor: currentUser.supervisor,
          createdAt: new Date().toISOString(),
          deliveryDate: deliveryDate,
          items: orderItems,
          status: 'Em análise'
        };

        const currentOrders = read('atlasOrders');
        currentOrders.push(newOrder);
        write('atlasOrders', currentOrders);

        showToast('Pedido enviado com sucesso ao supervisor!');
        sellerActiveTab = 'myOrders';
        renderSeller();
      }
    });
  };
}

function renderSellerMyOrdersTab(myOrders) {
  const activeOrders = myOrders.filter(o => o.status !== 'Entregue');

  return `
    <div class="panel glass-panel">
      <div class="panel-head">
        <div>
          <h2>Acompanhar Meus Pedidos Ativos</h2>
          <p>Confira o status das suas solicitações. Você pode cancelar ou excluir qualquer pedido pendente.</p>
        </div>
      </div>
      ${activeOrders.length ? `
        <div class="data-table">
          <div class="table-head" style="grid-template-columns: 1.2fr 1.2fr 2.5fr 1.2fr auto;">
            <span>Data do Pedido</span>
            <span>Entrega Desejada</span>
            <span>Produtos Solicitados</span>
            <span>Status Atual</span>
            <span>Ações</span>
          </div>
          ${activeOrders.slice().reverse().map(o => {
            const itemsList = o.items ? o.items : [{ name: o.productName, brand: o.brand || '', quantity: o.quantity }];
            const formattedItems = itemsList.map(i => `• <b>${esc(i.name)}</b> (${i.quantity} un.)`).join('<br>');
            const createdAtFormatted = o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : (o.date || '—');
            const deliveryDateFormatted = o.deliveryDate ? new Date(o.deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR') : (o.date || '—');

            const currentStatus = (o.status === 'Pendente') ? 'Em análise' : o.status;

            let badgeClass = 'status-pill';
            if (currentStatus === 'Em análise') badgeClass = 'status-pill style-orange';
            if (currentStatus === 'A caminho') badgeClass = 'status-pill style-blue';
            if (currentStatus === 'Rejeitado') badgeClass = 'status-pill style-red';

            return `
              <div class="table-row" style="grid-template-columns: 1.2fr 1.2fr 2.5fr 1.2fr auto; padding: 14px 18px;">
                <span data-label="Data Pedido"><small>${createdAtFormatted}</small></span>
                <span data-label="Entrega Desejada"><strong style="color: var(--accent-cyan); font-size: 13px;">${deliveryDateFormatted}</strong></span>
                <span data-label="Produtos Solicitados" style="font-size: 12px; line-height: 1.4;">${formattedItems}</span>
                <span data-label="Status Atual"><span class="${badgeClass}">${esc(currentStatus)}</span></span>
                <span data-label="Ações">
                  <button class="delete-btn delete-seller-order" data-id="${o.id}" title="Cancelar ou excluir este pedido">Excluir</button>
                </span>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="empty-state compact-empty"><strong>Você não possui nenhum pedido ativo no momento.</strong></div>'}
    </div>
  `;

  setTimeout(() => {
    document.querySelectorAll('.delete-seller-order').forEach(b => {
      b.onclick = () => {
        confirmActionModal({
          title: 'Excluir Pedido',
          subtitle: 'Cancelamento de solicitação enviada',
          warningText: 'Deseja realmente cancelar/excluir este pedido enviado ao seu supervisor?',
          confirmText: 'Excluir Pedido',
          onConfirm: () => {
            write('atlasOrders', orders().filter(o => o.id !== b.dataset.id));
            showToast('Pedido excluído com sucesso!');
            renderSeller();
          }
        });
      };
    });
  }, 50);
}

function renderSellerArchivedTab(myOrders) {
  const deliveredOrders = myOrders.filter(o => o.status === 'Entregue');
  const mySalesHistory = sales().filter(s => s.sellerId === currentUser.id);

  return `
    <div class="panel glass-panel mb-6">
      <div class="panel-head">
        <div>
          <h2>Meus Pedidos Entregues</h2>
          <p>Histórico de reposições já recebidas e concluídas pelo supervisor.</p>
        </div>
      </div>
      ${deliveredOrders.length ? `
        <div class="data-table">
          <div class="table-head" style="grid-template-columns: 1.2fr 1.2fr 2.8fr 1.2fr;">
            <span>Data Solicitada</span>
            <span>Data Entrega</span>
            <span>Produtos Recebidos</span>
            <span>Status</span>
          </div>
          ${deliveredOrders.slice().reverse().map(o => {
            const itemsList = o.items ? o.items : [{ name: o.productName, brand: o.brand || '', quantity: o.quantity }];
            const formattedItems = itemsList.map(i => `• <b>${esc(i.name)}</b> (${i.quantity} un.)`).join('<br>');
            const createdAtFormatted = o.createdAt ? new Date(o.createdAt).toLocaleDateString('pt-BR') : '—';
            const deliveredAtFormatted = o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString('pt-BR') : '—';

            return `
              <div class="table-row" style="grid-template-columns: 1.2fr 1.2fr 2.8fr 1.2fr; padding: 12px 16px;">
                <span data-label="Data Solicitada"><small>${createdAtFormatted}</small></span>
                <span data-label="Data Entrega"><small>${deliveredAtFormatted}</small></span>
                <span data-label="Produtos Recebidos" style="font-size: 12px;">${formattedItems}</span>
                <span data-label="Status"><span class="status-pill style-green">Entregue</span></span>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="empty-state compact-empty"><strong>Nenhum pedido delivered no seu histórico.</strong></div>'}
    </div>

    <div class="panel glass-panel">
      <div class="panel-head">
        <div>
          <h2>Meu Histórico Completo de Baixas / Vendas</h2>
          <p>Registro de todas as baixas de estoque efetuadas por você.</p>
        </div>
      </div>
      ${mySalesHistory.length ? `
        <div class="data-table">
          <div class="table-head" style="grid-template-columns: 1.5fr 2.5fr 1fr 1.5fr;">
            <span>Data / Hora</span>
            <span>Produto Sold</span>
            <span>Quantidade</span>
            <span>Total Vendido</span>
          </div>
          ${mySalesHistory.slice().reverse().map(x => `
            <div class="table-row" style="grid-template-columns: 1.5fr 2.5fr 1fr 1.5fr; padding: 12px 16px;">
              <span data-label="Data / Hora"><small>${new Date(x.createdAt).toLocaleString('pt-BR')}</small></span>
              <span data-label="Produto Sold"><b>${esc(products().find(p => p.id === x.productId)?.name || 'Produto Removido')}</b></span>
              <span data-label="Quantidade">${x.quantity} un.</span>
              <span data-label="Total Vendido"><strong class="highlight-val">${money(x.total)}</strong></span>
            </div>
          `).join('')}
        </div>
      ` : '<div class="empty-state compact-empty"><strong>Nenhuma baixa registrada no histórico.</strong></div>'}
    </div>
  `;
}

function registerSale(ps) {
  const inputs = [...document.querySelectorAll('.baja-qty-input')];
  const chosen = inputs.map(i => ({ p: ps.find(p => p.id === i.dataset.id), q: Number(i.value) })).filter(x => x.q > 0);

  if (!chosen.length) return alert('Informe a quantidade vendida de pelo menos um produto para dar baixa.');
  if (chosen.some(x => x.q > x.p.stock)) return alert('A quantidade vendida não pode ultrapassar o estoque atual.');

  const totalSaleValue = chosen.reduce((a, x) => a + (x.q * x.p.price), 0);
  const totalItemsCount = chosen.reduce((a, x) => a + x.q, 0);

  const zeroingProducts = chosen.filter(x => x.q === x.p.stock);
  const zeroingNotice = zeroingProducts.length 
    ? ` Note que os seguintes produtos terão o estoque zerado e deixarão de ser exibidos na sua lista até a reposição: ${zeroingProducts.map(x => x.p.name).join(', ')}.`
    : '';

  confirmActionModal({
    title: 'Confirmar Baixas / Vendas do Dia',
    subtitle: `Total a computar: ${money(totalSaleValue)} (${totalItemsCount} itens)`,
    warningText: `Ao confirmar, estas unidades serão descontadas imediatamente do seu estoque em posse.${zeroingNotice}`,
    confirmText: 'Confirmar e Atualizar Estoque',
    onConfirm: () => {
      const pl = products();
      const sl = sales();

      chosen.forEach(x => {
        pl[pl.findIndex(p => p.id === x.p.id)].stock -= x.q;
        sl.push({
          id: uid(),
          sellerId: currentUser.id,
          productId: x.p.id,
          quantity: x.q,
          unitPrice: x.p.price,
          total: x.q * x.p.price,
          paidToSupervisor: false,
          createdAt: new Date().toISOString()
        });
      });

      write('atlasProducts', pl);
      write('atlasSales', sl);
      showToast('Vendas confirmadas e estoque atualizado!');
      renderSeller();
    }
  });
}

/* PAINEL DO ADMINISTRADOR GERAL */
function renderAdminHome() {
  const supers = allSupervisors();
  const ss = allSellers();

  appFrame('Visão Consolidada', 'Controle geral de supervisores e faturamento da operação com seleção de período.', `
    <div class="report-toolbar flex flex-wrap items-center justify-between gap-4 mb-6 p-4 glass-panel rounded-2xl">
      <div class="flex items-center gap-3">
        <span class="icon-wrap text-sky-600">${icons.calendar}</span>
        <div>
          <label class="font-extrabold text-xs text-slate-700 block">Período de Análise Financeira:</label>
          <select id="adminHomePeriod" class="control mt-1" style="min-width: 200px; background: #fff;">
            <option value="day">Hoje</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="month" selected>Este mês</option>
            <option value="year">Este ano</option>
          </select>
        </div>
      </div>
      <button id="pdfAdminHomeBtn" class="outline-btn">${icons.pdf} Gerar PDF Consolidado</button>
    </div>

    <div id="adminHomeStats"></div>

    <div class="panel glass-panel mt-6">
      <div class="panel-head flex-wrap gap-2">
        <div>
          <h2>Desempenho por Supervisor no Período</h2>
          <p>Valores totais comercializados pelos vendedores associados a cada supervisor.</p>
        </div>
      </div>
      <div id="adminSupervisorsRanking"></div>
    </div>
  `);

  const updateDashboard = () => {
    const period = document.getElementById('adminHomePeriod').value;
    const filteredSales = periodSales(null, period);
    const revenue = filteredSales.reduce((a, x) => a + x.total, 0);
    const totalQty = filteredSales.reduce((a, x) => a + x.quantity, 0);

    const statsContainer = document.getElementById('adminHomeStats');
    statsContainer.innerHTML = `
      <div class="stats-grid">
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Faturamento Período</span><span class="metric-icon cyan">${icons.dollar}</span></div>
          <div class="metric-value">${money(revenue)}</div>
          <div class="trend neutral">Total acumulado</div>
        </div>
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Itens Comercializados</span><span class="metric-icon green">${icons.check}</span></div>
          <div class="metric-value">${totalQty}</div>
          <div class="trend neutral">Baixas no período</div>
        </div>
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Supervisores Ativos</span><span class="metric-icon purple">${icons.users}</span></div>
          <div class="metric-value">${supers.length}</div>
          <div class="trend neutral">+ ADM Geral</div>
        </div>
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Total Vendedores</span><span class="metric-icon orange">${icons.products}</span></div>
          <div class="metric-value">${ss.length}</div>
          <div class="trend neutral">Em campo</div>
        </div>
      </div>
    `;

    const allSupervisingEntities = [
      { user: currentUser.user, name: `${currentUser.name} (ADM Geral)`, initials: currentUser.initials, role: 'ADMIN' },
      ...supers
    ];

    const rankingData = allSupervisingEntities.map(s => {
      const supSellers = ss.filter(v => v.supervisor.toLowerCase() === s.user.toLowerCase());
      const supSellerIds = supSellers.map(v => v.id);
      const sSales = filteredSales.filter(x => supSellerIds.includes(x.sellerId));
      const sRev = sSales.reduce((a, x) => a + x.total, 0);
      const sQty = sSales.reduce((a, x) => a + x.quantity, 0);

      return { s, supSellers, sRev, sQty };
    }).filter(item => item.supSellers.length > 0 || item.sRev > 0);

    const rankingContainer = document.getElementById('adminSupervisorsRanking');
    rankingContainer.innerHTML = `
      <div class="org-list">
        ${rankingData.sort((a, b) => b.sRev - a.sRev).map(item => `
          <div class="org-group" style="padding: 16px 0; border-bottom: 1px solid var(--glass-border);">
            <div class="org-supervisor flex items-center justify-between gap-3 mb-3">
              <div class="flex items-center gap-3">
                <span class="avatar mini">${avatarFor(item.s)}</span>
                <div>
                  <b class="text-base text-slate-900">${esc(item.s.name)}</b>
                  <span class="status-pill ml-2">${item.s.role === 'ADMIN' ? 'Administrador Geral' : 'Supervisor'}</span>
                  <small class="block text-slate-500">${item.supSellers.length} vendedor(es) associado(s)</small>
                </div>
              </div>
              <div class="text-right">
                <strong class="text-lg highlight-val block">${money(item.sRev)}</strong>
                <small class="text-xs text-slate-500">${item.sQty} un. vendidas no período</small>
              </div>
            </div>
            <div class="pl-6 border-l-2 border-slate-200 mt-2 space-y-2">
              ${item.supSellers.map(v => {
                const vSales = filteredSales.filter(x => x.sellerId === v.id);
                const vRev = vSales.reduce((a, x) => a + x.total, 0);
                const vQty = vSales.reduce((a, x) => a + x.quantity, 0);
                const vProds = products().filter(p => p.sellerId === v.id && p.stock > 0);
                const vStockVal = vProds.reduce((a, p) => a + (p.price * p.stock), 0);
                
                return `
                  <div class="org-seller flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50/70 rounded-lg border border-slate-100">
                    <div>
                      <b>${esc(v.name)}</b> <span class="text-slate-400">(@${esc(v.user)}) · ${esc(v.city)}/${esc(v.uf)}</span>
                    </div>
                    <div class="flex gap-4 items-center">
                      <span class="text-slate-500">Estoque: <b>${money(vStockVal)}</b></span>
                      <span class="font-bold text-sky-700">${money(vRev)} (${vQty} un)</span>
                    </div>
                  </div>
                `;
              }).join('') || '<div class="text-xs text-slate-400">Nenhum vendedor cadastrado sob este supervisor</div>'}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  document.getElementById('adminHomePeriod').onchange = updateDashboard;
  document.getElementById('pdfAdminHomeBtn').onclick = () => {
    const period = document.getElementById('adminHomePeriod').value;
    const filteredSales = periodSales(null, period);

    exportUniversalPDF({
      title: 'Relatório Geral por Supervisor',
      subtitle: `Visão Administrador Geral | Período: ${period}`,
      headers: ['Supervisor / Responsável', 'Vendedores', 'Itens Vendidos', 'Faturamento (R$)'],
      rows: [
        { user: currentUser.user, name: `${currentUser.name} (ADM Geral)` },
        ...supers
      ].map(s => {
        const supSellers = ss.filter(v => v.supervisor.toLowerCase() === s.user.toLowerCase());
        const supSellerIds = supSellers.map(v => v.id);
        const sSales = filteredSales.filter(x => supSellerIds.includes(x.sellerId));
        return [
          s.name,
          `${supSellers.length} vendedores`,
          `${sSales.reduce((a, x) => a + x.quantity, 0)} un.`,
          money(sSales.reduce((a, x) => a + x.total, 0))
        ];
      }),
      fileName: `buyclub-consolidado-supervisores-${period}.pdf`
    });
  };

  updateDashboard();
}

function renderAdminReportsPage() {
  const supers = allSupervisors();
  const allSupList = [{ user: currentUser.user, name: `${currentUser.name} (ADM Geral)` }, ...supers];

  appFrame('Relatórios Globais (ADM)', 'Consolidado de vendas de todos os supervisores e equipes.', `
    <div class="report-toolbar flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex gap-3 flex-wrap items-center">
        <label class="font-bold text-xs text-slate-700">
          Período
          <select id="adminReportPeriod" class="control mt-1">
            <option value="day">Hoje</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="month" selected>Este mês</option>
            <option value="year">Este ano</option>
          </select>
        </label>
        <label class="font-bold text-xs text-slate-700">
          Filtrar por Supervisor
          <select id="adminReportSupervisor" class="control mt-1">
            <option value="ALL">Todos os Supervisores</option>
            ${allSupList.map(s => `<option value="${s.user}">${esc(s.name)}</option>`).join('')}
          </select>
        </label>
      </div>
      <button id="downloadAdminPdf" class="primary-btn">${icons.pdf} Exportar PDF Global</button>
    </div>
    <div id="adminReportResult"></div>
  `);

  const update = () => {
    const period = document.getElementById('adminReportPeriod').value;
    const selectedSup = document.getElementById('adminReportSupervisor').value;

    let targetSellers = allSellers();
    if (selectedSup !== 'ALL') {
      targetSellers = targetSellers.filter(s => s.supervisor.toLowerCase() === selectedSup.toLowerCase());
    }

    const rows = targetSellers.map(s => {
      const xs = periodSales(s.id, period);
      return { s, xs, total: xs.reduce((a, x) => a + x.total, 0), qty: xs.reduce((a, x) => a + x.quantity, 0) };
    });

    const total = rows.reduce((a, x) => a + x.total, 0);
    const qty = rows.reduce((a, x) => a + x.qty, 0);

    document.getElementById('adminReportResult').innerHTML = `
      <div class="stats-grid report-stats mb-6">
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Faturamento Global</span><span class="metric-icon cyan">${icons.dollar}</span></div>
          <div class="metric-value">${money(total)}</div>
        </div>
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Unidades Vendidas</span><span class="metric-icon purple">${icons.check}</span></div>
          <div class="metric-value">${qty}</div>
        </div>
        <div class="metric-card glass-panel">
          <div class="metric-top"><span>Vendedores com Movimento</span><span class="metric-icon green">${icons.users}</span></div>
          <div class="metric-value">${rows.filter(x => x.qty > 0).length}</div>
        </div>
      </div>

      <div class="panel glass-panel">
        <div class="panel-head">
          <div><h2>Detalhamento por Vendedor</h2></div>
        </div>
        ${targetSellers.length ? `
          <div class="data-table">
            <div class="table-head" style="grid-template-columns: 1.8fr 1.5fr 1fr 1.2fr 1fr;">
              <span>Vendedor</span><span>Supervisor</span><span>Itens Vendidos</span><span>Faturamento Total</span><span>Estoque Atual</span>
            </div>
            ${rows.map(r => {
              const supObj = allSupList.find(x => x.user.toLowerCase() === r.s.supervisor.toLowerCase());
              return `
                <div class="table-row" style="grid-template-columns: 1.8fr 1.5fr 1fr 1.2fr 1fr;">
                  <span data-label="Vendedor"><b>${esc(r.s.name)}</b><small>${esc(r.s.city)} / ${esc(r.s.uf)}</small></span>
                  <span data-label="Supervisor"><small>${esc(supObj?.name || r.s.supervisor)}</small></span>
                  <span data-label="Itens">${r.qty} un.</span>
                  <span data-label="Faturamento"><strong class="highlight-val">${money(r.total)}</strong></span>
                  <span data-label="Estoque">${stock(r.s.id)} un.</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : '<div class="empty-state"><strong>Nenhum registro encontrado para este filtro.</strong></div>'}
      </div>
    `;
  };

  document.getElementById('adminReportPeriod').onchange = update;
  document.getElementById('adminReportSupervisor').onchange = update;
  document.getElementById('downloadAdminPdf').onclick = () => {
    const period = document.getElementById('adminReportPeriod').value;
    const selectedSup = document.getElementById('adminReportSupervisor').value;
    let targetSellers = allSellers();
    if (selectedSup !== 'ALL') targetSellers = targetSellers.filter(s => s.supervisor.toLowerCase() === selectedSup.toLowerCase());

    exportUniversalPDF({
      title: 'Relatório Global de Vendas ADM',
      subtitle: `Filtro Supervisor: ${selectedSup} | Período: ${period}`,
      headers: ['Vendedor', 'Supervisor', 'Cidade/UF', 'Itens Vendidos', 'Faturamento Total'],
      rows: targetSellers.map(s => {
        const xs = periodSales(s.id, period);
        const supObj = allSupList.find(x => x.user.toLowerCase() === s.supervisor.toLowerCase());
        return [
          s.name,
          supObj?.name || s.supervisor,
          `${s.city}/${s.uf}`,
          `${xs.reduce((a, x) => a + x.quantity, 0)} un.`,
          money(xs.reduce((a, x) => a + x.total, 0))
        ];
      }),
      fileName: `buyclub-relatorio-global-${period}.pdf`
    });
  };

  update();
}

function renderAdminUsers() {
  const supers = allSupervisors();
  const ss = allSellers();

  appFrame('Usuários e Acessos', 'Gerencie administradores, supervisores e acessos gerais.', `
    <div class="quick-grid">
      <button id="newSupervisor" class="quick-card glass-panel">
        <b>+ Criar supervisor</b>
        <span>Crie novas contas administrativas com gestão de equipe</span>
      </button>
      <button id="newAdminSeller" class="quick-card glass-panel">
        <b>+ Criar vendedor</b>
        <span>Associe diretamente um vendedor a qualquer supervisor ou ao ADM Geral</span>
      </button>
    </div>

    <div class="panel glass-panel mt-4">
      <div class="panel-head"><h2>Supervisores ativos</h2></div>
      <div class="data-table">
        <div class="table-head admin-head"><span>Supervisor</span><span>Login</span><span>Vendedores</span><span>Status</span></div>
        ${supers.map(s => `
          <div class="table-row admin-row">
            <span data-label="Supervisor"><b>${esc(s.name)}</b></span>
            <span data-label="Login">@${esc(s.user)}</span>
            <span data-label="Vendedores">${ss.filter(v => v.supervisor.toLowerCase() === s.user.toLowerCase()).length} membros</span>
            <span data-label="Status"><span class="status-pill">Ativo</span></span>
          </div>
        `).join('')}
      </div>
    </div>
  `);

  document.getElementById('newSupervisor').onclick = () => accountModal('supervisor');
  document.getElementById('newAdminSeller').onclick = () => adminSellerModal();
}

function accountModal(type) {
  const m = modal(`
    <h2>Criar supervisor</h2>
    <form id="entityForm" class="seller-form">
      <label>Nome<input name="name" class="control" required></label>
      <label>Login<input name="user" class="control" required></label>
      <label>Senha<input name="password" type="password" class="control" required></label>
      <label>Confirmar senha<input name="confirm" type="password" class="control" required></label>
      <div id="entityError" class="login-error"></div>
      <button type="button" id="triggerSaveSupervisor" class="primary-btn w-full mt-2">${icons.check} Criar Acesso</button>
    </form>
  `);

  m.querySelector('#triggerSaveSupervisor').onclick = () => {
    const form = m.querySelector('form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const f = new FormData(form);
    const u = String(f.get('user')).trim();

    if (f.get('password') !== f.get('confirm')) return m.querySelector('#entityError').textContent = 'As senhas não conferem.';
    if (allSupervisors().some(x => x.user.toLowerCase() === u.toLowerCase()) || allSellers().some(x => x.user.toLowerCase() === u.toLowerCase())) return m.querySelector('#entityError').textContent = 'Login já cadastrado.';

    confirmActionModal({
      title: 'Criar Novo Supervisor',
      subtitle: `Nome: ${f.get('name')}`,
      warningText: 'Confirmar criação de novo perfil administrativo de supervisor?',
      confirmText: 'Salvar Perfil',
      onConfirm: () => {
        const list = storedSupervisors();
        list.push({ id: uid(), name: f.get('name'), user: u, password: f.get('password'), initials: avatarFor({ name: f.get('name') }), role: 'SUPERVISOR' });
        write('atlasSupervisorAccounts', list);

        m.remove();
        renderAdminUsers();
        showToast('Supervisor criado com sucesso!');
      }
    });
  };
}

function adminSellerModal() {
  const supers = allSupervisors();
  const allSupOptions = [
    { user: currentUser.user, name: `${currentUser.name} (ADM Geral)` },
    ...supers
  ];

  const m = modal(`
    <h2>Criar vendedor</h2>
    <form id="entityForm" class="seller-form">
      <label>Nome<input name="name" class="control" required></label>
      <label>Login<input name="user" class="control" required></label>
      <label>Senha<input name="password" type="password" class="control" required></label>
      <label>Confirmar senha<input name="confirm" type="password" class="control" required></label>
      <label>Supervisor responsável
        <select name="supervisor" class="control" required>
          ${allSupOptions.map(s => `<option value="${s.user}">${esc(s.name)} (@${esc(s.user)})</option>`).join('')}
        </select>
      </label>
      <div class="form-grid">
        <label>Estado
          <select name="uf" id="adminUfSelect" class="control" required>
            <option value="">Selecione o Estado</option>
            ${brazilStatesList.map(u => `<option value="${u}">${u}</option>`).join('')}
          </select>
        </label>
        <label>Cidade
          <select name="city" id="adminCitySelect" class="control" required>
            <option value="">Selecione o estado primeiro</option>
          </select>
        </label>
      </div>
      <label>WhatsApp<input name="whatsapp" class="control" placeholder="5541999999999"></label>
      <div id="entityError" class="login-error"></div>
      <button type="button" id="triggerAdminSaveSeller" class="primary-btn w-full mt-2">${icons.check} Criar Vendedor</button>
    </form>
  `);

  const adminUfSelect = m.querySelector('#adminUfSelect');
  const adminCitySelect = m.querySelector('#adminCitySelect');

  adminUfSelect.onchange = () => {
    fetchCitiesForRegion('BR', adminUfSelect.value, adminCitySelect);
  };

  m.querySelector('#triggerAdminSaveSeller').onclick = () => {
    const form = m.querySelector('form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const f = new FormData(form);
    const u = String(f.get('user')).trim();

    if (f.get('password') !== f.get('confirm')) return m.querySelector('#entityError').textContent = 'As senhas não conferem.';
    if (allSupervisors().some(x => x.user.toLowerCase() === u.toLowerCase()) || allSellers().some(x => x.user.toLowerCase() === u.toLowerCase())) return m.querySelector('#entityError').textContent = 'Login já cadastrado.';

    confirmActionModal({
      title: 'Criar Novo Vendedor',
      subtitle: `Nome: ${f.get('name')}`,
      warningText: 'Confirmar cadastro do vendedor e atribuição ao supervisor selecionado?',
      confirmText: 'Salvar Cadastro',
      onConfirm: () => {
        const s = {
          id: uid(), name: f.get('name'), user: u, password: f.get('password'),
          initials: avatarFor({ name: f.get('name') }), role: 'SELLER', supervisor: f.get('supervisor'),
          uf: String(f.get('uf')).toUpperCase(), city: f.get('city'),
          whatsapp: String(f.get('whatsapp')).replace(/\D/g, ''), lat: null, lng: null
        };

        const list = allSellers();
        list.push(s);
        write('atlasSellers', list);

        const ac = read('atlasSellerAccounts');
        ac.push(s);
        write('atlasSellerAccounts', ac);

        m.remove();
        renderAdminUsers();
        showToast('Vendedor cadastrado!');
      }
    });
  };
}

function renderProfile() {
  const isSeller = currentUser.role === 'SELLER';
  const isGeneral = currentUser.user.toLowerCase() === 'adm';
  const supervisor = isSeller ? allSupervisors().find(s => s.user.toLowerCase() === currentUser.supervisor.toLowerCase()) : null;

  appFrame('Meus Dados', 'Atualize suas credenciais e dados cadastrais.', `
    <div class="profile-layout">
      <div class="profile-hero glass-panel">
        <div class="profile-avatar">${avatarFor(currentUser)}</div>
        <h2>${esc(currentUser.name)}</h2>
        <p>${isGeneral ? 'Administrador geral' : isSeller ? 'Vendedor' : 'Supervisor'} · @${esc(currentUser.user)}</p>
        ${supervisor ? `<span>Supervisor responsável: <b>${esc(supervisor.name)}</b></span>` : ''}
      </div>

      <div class="panel profile-form-panel glass-panel">
        <div class="panel-head"><div><h2>Editar informações</h2></div></div>
        <form id="profileForm" class="seller-form profile-form">
          <label>Nome completo<input name="name" class="control" value="${esc(currentUser.name)}" required></label>
          <label>WhatsApp<input name="whatsapp" class="control" value="${esc(currentUser.whatsapp)}" placeholder="5541999999999"></label>
          <label>Nova senha<input name="password" type="password" class="control" placeholder="Deixe em branco para manter"></label>
          <label>Confirmar nova senha<input name="confirm" type="password" class="control"></label>
          <div id="profileError" class="login-error"></div>
          <button type="button" id="triggerSaveProfile" class="primary-btn mt-2">${icons.check} Salvar Alterações</button>
        </form>
      </div>
    </div>
  `);

  document.getElementById('triggerSaveProfile').onclick = () => {
    const form = document.getElementById('profileForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const f = new FormData(form);
    if (f.get('password') !== f.get('confirm')) return document.getElementById('profileError').textContent = 'As senhas não conferem.';

    confirmActionModal({
      title: 'Salvar Dados do Perfil',
      subtitle: `Usuário: @${currentUser.user}`,
      warningText: 'Tem certeza que deseja atualizar suas credenciais de acesso?',
      confirmText: 'Confirmar e Salvar',
      onConfirm: () => {
        currentUser.name = f.get('name');
        currentUser.whatsapp = String(f.get('whatsapp')).replace(/\D/g, '');
        if (f.get('password')) currentUser.password = f.get('password');

        if (isGeneral) {
          write('atlasGeneralAdmin', [currentUser]);
        } else if (isSeller) {
          const list = read('atlasSellerAccounts');
          const i = list.findIndex(x => x.user.toLowerCase() === currentUser.user.toLowerCase());
          if (i >= 0) list[i] = currentUser;
          write('atlasSellerAccounts', list);

          const ss = allSellers();
          const si = ss.findIndex(x => x.user.toLowerCase() === currentUser.user.toLowerCase());
          if (si >= 0) {
            ss[si] = { ...ss[si], name: currentUser.name, whatsapp: currentUser.whatsapp, password: currentUser.password };
            write('atlasSellers', ss);
          }
        } else {
          const list = read('atlasSupervisorProfiles');
          const i = list.findIndex(x => x.user.toLowerCase() === currentUser.user.toLowerCase());
          i >= 0 ? list[i] = currentUser : list.push(currentUser);
          write('atlasSupervisorProfiles', list);

          const stored = storedSupervisors();
          const si = stored.findIndex(x => x.user.toLowerCase() === currentUser.user.toLowerCase());
          if (si >= 0) {
            stored[si] = { ...stored[si], ...currentUser };
            write('atlasSupervisorAccounts', stored);
          }
        }

        showToast('Dados atualizados com sucesso');
        renderProfile();
      }
    });
  };
}

function emergencyWipe() {
  const m = modal(`
    <div class="emergency-box text-center p-2">
      <div class="emergency-symbol text-red-600 my-2 flex justify-center">${icons.emergency}</div>
      <h2>Botão de Emergência</h2>
      <p class="warning-copy my-3" style="color: var(--text-secondary); font-size: 13px;">
        <b>Atenção: todos os dados locais serão excluídos.</b><br>
        Isso apagará vendedores, movimentações de vendas e histórico do navegador.
      </p>
      <form id="wipeForm" class="seller-form">
        <label>Senha de supervisor para confirmação
          <input name="password" type="password" class="control" required placeholder="Digite a senha do supervisor">
        </label>
        <div id="wipeError" class="login-error"></div>
        <div class="confirm-actions flex justify-end gap-2 mt-3">
          <button type="button" class="outline-btn cancel-wipe">Cancelar</button>
          <button class="delete-btn" type="submit">Confirmar Exclusão</button>
        </div>
      </form>
    </div>
  `);

  m.querySelector('.cancel-wipe').onclick = () => m.remove();
  m.querySelector('form').onsubmit = e => {
    e.preventDefault();
    const pass = new FormData(e.target).get('password');
    if (!supervisors.some(s => s.password === pass)) {
      m.querySelector('#wipeError').textContent = 'Senha de supervisor incorreta.';
      return;
    }
    if (!confirm('Confirma novamente a exclusão irreversível dos dados?')) return;

    ['atlasSellers', 'atlasSellerAccounts', 'atlasProducts', 'atlasSales', 'atlasOrders', 'atlasCustomCatalog'].forEach(k => localStorage.removeItem(k));
    m.remove();
    activeTab = 'summary';
    renderSupervisor();
    showToast('Dados do navegador reiniciados');
  };
}

/* Inicialização DOM */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.onsubmit = e => {
      e.preventDefault();
      const u = document.getElementById('loginUser').value.trim();
      const p = document.getElementById('loginPassword').value;
      const adminGeneral = (read('atlasGeneralAdmin', [generalAdmin])[0] || generalAdmin);
      const allUsers = [adminGeneral, ...allSupervisors(), ...read('atlasSellerAccounts')];
      
      const account = allUsers.find(x => x.user.toLowerCase() === u.toLowerCase() && x.password === p);

      if (!account) {
        document.getElementById('loginError').textContent = 'Usuário ou senha inválidos.';
        return;
      }
      login(account);
    };
  }

  const toggleBtn = document.getElementById('togglePassword');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      const input = document.getElementById('loginPassword');
      input.type = input.type === 'password' ? 'text' : 'password';
      toggleBtn.textContent = input.type === 'password' ? 'Mostrar' : 'Ocultar';
    };
  }
});

document.addEventListener('click', e => {
  if (e.target.closest('#emergencyBtn')) emergencyWipe();
});
