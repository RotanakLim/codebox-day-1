const state = { geojson: null, organizations: [], selected: null, scale: 1, tx: 0, ty: 0, priority: false };
const cityToCounty = {
  'los angeles':'Los Angeles','san diego':'San Diego','san jose':'Santa Clara','san francisco':'San Francisco','fresno':'Fresno','sacramento':'Sacramento','long beach':'Los Angeles','oakland':'Alameda','bakersfield':'Kern','anaheim':'Orange','santa ana':'Orange','riverside':'Riverside','stockton':'San Joaquin','irvine':'Orange','chula vista':'San Diego','fremont':'Alameda','san bernardino':'San Bernardino','modesto':'Stanislaus','fontana':'San Bernardino','moreno valley':'Riverside','oxnard':'Ventura','huntington beach':'Orange','glendale':'Los Angeles','santa clarita':'Los Angeles','garden grove':'Orange','oceanside':'San Diego','rancho cucamonga':'San Bernardino','santa rosa':'Sonoma','ontario':'San Bernardino','elk grove':'Sacramento','corona':'Riverside','lancaster':'Los Angeles','palmdale':'Los Angeles','salinas':'Monterey','hayward':'Alameda','pomona':'Los Angeles','escondido':'San Diego','sunnyvale':'Santa Clara','torrance':'Los Angeles','pasadena':'Los Angeles','orange':'Orange','fullerton':'Orange','visalia':'Tulare','roseville':'Placer','concord':'Contra Costa','simi valley':'Ventura','santa clara':'Santa Clara','victorville':'San Bernardino','berkeley':'Alameda','fairfield':'Solano','antioch':'Contra Costa','richmond':'Contra Costa','daly city':'San Mateo','temecula':'Riverside','ventura':'Ventura'
};

const els = Object.fromEntries(['map-content','map-loading','map-status','area-search','area-options','search-button','priority-button','detail-title','detail-description','detail-metric','detail-rate','detail-classification','detail-actions','zoom-county','share-county','organization-list','org-count','table-toggle','county-table-wrap','county-table-body'].map(id => [id, document.getElementById(id)]));

function rateOf(feature) { return Number(feature.properties.MMG_PCT_OVERALL_FI_RATE); }
function nameOf(feature) { return feature.properties.COUNTY_NM; }
function level(rate) {
  if (rate >= 18) return { label: 'Highest need', color: '#c94d35' };
  if (rate >= 15) return { label: 'Elevated need', color: '#e6a83a' };
  if (rate >= 10) return { label: 'Moderate need', color: '#f7df72' };
  return { label: 'Lower relative need', color: '#fffdf2' };
}

function project([lon, lat]) {
  const minLon = -124.55, maxLon = -113.95, minLat = 32.3, maxLat = 42.15;
  const x = 46 + ((lon - minLon) / (maxLon - minLon)) * 585;
  const y = 34 + ((maxLat - lat) / (maxLat - minLat)) * 680;
  return [x, y];
}

function ringPath(ring) { return ring.map((point, index) => `${index ? 'L' : 'M'}${project(point).join(',')}`).join(' ') + ' Z'; }
function geometryPath(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map(polygon => polygon.map(ringPath).join(' ')).join(' ');
}

function featureBounds(feature) {
  const points = [];
  const visit = value => typeof value[0] === 'number' ? points.push(project(value)) : value.forEach(visit);
  visit(feature.geometry.coordinates);
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  return { minX:Math.min(...xs), maxX:Math.max(...xs), minY:Math.min(...ys), maxY:Math.max(...ys) };
}

function applyTransform() { els['map-content'].style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`; }
function setZoom(nextScale, centerX = 340, centerY = 380) {
  const oldScale = state.scale;
  state.scale = Math.max(1, Math.min(5, nextScale));
  if (state.scale === 1) { state.tx = 0; state.ty = 0; }
  else { state.tx = centerX - ((centerX - state.tx) * state.scale / oldScale); state.ty = centerY - ((centerY - state.ty) * state.scale / oldScale); }
  applyTransform();
  els['map-status'].value = `Map zoom ${Math.round(state.scale * 100)} percent`;
}

function zoomToFeature(feature) {
  const box = featureBounds(feature), width = box.maxX - box.minX, height = box.maxY - box.minY;
  const scale = Math.min(4.5, Math.max(1.4, Math.min(560 / width, 620 / height)));
  const cx = (box.minX + box.maxX) / 2, cy = (box.minY + box.maxY) / 2;
  state.scale = scale; state.tx = 340 - cx * scale; state.ty = 380 - cy * scale; applyTransform();
  els['map-status'].value = `Zoomed to ${nameOf(feature)} County`;
}

function makePath(feature) {
  const ns = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(ns, 'path');
  const rate = rateOf(feature), county = nameOf(feature);
  path.setAttribute('d', geometryPath(feature.geometry)); path.setAttribute('fill', level(rate).color);
  path.setAttribute('class', `county${rate >= 18 ? ' priority' : ''}`); path.setAttribute('tabindex', '0'); path.setAttribute('role', 'button');
  path.setAttribute('aria-label', `${county} County, estimated food insecurity ${rate.toFixed(1)} percent, ${level(rate).label}`); path.dataset.county = county;
  const title = document.createElementNS(ns, 'title'); title.textContent = `${county} County — ${rate.toFixed(1)}%`; path.appendChild(title);
  path.addEventListener('click', () => selectCounty(feature));
  path.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectCounty(feature); } });
  return path;
}

function populateOrganizations(county) {
  const matches = state.organizations.filter(org => org.counties.includes('Statewide') || org.counties.includes(county));
  els['organization-list'].replaceChildren(); els['org-count'].textContent = `${matches.length} resources`;
  matches.forEach(org => {
    const card = document.createElement('article'); card.className = 'org-card';
    const title = document.createElement('strong'); title.textContent = org.name;
    const meta = document.createElement('p'); meta.textContent = `${org.type} · ${org.services.join(' · ')}`;
    const links = document.createElement('div'); links.className = 'org-card-links';
    if (org.phone) { const phone = document.createElement('a'); phone.href = `tel:${org.phone.replace(/[^\d+]/g,'')}`; phone.textContent = org.phone === '211' ? 'Call 211' : 'Call'; links.append(phone); }
    const website = document.createElement('a'); website.href = org.website; website.target = '_blank'; website.rel = 'noreferrer'; website.textContent = 'Website ↗'; links.append(website);
    card.append(title, meta, links); els['organization-list'].append(card);
  });
}

function selectCounty(feature, shouldZoom = false) {
  state.selected = feature; const county = nameOf(feature), rate = rateOf(feature), classification = level(rate);
  document.querySelectorAll('.county').forEach(path => path.classList.toggle('selected', path.dataset.county === county));
  els['detail-title'].textContent = `${county} County`; els['detail-description'].textContent = `A modeled 2020 county estimate. Use it with current local knowledge when planning outreach or services.`;
  els['detail-rate'].textContent = `${rate.toFixed(1)}%`; els['detail-metric'].hidden = false; els['detail-classification'].hidden = false; els['detail-actions'].hidden = false;
  els['detail-classification'].textContent = classification.label; els['detail-classification'].style.background = classification.color;
  els['area-search'].value = county; populateOrganizations(county);
  const url = new URL(location.href); url.searchParams.set('county', county); history.replaceState({}, '', url);
  els['map-status'].value = `${county} County selected, ${rate.toFixed(1)} percent estimated food insecurity`;
  if (shouldZoom) zoomToFeature(feature);
}

function findCounty(query) {
  const normalized = query.trim().toLowerCase().replace(/ county$/, '');
  const target = cityToCounty[normalized] || normalized;
  return state.geojson.features.find(feature => nameOf(feature).toLowerCase() === String(target).toLowerCase());
}

function runSearch() {
  const feature = findCounty(els['area-search'].value);
  if (feature) selectCounty(feature, true);
  else { els['map-status'].value = 'Area not found. Try a California county or major city.'; els['area-search'].setCustomValidity('Try a California county or major city.'); els['area-search'].reportValidity(); }
}

function renderTable() {
  const features = [...state.geojson.features].sort((a,b) => rateOf(b) - rateOf(a)); els['county-table-body'].replaceChildren();
  features.forEach(feature => {
    const row = document.createElement('tr'), rate = rateOf(feature), classification = level(rate);
    const countyCell = document.createElement('th'); countyCell.scope = 'row'; countyCell.textContent = `${nameOf(feature)} County`;
    const rateCell = document.createElement('td'); rateCell.textContent = `${rate.toFixed(1)}%`;
    const levelCell = document.createElement('td'); levelCell.textContent = classification.label;
    const actionCell = document.createElement('td'), button = document.createElement('button'); button.type = 'button'; button.textContent = 'View'; button.addEventListener('click', () => { selectCounty(feature, true); document.getElementById('map-section').scrollIntoView(); }); actionCell.append(button);
    row.append(countyCell, rateCell, levelCell, actionCell); els['county-table-body'].append(row);
  });
}

function bindControls() {
  document.getElementById('zoom-in').addEventListener('click', () => setZoom(state.scale + .5));
  document.getElementById('zoom-out').addEventListener('click', () => setZoom(state.scale - .5));
  document.getElementById('zoom-reset').addEventListener('click', () => { state.scale = 1; state.tx = 0; state.ty = 0; applyTransform(); });
  els['zoom-county'].addEventListener('click', () => state.selected && zoomToFeature(state.selected));
  els['search-button'].addEventListener('click', runSearch); els['area-search'].addEventListener('input', () => els['area-search'].setCustomValidity('')); els['area-search'].addEventListener('keydown', event => { if (event.key === 'Enter') runSearch(); });
  els['priority-button'].addEventListener('click', () => { state.priority = !state.priority; document.getElementById('map').classList.toggle('priority-mode', state.priority); els['priority-button'].setAttribute('aria-pressed', String(state.priority)); els['priority-button'].textContent = state.priority ? 'Show all counties' : 'Priority list'; els['map-status'].value = state.priority ? 'Highlighting counties with estimated rates of 18 percent or more' : 'Showing all counties'; });
  els['table-toggle'].addEventListener('click', () => { const open = els['county-table-wrap'].hidden; els['county-table-wrap'].hidden = !open; els['table-toggle'].setAttribute('aria-expanded', String(open)); });
  els['share-county'].addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); els['share-county'].textContent = 'Link copied'; } catch { els['share-county'].textContent = 'Use address bar'; } setTimeout(() => els['share-county'].textContent = 'Copy link', 1800); });
  document.getElementById('county-map').addEventListener('wheel', event => { event.preventDefault(); setZoom(state.scale + (event.deltaY < 0 ? .3 : -.3), event.offsetX, event.offsetY); }, { passive:false });
}

async function init() {
  try {
    const [geoResponse, orgResponse] = await Promise.all([fetch('/api/counties'), fetch('/api/organizations')]);
    if (!geoResponse.ok || !orgResponse.ok) throw new Error('Data request failed');
    state.geojson = await geoResponse.json(); const orgData = await orgResponse.json(); state.organizations = orgData.organizations;
    els['map-loading'].remove(); state.geojson.features.forEach(feature => els['map-content'].append(makePath(feature)));
    const countyNames = state.geojson.features.map(nameOf).sort();
    [...countyNames.map(name => `${name} County`), ...Object.keys(cityToCounty).map(name => name.replace(/\b\w/g, char => char.toUpperCase()))].forEach(name => { const option = document.createElement('option'); option.value = name; els['area-options'].append(option); });
    renderTable(); bindControls(); populateOrganizations('');
    const requested = new URLSearchParams(location.search).get('county'); const initial = requested ? findCounty(requested) : findCounty('Los Angeles'); if (initial) selectCounty(initial);
  } catch (error) {
    els['map-loading'].textContent = 'The map data could not load. Call 211 or use the statewide resource links below.'; console.error(error);
  }
}

init();
