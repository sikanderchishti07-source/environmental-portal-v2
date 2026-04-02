// ════════════════════════════════════════════════════════════
//  AECON Client Portal — Frontend Integration Script
//  Drop this into your HTML just before </body>
//  Replace the existing portal JS with this.
//
//  SETUP: Change PORTAL_API_BASE to your backend server URL.
// ════════════════════════════════════════════════════════════

const PORTAL_API_BASE = 'https://YOUR-SERVER.com';  // ← CHANGE THIS

// ── Utility: format date nicely ─────────────────────────────
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-SA', {
    year: 'numeric', month: 'short', day: '2-digit'
  });
}

// ── Utility: report type label ───────────────────────────────
const REPORT_TYPE_MAP = {
  ambient_air:    '💨 Ambient Air Quality',
  stack_emission: '🏭 Stack Emission Testing',
  indoor_air:     '🏢 Indoor Air Quality',
  eia:            '🌍 Environmental Impact Assessment',
  water_soil:     '💧 Water & Soil Analysis',
  emp:            '📋 Environmental Management Plan',
  noise:          '🔊 Noise Monitoring',
  other:          '📄 Other Report'
};

const STATUS_CLASS = {
  compliant:   'status-complete',
  exceedance:  'status-review',
  marginal:    'status-progress',
  pending:     'status-progress'
};

const STATUS_LABEL = {
  compliant:  'Compliant ✅',
  exceedance: 'Exceedance ⚠️',
  marginal:   'Marginal 🟡',
  pending:    'Pending Review'
};

// ── Session: store logged-in client in sessionStorage ─────────
function saveSession(clientData) {
  sessionStorage.setItem('aecon_client', JSON.stringify(clientData));
}
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('aecon_client')); }
  catch { return null; }
}
function clearSession() {
  sessionStorage.removeItem('aecon_client');
}

// ── Portal open/close ─────────────────────────────────────────
window.openPortal = function () {
  document.getElementById('portalModal').classList.add('active');
  const session = getSession();
  if (session) {
    // Already logged in — go straight to dashboard
    showPortalDashboard(session);
  } else {
    showPortalLogin();
  }
};

// ── Login UI ──────────────────────────────────────────────────
function showPortalLogin() {
  document.getElementById('portalLogin').classList.remove('hidden');
  document.getElementById('portalDashboard').classList.add('hidden');
  renderLoginForm();
}

function renderLoginForm() {
  const loginDiv = document.getElementById('portalLogin');
  loginDiv.innerHTML = `
    <div class="p-10">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-aecon-dark to-aecon-accent rounded-xl flex items-center justify-center text-white font-bold text-xl">A</div>
          <div>
            <h2 class="text-2xl font-bold text-aecon-dark">Client Portal</h2>
            <p class="text-sm text-gray-500">Secure access to your project reports</p>
          </div>
        </div>
        <button onclick="closeModal('portalModal')" class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
          <i class="fas fa-times text-gray-500"></i>
        </button>
      </div>
      <div class="max-w-md mx-auto">
        <div class="bg-aecon-light rounded-2xl p-8">
          <h3 class="text-xl font-bold text-aecon-dark mb-2 text-center">Sign In to Your Account</h3>
          <p class="text-sm text-center text-gray-500 mb-6">Enter the unique Client ID provided by AECON</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1">Client ID</label>
              <input
                type="text"
                id="portalClientIdInput"
                placeholder="e.g. DIR-SAS-001"
                maxlength="20"
                style="text-transform:uppercase;letter-spacing:0.06em;font-family:'JetBrains Mono',monospace;font-size:1rem;"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-aecon-primary focus:ring-2 focus:ring-aecon-primary/20 outline-none transition-all bg-white text-center font-bold tracking-widest"
                onkeydown="if(event.key==='Enter') doPortalLogin()"
                oninput="this.value=this.value.toUpperCase();clearLoginError()"
              />
              <p id="login-error" class="text-sm text-red-500 mt-2 text-center hidden"></p>
            </div>
            <button id="portal-login-btn" onclick="doPortalLogin()" class="w-full py-3 bg-aecon-dark text-white rounded-xl font-bold hover:bg-aecon-accent transition-all flex items-center justify-center gap-2">
              <i class="fas fa-sign-in-alt"></i> Access My Reports
            </button>
            <p class="text-center text-xs text-gray-400">
              Don't have an ID? <a href="#contact" onclick="closeModal('portalModal')" class="text-aecon-primary hover:underline">Contact AECON</a>
            </p>
          </div>
        </div>
      </div>
    </div>`;
}

function clearLoginError() {
  const err = document.getElementById('login-error');
  if (err) err.classList.add('hidden');
}

function showLoginError(msg) {
  const err = document.getElementById('login-error');
  if (!err) return;
  err.textContent = msg;
  err.classList.remove('hidden');
  // Shake animation on input
  const inp = document.getElementById('portalClientIdInput');
  if (inp) {
    inp.style.borderColor = '#ef4444';
    inp.style.animation = 'portalShake 0.4s ease';
    setTimeout(() => { inp.style.animation = ''; inp.style.borderColor = ''; }, 500);
  }
}

// ── Inject shake keyframe once ────────────────────────────────
(function injectShakeStyle() {
  if (document.getElementById('portal-shake-style')) return;
  const style = document.createElement('style');
  style.id = 'portal-shake-style';
  style.textContent = `
    @keyframes portalShake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-6px)}
      40%{transform:translateX(6px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }
    .portal-report-card {
      background:#fff;border-radius:16px;border:1px solid rgba(15,61,62,.1);
      padding:20px 22px;transition:all .25s ease;box-shadow:0 2px 12px rgba(15,61,62,.06);
    }
    .portal-report-card:hover {
      transform:translateY(-3px);box-shadow:0 10px 30px rgba(15,61,62,.13);border-color:rgba(45,138,138,.25);
    }
    .portal-meas-chip {
      display:inline-flex;flex-direction:column;align-items:center;
      padding:8px 14px;border-radius:10px;background:#f0f7f6;border:1px solid rgba(45,138,138,.15);
      min-width:80px;
    }
    .portal-meas-chip .chip-val{font-size:1rem;font-weight:800;color:#0f3d3e;line-height:1}
    .portal-meas-chip .chip-lbl{font-size:.6rem;color:#5a7a6a;margin-top:3px;letter-spacing:.04em;text-transform:uppercase}
  `;
  document.head.appendChild(style);
})();

// ── Main login function ───────────────────────────────────────
async function doPortalLogin() {
  const inputEl = document.getElementById('portalClientIdInput');
  const btnEl   = document.getElementById('portal-login-btn');
  if (!inputEl || !btnEl) return;

  const clientId = inputEl.value.trim().toUpperCase();
  if (!clientId) { showLoginError('Please enter your Client ID.'); return; }
  if (!/^[A-Z]{2,6}-[A-Z]{2,6}-\d{3}$/.test(clientId)) {
    showLoginError('Invalid format. Client IDs look like DIR-SAS-001');
    return;
  }

  // Loading state
  btnEl.disabled = true;
  btnEl.innerHTML = '<span style="width:16px;height:16px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite"></span> Verifying…';

  try {
    const response = await fetch(`${PORTAL_API_BASE}/api/clients/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId })
    });
    const data = await response.json();

    if (!response.ok || !data.valid) {
      showLoginError(data.message || 'Client ID not found. Please check and try again.');
      btnEl.disabled = false;
      btnEl.innerHTML = '<i class="fas fa-sign-in-alt"></i> Access My Reports';
      return;
    }

    // Success — save session and load dashboard
    saveSession(data.client);
    await showPortalDashboard(data.client);

  } catch (err) {
    showLoginError('Connection error. Please try again or contact AECON.');
    console.error('[Portal Login]', err);
    btnEl.disabled = false;
    btnEl.innerHTML = '<i class="fas fa-sign-in-alt"></i> Access My Reports';
  }
}

// ── Dashboard ─────────────────────────────────────────────────
async function showPortalDashboard(client) {
  document.getElementById('portalLogin').classList.add('hidden');
  document.getElementById('portalDashboard').classList.remove('hidden');

  // Inject dashboard HTML (matching existing design)
  document.getElementById('portalDashboard').innerHTML = `
    <div class="flex h-[640px]">
      <!-- Sidebar -->
      <div class="w-60 bg-gray-50 border-r p-5 flex flex-col gap-1 flex-shrink-0">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-br from-aecon-dark to-aecon-accent rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <div>
            <p class="font-bold text-sm text-aecon-dark">AECON Portal</p>
            <p class="text-xs text-gray-400 font-mono">${client.clientId}</p>
          </div>
        </div>
        <div class="portal-sidebar-item active" onclick="showPortalSection('overview',this)"><i class="fas fa-th-large w-4"></i> Overview</div>
        <div class="portal-sidebar-item" onclick="showPortalSection('reports',this)"><i class="fas fa-file-pdf w-4"></i> Reports</div>
        <div class="portal-sidebar-item" onclick="showPortalSection('compliance',this)"><i class="fas fa-shield-alt w-4"></i> Compliance</div>
        <div class="mt-auto portal-sidebar-item text-red-500" onclick="doPortalLogout()"><i class="fas fa-sign-out-alt w-4"></i> Logout</div>
      </div>
      <!-- Content area -->
      <div class="flex-1 overflow-y-auto p-7 relative">
        <button onclick="closeModal('portalModal')" class="absolute top-5 right-5 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 z-10">
          <i class="fas fa-times text-gray-500"></i>
        </button>
        <div id="portal-content-area">
          <!-- Loaded dynamically -->
        </div>
      </div>
    </div>`;

  // Load overview by default
  await renderPortalOverview(client);
}

// ── Overview ─────────────────────────────────────────────────
async function renderPortalOverview(client) {
  const area = document.getElementById('portal-content-area');
  area.innerHTML = `<div style="text-align:center;padding:40px"><span style="width:20px;height:20px;border:2px solid #e5e7eb;border-top-color:#0f3d3e;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite"></span></div>`;

  const reports = await fetchReports(client.clientId);
  const recent  = reports.slice(0, 3);
  const compliant   = reports.filter(r => r.overallStatus === 'compliant').length;
  const exceedances = reports.filter(r => r.overallStatus === 'exceedance').length;

  area.innerHTML = `
    <h2 class="text-2xl font-bold text-aecon-dark mb-1">Welcome, ${client.companyName}</h2>
    <p class="text-gray-500 text-sm mb-6" style="font-family:'JetBrains Mono',monospace">Client ID: ${client.clientId} · Last login: ${client.lastLogin ? fmtDate(client.lastLogin) : 'First time'}</p>
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-aecon-light rounded-2xl p-5 text-center">
        <p class="text-3xl font-bold text-aecon-dark">${reports.length}</p>
        <p class="text-sm text-gray-600 mt-1">Total Reports</p>
      </div>
      <div class="bg-green-50 rounded-2xl p-5 text-center">
        <p class="text-3xl font-bold text-green-700">${compliant}</p>
        <p class="text-sm text-gray-600 mt-1">Compliant</p>
      </div>
      <div class="bg-${exceedances > 0 ? 'red' : 'gray'}-50 rounded-2xl p-5 text-center">
        <p class="text-3xl font-bold text-${exceedances > 0 ? 'red-600' : 'gray-500'}">${exceedances}</p>
        <p class="text-sm text-gray-600 mt-1">Exceedances</p>
      </div>
    </div>
    <h3 class="font-bold text-aecon-dark mb-3">Recent Reports</h3>
    ${recent.length ? recent.map(r => buildReportMiniCard(r)).join('') : '<p class="text-gray-400 text-sm">No reports available yet.</p>'}
    ${reports.length > 3 ? `<button onclick="showPortalSection('reports')" class="mt-4 text-sm font-semibold text-aecon-primary hover:underline">View all ${reports.length} reports →</button>` : ''}`;
}

function buildReportMiniCard(r) {
  return `<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2 cursor-pointer hover:bg-aecon-light transition-all" onclick="openReportDetail('${r._id}')">
    <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:linear-gradient(135deg,#e8f4f4,#d0eaea)">
      <i class="fas fa-file-pdf text-aecon-primary text-sm"></i>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-gray-800 truncate">${r.reportTitle}</p>
      <p class="text-xs text-gray-400">${fmtDate(r.serviceDate)} · ${r.location}</p>
    </div>
    <span class="status-badge ${STATUS_CLASS[r.overallStatus] || 'status-progress'}">${STATUS_LABEL[r.overallStatus] || r.overallStatus}</span>
  </div>`;
}

// ── Reports list ─────────────────────────────────────────────
async function renderPortalReports(client) {
  const area = document.getElementById('portal-content-area');
  area.innerHTML = `<h2 class="text-2xl font-bold text-aecon-dark mb-6">All Reports</h2><div id="reports-loading" style="text-align:center;padding:40px"><span style="width:20px;height:20px;border:2px solid #e5e7eb;border-top-color:#0f3d3e;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite"></span></div>`;

  const reports = await fetchReports(client.clientId);
  document.getElementById('reports-loading').remove();

  if (!reports.length) {
    area.innerHTML += '<p class="text-gray-400 text-sm">No published reports yet. AECON will upload them within 3–4 days of site work.</p>';
    return;
  }

  area.innerHTML += reports.map(r => buildFullReportCard(r)).join('');
}

function buildFullReportCard(r) {
  const hasPDF    = r.files?.pdfReport;
  const hasImages = (r.files?.stationImages?.length || r.files?.noiseImages?.length || r.files?.coordinateImages?.length);
  const measHtml  = buildMeasurements(r.measurements);

  return `<div class="portal-report-card mb-4">
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="text-xs font-semibold text-gray-400 font-mono">${r.projectRef || r._id?.slice(-8)}</span>
          <span class="status-badge ${STATUS_CLASS[r.overallStatus] || 'status-progress'}">${STATUS_LABEL[r.overallStatus] || r.overallStatus}</span>
        </div>
        <h4 class="font-bold text-aecon-dark text-base">${r.reportTitle}</h4>
        <p class="text-xs text-gray-400 mt-1">${REPORT_TYPE_MAP[r.reportType] || r.reportType} · ${r.location} · Service: ${fmtDate(r.serviceDate)} · Issued: ${fmtDate(r.reportDate)}</p>
      </div>
      ${hasPDF ? `<a href="${PORTAL_API_BASE}${r.files.pdfReport}" target="_blank" download class="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-aecon-dark text-white text-xs rounded-lg hover:bg-aecon-accent transition-all font-bold">
        <i class="fas fa-download"></i> PDF Report
      </a>` : '<span class="text-xs text-gray-300 flex-shrink-0">PDF coming soon</span>'}
    </div>
    ${measHtml ? `<div class="flex flex-wrap gap-2 mb-3">${measHtml}</div>` : ''}
    ${r.summary ? `<p class="text-xs text-gray-500 leading-relaxed mb-3">${r.summary}</p>` : ''}
    ${r.complianceStandard ? `<p class="text-xs text-gray-400"><i class="fas fa-clipboard-check mr-1 text-aecon-accent"></i>Standard: ${r.complianceStandard}</p>` : ''}
    ${hasImages ? `<div class="flex gap-2 mt-3 flex-wrap">
      ${(r.files.stationImages||[]).slice(0,3).map(img => `<img src="${PORTAL_API_BASE}${img}" alt="Station" class="w-16 h-16 object-cover rounded-lg border border-gray-100 cursor-pointer hover:scale-105 transition-transform" onclick="openImg('${PORTAL_API_BASE}${img}')"/>`).join('')}
      ${(r.files.noiseImages||[]).slice(0,2).map(img => `<img src="${PORTAL_API_BASE}${img}" alt="Noise" class="w-16 h-16 object-cover rounded-lg border border-gray-100 cursor-pointer hover:scale-105 transition-transform" onclick="openImg('${PORTAL_API_BASE}${img}')"/>`).join('')}
      ${(r.files.coordinateImages||[]).slice(0,2).map(img => `<img src="${PORTAL_API_BASE}${img}" alt="Coordinates" class="w-16 h-16 object-cover rounded-lg border border-gray-100 cursor-pointer hover:scale-105 transition-transform" onclick="openImg('${PORTAL_API_BASE}${img}')"/>`).join('')}
    </div>` : ''}
  </div>`;
}

function buildMeasurements(m) {
  if (!m) return '';
  const keys = { pm25:'PM2.5', pm10:'PM10', no2:'NO₂', so2:'SO₂', co:'CO', noise:'Noise dB(A)' };
  return Object.entries(keys)
    .filter(([k]) => m[k]?.value !== undefined)
    .map(([k, label]) => `<div class="portal-meas-chip"><span class="chip-val">${m[k].value}</span><span class="chip-lbl">${label}</span></div>`)
    .join('');
}

function openImg(url) {
  window.open(url, '_blank');
}

// ── Compliance section ────────────────────────────────────────
async function renderPortalCompliance(client) {
  const reports = await fetchReports(client.clientId);
  const exceedances = reports.filter(r => r.overallStatus === 'exceedance');
  const compliant   = reports.filter(r => r.overallStatus === 'compliant');

  document.getElementById('portal-content-area').innerHTML = `
    <h2 class="text-2xl font-bold text-aecon-dark mb-6">Compliance Overview</h2>
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-green-50 border border-green-200 rounded-2xl p-5">
        <div class="flex items-center gap-3 mb-2">
          <i class="fas fa-check-circle text-green-500 text-xl"></i>
          <span class="font-bold text-green-700">${compliant.length} Compliant Report${compliant.length!==1?'s':''}</span>
        </div>
        <p class="text-xs text-gray-500">All parameters within ${reports[0]?.complianceStandard || 'NCEC SAAQS'} limits</p>
      </div>
      <div class="bg-${exceedances.length ? 'red' : 'gray'}-50 border border-${exceedances.length ? 'red' : 'gray'}-200 rounded-2xl p-5">
        <div class="flex items-center gap-3 mb-2">
          <i class="fas fa-exclamation-circle text-${exceedances.length ? 'red-500' : 'gray-400'} text-xl"></i>
          <span class="font-bold text-${exceedances.length ? 'red-700' : 'gray-400'}">${exceedances.length} Exceedance${exceedances.length!==1?'s':''}</span>
        </div>
        <p class="text-xs text-gray-500">${exceedances.length ? 'Contact AECON for remediation guidance' : 'No exceedances recorded'}</p>
      </div>
    </div>
    <div class="space-y-3">
      ${reports.map(r => `
        <div class="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#e8f4f4,#d0eaea)">
            <i class="fas fa-file-pdf text-aecon-primary text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-800 text-sm truncate">${r.reportTitle}</p>
            <p class="text-xs text-gray-400">${fmtDate(r.serviceDate)} · ${r.complianceStandard || 'NCEC SAAQS'}</p>
          </div>
          <span class="status-badge ${STATUS_CLASS[r.overallStatus] || 'status-progress'}">${STATUS_LABEL[r.overallStatus] || r.overallStatus}</span>
          ${r.files?.pdfReport ? `<a href="${PORTAL_API_BASE}${r.files.pdfReport}" target="_blank" download class="px-3 py-1.5 bg-aecon-dark text-white text-xs rounded-lg hover:bg-aecon-accent transition font-bold flex items-center gap-1"><i class="fas fa-download"></i> PDF</a>` : ''}
        </div>`).join('') || '<p class="text-gray-400 text-sm p-4">No reports available yet.</p>'}
    </div>`;
}

// ── Fetch reports from API ────────────────────────────────────
async function fetchReports(clientId) {
  try {
    const response = await fetch(`${PORTAL_API_BASE}/api/reports/${clientId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.reports || [];
  } catch (err) {
    console.error('[fetchReports]', err);
    return [];
  }
}

// ── Section switching ─────────────────────────────────────────
window.showPortalSection = async function (name, el) {
  // Update sidebar active
  document.querySelectorAll('.portal-sidebar-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');

  const client = getSession();
  if (!client) { doPortalLogout(); return; }

  switch (name) {
    case 'overview':   await renderPortalOverview(client);  break;
    case 'reports':    await renderPortalReports(client);   break;
    case 'compliance': await renderPortalCompliance(client); break;
  }
};

// ── Logout ────────────────────────────────────────────────────
window.doPortalLogout = function () {
  clearSession();
  document.getElementById('portalDashboard').classList.add('hidden');
  document.getElementById('portalLogin').classList.remove('hidden');
  renderLoginForm();
};

// Alias for existing references in HTML
window.doLogout = window.doPortalLogout;
window.doLogin  = doPortalLogin;
