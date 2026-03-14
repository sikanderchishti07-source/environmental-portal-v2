<script>
const CONFIG = {
  GNEWS_API_KEY: 'YOUR_GNEWS_API_KEY', // ← paste your real GNews key here
  ARTICLE_COUNT: 6,
  REFRESH_MS:    45 * 60 * 1000,
};

// ── Topic-relevant images (reliable, always load) ───────────────────────────
// Each category has 3 images so cards within the same topic get variety
const TOPIC_IMAGES = {
  air: [
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80', // smog/haze city
    'https://images.unsplash.com/photo-1569952266837-07ce4f964a5e?w=800&q=80', // factory emissions
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', // air pollution
  ],
  water: [
    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80', // ocean/sea
    'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80', // desalination/water
    'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=80', // coral reef
  ],
  climate: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', // earth/atmosphere
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80', // drought/cracked earth
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', // climate landscape
  ],
  energy: [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80', // solar panels
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80', // wind turbines
    'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&q=80', // renewable energy
  ],
  green: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', // reforestation/trees
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80', // green nature
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80', // forest green
  ],
  desert: [
    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80', // saudi/desert
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80', // middle east desert
    'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&q=80', // arid landscape
  ],
  regulation: [
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80', // document/law
    'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80', // government/policy
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', // meeting/compliance
  ],
  default: [
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80', // earth from space
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', // mountain nature
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80', // environment general
  ],
};

const CATEGORIES = {
  'air':        { label: '💨 Air Quality',    bg: 'rgba(26,92,160,0.13)',  color: '#1a5ca0', imgKey: 'air' },
  'water':      { label: '💧 Water',          bg: 'rgba(26,92,160,0.11)',  color: '#1a6ca0', imgKey: 'water' },
  'climate':    { label: '🌡 Climate',        bg: 'rgba(160,80,20,0.11)',  color: '#a05014', imgKey: 'climate' },
  'energy':     { label: '⚡ Energy',         bg: 'rgba(31,107,82,0.13)', color: '#1f6b52', imgKey: 'energy' },
  'regulation': { label: '📋 Regulation',     bg: 'rgba(31,107,82,0.11)', color: '#2a6e54', imgKey: 'regulation' },
  'green':      { label: '🌱 Sustainability', bg: 'rgba(31,107,82,0.13)', color: '#1f6b52', imgKey: 'green' },
  'default':    { label: '🌍 Environment',    bg: 'rgba(31,107,82,0.10)', color: '#1f6b52', imgKey: 'default' },
};

const FALLBACK_ARTICLES = [
  { title: 'Saudi Arabia Expands National Air Quality Monitoring Network Under Vision 2030', description: 'NCEC has commissioned 28 new ambient air quality stations across Jubail, Yanbu, Riyadh, and Dammam industrial zones measuring PM2.5, PM10, NO2 and SO2 in real-time.', url: 'https://ncec.gov.sa', source: { name: 'NCEC Saudi Arabia' }, publishedAt: new Date().toISOString(), image: null },
  { title: 'Saudi Green Initiative Surpasses 1 Billion Tree Planting Milestone Ahead of Schedule', description: "Saudi Arabia's afforestation programme has exceeded its first-year target with seedlings planted in desertification-prone areas across Tabuk, Al Qassim, and the Eastern Province.", url: 'https://www.greeninitiatives.gov.sa', source: { name: 'Saudi Green Initiative' }, publishedAt: new Date(Date.now()-86400000).toISOString(), image: null },
  { title: 'Red Sea Global Secures Environmental Clearance for Phase Two Coastal Development', description: 'Red Sea Global secured EIA approvals for the second development phase incorporating marine protected area protocols and coral reef preservation along the northwestern coastline.', url: 'https://www.redseaglobal.com', source: { name: 'Red Sea Global' }, publishedAt: new Date(Date.now()-172800000).toISOString(), image: null },
  { title: 'WHO Air Quality Guidelines Prompt GCC Nations to Review Industrial Emission Standards', description: 'Environmental regulators across the GCC are aligning national emission thresholds with updated WHO air quality parameters, with Saudi Arabia and UAE leading regional compliance taskforces.', url: 'https://www.arabnews.com', source: { name: 'Arab News' }, publishedAt: new Date(Date.now()-259200000).toISOString(), image: null },
  { title: 'NEOM Unveils Zero-Carbon Desalination Plant Powered by Solar and Wind', description: "NEOM unveiled plans for the world's largest renewable-powered desalination facility, set to supply 100 million litres of potable water daily with zero carbon footprint.", url: 'https://www.neom.com', source: { name: 'NEOM' }, publishedAt: new Date(Date.now()-345600000).toISOString(), image: null },
  { title: 'Aramco Reports 23% Reduction in Operational Carbon Intensity Ahead of 2030 Target', description: "Saudi Aramco's latest sustainability report documents significant decarbonisation progress with methane intensity at a historic low and carbon capture at full operational capacity.", url: 'https://www.aramco.com/en/sustainability', source: { name: 'Saudi Aramco' }, publishedAt: new Date(Date.now()-432000000).toISOString(), image: null },
];

let allArticles = [], activeFilter = 'all', refreshTimer = null, countdownTimer = null, nextRefresh = null;

// ── Detect category from article text ───────────────────────────────────────
function getCategory(a) {
  const t = ((a.title || '') + ' ' + (a.description || '')).toLowerCase();
  if (t.includes('air') || t.includes('pm2.5') || t.includes('pm10') || t.includes('smog') || t.includes('emission')) return CATEGORIES['air'];
  if (t.includes('water') || t.includes('desalin') || t.includes('coast') || t.includes('marine') || t.includes('ocean') || t.includes('sea')) return CATEGORIES['water'];
  if (t.includes('climate') || t.includes('carbon') || t.includes('co2') || t.includes('temperature') || t.includes('drought')) return CATEGORIES['climate'];
  if (t.includes('solar') || t.includes('renewable') || t.includes('wind') || t.includes('energy') || t.includes('power')) return CATEGORIES['energy'];
  if (t.includes('regulat') || t.includes('complia') || t.includes('law') || t.includes('policy') || t.includes('standard')) return CATEGORIES['regulation'];
  if (t.includes('green') || t.includes('sustainab') || t.includes('tree') || t.includes('forest') || t.includes('plant')) return CATEGORIES['green'];
  if (t.includes('desert') || t.includes('saudi') || t.includes('neom') || t.includes('vision 2030')) return CATEGORIES['default'];
  return CATEGORIES['default'];
}

// ── Pick topic-matched image ─────────────────────────────────────────────────
// Uses article.image from API first (most relevant), then topic-matched fallback
function getImage(article, index) {
  // 1. Real image from GNews API — most relevant, use it
  if (article.image && article.image.startsWith('http')) return article.image;

  // 2. Pick topic-matched image based on article content
  const cat = getCategory(article);
  const imgKey = cat.imgKey || 'default';
  const pool = TOPIC_IMAGES[imgKey] || TOPIC_IMAGES['default'];

  // Rotate through the pool so cards in same category don't all look identical
  return pool[index % pool.length];
}

// ── Safe fallback image for onerror ─────────────────────────────────────────
function getFallbackImage(article, index) {
  const cat = getCategory(article);
  const imgKey = cat.imgKey || 'default';
  const pool = TOPIC_IMAGES[imgKey] || TOPIC_IMAGES['default'];
  // Use next image in pool as fallback
  return pool[(index + 1) % pool.length];
}

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return s + 's ago';
  if (s < 3600)  return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

function stripHtml(h) {
  const d = document.createElement('div');
  d.innerHTML = h;
  return d.textContent || d.innerText || '';
}

function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ── Fetch news ───────────────────────────────────────────────────────────────
async function fetchNews() {
  const q = 'Saudi Arabia environment OR "air quality" OR sustainability OR "green initiative" OR climate';

  // 1. GNews API
  if (CONFIG.GNEWS_API_KEY && CONFIG.GNEWS_API_KEY !== 'YOUR_GNEWS_API_KEY') {
    try {
      const res = await fetchWithTimeout(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&country=sa&max=${CONFIG.ARTICLE_COUNT}&apikey=${CONFIG.GNEWS_API_KEY}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.articles?.length) {
          return data.articles.map(a => ({
            title: a.title,
            description: a.description,
            url: a.url,
            source: { name: a.source?.name || 'News' },
            publishedAt: a.publishedAt,
            image: a.image || null,
          }));
        }
      }
    } catch (e) { console.warn('[AECON News] GNews failed:', e.message); }
  }

  // 2. RSS2JSON fallback
  try {
    const rss = 'https://news.google.com/rss/search?q=Saudi+Arabia+environment+sustainability&hl=en-SA&gl=SA&ceid=SA:en';
    const res = await fetchWithTimeout(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}&count=${CONFIG.ARTICLE_COUNT}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.items?.length) {
        return data.items.slice(0, CONFIG.ARTICLE_COUNT).map(i => ({
          title: stripHtml(i.title),
          description: stripHtml(i.description || i.summary || '').slice(0, 260) + '...',
          url: i.link,
          source: { name: i.author || 'Google News' },
          publishedAt: i.pubDate || new Date().toISOString(),
          image: i.thumbnail || i.enclosure?.link || null,
        }));
      }
    }
  } catch (e) { console.warn('[AECON News] RSS failed:', e.message); }

  // 3. Static fallback
  return FALLBACK_ARTICLES;
}

// ── Ticker ───────────────────────────────────────────────────────────────────
function renderTicker(articles) {
  const track = document.getElementById('ticker-track');
  if (!track || !articles.length) return;
  const items = [...articles, ...articles];
  track.innerHTML = items.map(a =>
    `<span class="inline-flex items-center gap-3 px-6" style="border-right:1px solid rgba(255,255,255,0.09);">
      <span style="color:#a8f0c8;font-weight:700;font-size:0.68rem;">&#9654;</span>
      <span style="font-family:'DM Sans',sans-serif;font-size:0.73rem;color:rgba(255,255,255,0.85);">${a.title}</span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:0.6rem;color:rgba(255,255,255,0.38);margin-left:4px;">${timeAgo(a.publishedAt)}</span>
    </span>`
  ).join('');
}

function filterArticles(a) {
  if (activeFilter === 'all') return a;
  return a.filter(x => ((x.title || '') + ' ' + (x.description || '')).toLowerCase().includes(activeFilter.toLowerCase()));
}

// ── Render card ──────────────────────────────────────────────────────────────
function renderCard(article, index) {
  const cat      = getCategory(article);
  const img      = getImage(article, index);
  const fallback = getFallbackImage(article, index);
  const ago      = timeAgo(article.publishedAt);
  const featured = index === 0;

  return `
    <div class="news-card${featured ? ' featured' : ''}">
      <div class="card-img-wrap">
        <img
          src="${img}"
          alt="${(article.title || '').replace(/"/g, '')}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallback}'"
        />
        <div class="card-img-overlay"></div>
        <span class="card-badge" style="background:${cat.bg};color:${cat.color};">${cat.label}</span>
        <span class="card-source">${article.source?.name || 'News'}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${article.title}</h3>
        <p class="card-desc">${article.description || 'Read the full article for details on this environmental development.'}</p>
        <div class="card-footer">
          <span class="card-time">${ago}</span>
          <a href="${article.url}" target="_blank" rel="noopener" class="read-more">
            Read More
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
      </div>
    </div>`;
}

// ── Render grid ──────────────────────────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  const filtered = filterArticles(allArticles);
  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
      <div style="font-size:2rem;margin-bottom:10px;">🔍</div>
      <div style="font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--aecon-text);">No articles match this filter</div>
    </div>`;
    return;
  }
  grid.innerHTML = filtered.map((a, i) => renderCard(a, i)).join('');
  const sources = [...new Set(filtered.map(a => a.source?.name).filter(Boolean))];
  const statCount   = document.getElementById('stat-count');
  const statSources = document.getElementById('stat-sources');
  if (statCount)   statCount.textContent   = filtered.length;
  if (statSources) statSources.textContent = sources.length;
}

// ── Load news ────────────────────────────────────────────────────────────────
async function loadNews() {
  const $sk = document.getElementById('skeleton-grid');
  const $gr = document.getElementById('news-grid');
  const $er = document.getElementById('news-error');
  const $ic = document.getElementById('refresh-icon');
  const $up = document.getElementById('last-updated');

  if ($ic) $ic.style.animation = 'spin 1s linear infinite';
  if ($sk) $sk.style.display = 'grid';
  if ($gr) $gr.style.display = 'none';
  if ($er) $er.style.display = 'none';

  try {
    const articles = await fetchNews();
    allArticles = articles;
    renderTicker(articles);
    if ($sk) $sk.style.display = 'none';
    if ($gr) $gr.style.display = 'grid';
    renderGrid();
    if ($up) {
      const now = new Date();
      $up.textContent = `Updated ${now.toLocaleTimeString('en-SA', { hour: '2-digit', minute: '2-digit' })}`;
    }
  } catch (err) {
    console.error('[AECON News]', err);
    allArticles = FALLBACK_ARTICLES;
    if ($sk) $sk.style.display = 'none';
    if ($gr) $gr.style.display = 'grid';
    renderGrid();
    if ($er) $er.style.display = 'block';
  } finally {
    if ($ic) $ic.style.animation = '';
  }

  if (refreshTimer)   clearInterval(refreshTimer);
  if (countdownTimer) clearInterval(countdownTimer);
  nextRefresh  = Date.now() + CONFIG.REFRESH_MS;
  refreshTimer = setInterval(() => loadNews(), CONFIG.REFRESH_MS);
  countdownTimer = setInterval(() => {
    const rem = Math.max(0, nextRefresh - Date.now());
    const m   = Math.floor(rem / 60000);
    const s   = Math.floor((rem % 60000) / 1000);
    const el  = document.getElementById('next-refresh-label');
    if (el) el.textContent = `Next refresh in: ${m}m ${String(s).padStart(2, '0')}s`;
  }, 1000);
}

// ── Filter pills ─────────────────────────────────────────────────────────────
document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.topic;
    renderGrid();
  });
});

const _sty = document.createElement('style');
_sty.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
document.head.appendChild(_sty);

document.addEventListener('DOMContentLoaded', () => loadNews());
</script>
