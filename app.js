/*================== INICIALIZACION WINDY ========================================================= */
const options = {
  key: 'TKinBro5CvidrgV1D2Plj95HgZbv4Ae3',
  lat: -18.7833, lon: -60.1821,
  zoom: 7,
  overlay: 'wind',
  level: 'surface',
  particlesAnim: 'on'
};

windyInit(options, (windyAPI) => {
  const { store, overlays, map } = windyAPI;

  // Asegura overlay viento + unidades KM/H
  store.set('overlay', 'wind');
  if (overlays?.wind?.setMetric) overlays.wind.setMetric('km/h');
  store.on('overlay', (ov) => {
    if (ov === 'wind' && overlays?.wind?.setMetric) overlays.wind.setMetric('km/h');
  });
  /*==================================================CARGA DE GEOJSONS SIMPLES======================================================= */

function configurarCargaGeoJSON(idCheckbox, urlGeoJSON, capaDestino, callbackEstilo) {
  const checkbox = document.getElementById(idCheckbox);
  let capaCargada = false;

  if (!checkbox) return;

  async function cargarCapa() {
    if (!capaCargada) {
      const response = await fetch(urlGeoJSON);
      const data = await response.json();

      // Si quieres aplicar estilos personalizados, usa callbackEstilo
      if (typeof callbackEstilo === "function") {
        capaDestino = L.geoJSON(data, { style: callbackEstilo });
      } else {
        capaDestino = L.geoJSON(data);
      }

      capaCargada = true;
    }
    capaDestino.addTo(map);

  }

  checkbox.addEventListener("change", async (e) => {
    if (e.target.checked) {
      await cargarCapa();
    } else {
      map.removeLayer(capaDestino);
    }
  });
}

// === DATOS CARGADOS ===
// 1. Áreas Protegidas
let areasProtLayer = L.layerGroup();
configurarCargaGeoJSON(
  "chkAreasProt",
  "areas_prot_line.geojson",
  areasProtLayer,
  (feature) => ({ color: '#000000ff', weight: 1 })
);

// 2. Municipios
let municipiosLayer = L.layerGroup();
configurarCargaGeoJSON(
  "chkMunicipios",
  "municipios.geojson",
  municipiosLayer,
  (feature) => ({ color: '#000000ff', weight: 1, fillColor: '#88888855', fillOpacity: 0 })
);

// 3. Caminos
let caminosLayer = L.layerGroup();
configurarCargaGeoJSON(
  "chkCaminos",
  "caminos.geojson",
  caminosLayer,
  (feature) => ({ color: '#000000ff', weight: 1 })
);
  
  /* =======================================CARGA DE DATOS GEOJSON COMPLEJOS=================================================*/
/**
 * @param {string} idCheckbox   - id del input checkbox
 * @param {string} urlGeoJSON   - ruta del archivo .geojson
 * @param {string} campo        - nombre del campo categórico (ej. "Codigo")
 * @param {Object} colores      - mapa valor->color (ej. { Bosque:"#2ecc71", Pastizal:"#f1c40f" })
 * @param {Object} [opciones]
 *   - defaultColor  : color si el valor no está en "colores" (default "#cccccc")
 *   - borde         : color del borde (default "#212121")
 *   - grosor        : grosor del borde (default 0.6)
 *   - opacidad      : opacidad de relleno (default 1)
 *   - fit           : ajustar mapa a la capa al cargar (default true)
 */
function configurarGeoJSONPorCategoria(idCheckbox, urlGeoJSON, campo, colores, opciones = {}) {
  const checkbox = document.getElementById(idCheckbox);
  if (!checkbox) return;

  const {
    defaultColor = "#cccccc",
    borde = "#212121",
    grosor = 0.6,
    opacidad = 1,
    fit = true
  } = opciones;

  let capa = null;     // L.GeoJSON
  let cargado = false; // para cargar una sola vez

  // Genera el HTML del popup con todas las propiedades
  function popupHTML(props = {}) {
    const filas = Object.entries(props)
      .map(([k, v]) => `<tr><th style="text-align:left;padding:4px 8px;border-bottom:1px solid #eee">${k}</th><td style="padding:4px 8px;border-bottom:1px solid #eee">${v ?? "—"}</td></tr>`)
      .join("");
    return `
      <div style="font:12px/1.35 Segoe UI, Arial, sans-serif; min-width:220px;">
        <div style="font-weight:700;margin:0 0 6px">Propiedades</div>
        <table style="border-collapse:collapse;width:100%">${filas}</table>
      </div>
    `;
  }

  async function cargar() {
    if (!cargado) {
      const resp = await fetch(urlGeoJSON);
      const data = await resp.json();

      capa = L.geoJSON(data, {
        style: (f) => {
          const val = String(f?.properties?.[campo] ?? "");
          const fill = colores && Object.prototype.hasOwnProperty.call(colores, val)
            ? colores[val]
            : defaultColor;
          return { color: borde, weight: grosor, fillColor: fill, fillOpacity: opacidad };
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(popupHTML(feature?.properties));
        }
      });

      cargado = true;
    }

    capa.addTo(map);

  }

  checkbox.addEventListener("change", async (e) => {
    if (e.target.checked) {
      await cargar();
    } else if (capa) {
      map.removeLayer(capa);
    }
  });

  // Si ya viene marcado, carga de inmediato
  if (checkbox.checked) {
    cargar();
  }
}

configurarGeoJSONPorCategoria(
  "chkVegetacion",
  "vegetacion_small.geojson",
  "Codigo",
  {
  'ar':  "#ffff00",
  'd10': "#f7fb00",
  'c18': "#eff700",
  'd13': "#e7f300",
  'c17': "#dfef00",
  'd12':  "#d7eb00",
  'd19': "#cfeb00",
  'd18': "#c7e700",
  'd15': "#bfe300",
  'd14': "#b7df00",
  'd17':  "#afdb00",
  'pa4': "#a7d700",
  'pa1': "#9fd300",
  'pa3': "#97cf00",
  'pa2': "#8fcb00",
  'da':  "#87c700",
  'd2': "#7fc300",
  'd1': "#77bf00",
  'c14': "#6fb900",
  'c13': "#67b300",
  'd7':  "#5fad00",
  'c1': "#57a700",
  'd9': "#4fa100",
  'c10': "#479b00",
  'd3': "#3f9500",
  'd6':  "#378f00",
  'Ag': "#2f8900",
  'd5': "#278300",
  'c7': "#1f7d00",
  'c6': "#177700",
  'c9':  "#0f7100",
  'ca': "#096b00",
  'c3': "#046500",
  'c2': "#025f00",
  'c16': "#015900",
  'c5':  "#015300",
  'c15': "#004d00",
    "Humedal":  "#1abc9c"
  },
  { defaultColor: "#bbbbbb", borde:"#222", grosor:0.6, opacidad:1, fit:true }
);


  /* ================================MENÚ (mostrar / ocultar dropdown)================================ */
  const menuBtn  = document.getElementById('menuToggle');
  const dropdown = document.getElementById('dropdown');

  function toggleMenu(){
    const hidden = dropdown.getAttribute('aria-hidden') !== 'false';
    dropdown.setAttribute('aria-hidden', hidden ? 'false' : 'true');
  }
  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menu-wrap')) dropdown.setAttribute('aria-hidden', 'true');
    });
  }

  /* ================================ FIRMS (NASA VIIRS)================================ */

  // --- UI del dropdown ---
  const $chkFirms   = document.getElementById('chkFirms');
  const $inpDays    = document.getElementById('inpDays');
  const $btnRefresh = document.getElementById('btnRefresh');
  const $status     = document.getElementById('status');
  const $sensorInputs = Array.from(document.querySelectorAll('.sensor')); // checkboxes de sensores

  // Helpers UI
  const setStatus = (msg) => { if ($status) $status.textContent = msg; };
  const clampDays = (n) => Math.max(1, Math.min(10, Number(n) || 1));
  const selectedSources = () => {
    const sel = $sensorInputs.filter(i => i.checked).map(i => i.value);
    return sel.length ? sel : ['VIIRS_SNPP_NRT','VIIRS_NOAA20_NRT','VIIRS_NOAA21_NRT'];
  };

  // Config FIRMS
  const MAP_KEY = '5af33db19b8f702e3a8bfd0db0418a04';
  const AUTO_REFRESH_MS = 15 * 60 * 1000;

  // Capa de puntos (Leaflet interno de Windy)
  const firmsLayer = L.layerGroup().addTo(map);

  // Construye BBOX desde la vista actual del mapa
  function getMapBBOX() {
    const b = map.getBounds();
    const sw = b.getSouthWest(); // (lat,lng)
    const ne = b.getNorthEast();
    // FIRMS espera: minLon, minLat, maxLon, maxLat
    return [sw.lng, sw.lat, ne.lng, ne.lat];
  }

  // URL por fuente
  function buildAreaUrl({ mapKey, source, bbox, days }) {
    const d = clampDays(days);
    if (!Array.isArray(bbox) || bbox.length !== 4) throw new Error('BBOX inválido');
    return `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/${source}/${bbox.join(',')}/${d}`;
  }

  // Fetch CSV
  async function fetchCSV(url) {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) {
      const txt = await resp.text().catch(()=> '');
      throw new Error(`HTTP ${resp.status} – ${txt.slice(0,120)}`);
    }
    return resp.text();
  }

  // Parse CSV → GeoJSON Features
  function parseCSVtoFeatures(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];
    const headers = lines.shift().split(',');
    const idx = (name) => headers.indexOf(name);

    const iLat = idx('latitude');
    const iLon = idx('longitude');
    const iDate= idx('acq_date');
    const iTime= idx('acq_time');
    const iConf= idx('confidence');
    const iFRP = idx('frp');
    const iSat = idx('satellite');
    const iInst= idx('instrument');

    const feats = [];
    for (const raw of lines) {
      const cols = raw.split(',');
      const lat = parseFloat(cols[iLat]);
      const lon = parseFloat(cols[iLon]);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      let hhmm = (cols[iTime] || '').padStart(4,'0');
      const timeFmt = `${hhmm.slice(0,2)}:${hhmm.slice(2,4)}`;

      feats.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          acq_date: cols[iDate] || '',
          acq_time: timeFmt,
          confidence: cols[iConf] || '',
          frp: cols[iFRP] || '',
          satellite: cols[iSat] || '',
          instrument: cols[iInst] || ''
        }
      });
    }
    return feats;
  }

  // Quita duplicados
  function dedupeFeatures(feats) {
    const seen = new Set();
    const out = [];
    for (const f of feats) {
      const p = f.properties;
      const g = f.geometry && f.geometry.coordinates;
      if (!g) continue;
      const key = `${g[0].toFixed(5)}|${g[1].toFixed(5)}|${p.acq_date}|${p.acq_time}`;
      if (!seen.has(key)) { seen.add(key); out.push(f); }
    }
    return out;
  }

  // Estilo por confianza
  function styleByConfidence(conf) {
    const v = String(conf).toLowerCase();
    if (v.includes('h') || Number(v) >= 80) return { color:'#000', fillColor:'#ff0000' }; // alta
    if (v.includes('n') || Number(v) >= 40) return { color:'#000', fillColor:'#ff8c00' }; // media
    if (v.includes('l') || Number(v) >= 1)  return { color:'#000', fillColor:'#ffd000' }; // baja
    return { color:'#000', fillColor:'#6666ff' }; // s/dato
  }

  // Renderizar focos en el mapa
  function renderFirms(feats) {
    firmsLayer.clearLayers();
    const geojson = { type: 'FeatureCollection', features: feats };

    const layer = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => {
        const { confidence, frp } = feature.properties;
        const base = styleByConfidence(confidence);
        let r = 4;
        const frpNum = Number(frp);
        if (Number.isFinite(frpNum)) {
          if (frpNum > 50) r = 8;
          else if (frpNum > 20) r = 6;
        }
        return L.circleMarker(latlng, {
          radius: r,
          color: base.color,
          fillColor: base.fillColor,
          weight: 1,
          fillOpacity: 0.85
        });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindPopup(
          `<b>Foco VIIRS</b><br>
          Fecha: ${p.acq_date} ${p.acq_time}<br>
          Confianza: ${p.confidence}<br>
          FRP: ${p.frp}<br>
          Satélite: ${p.satellite}`
        );
      }
    });

    layer.addTo(firmsLayer);
    setStatus(`Mostrando ${feats.length} focos (VIIRS).`);
  }

  // Cargar y pintar según BBOX actual y UI
  async function loadFirmsAndRender() {
    try {
      if ($chkFirms && !$chkFirms.checked) {
        firmsLayer.clearLayers();
        setStatus('FIRMS oculto.');
        return;
      }

      setStatus('Descargando datos de FIRMS…');

      // Días desde input (clamp 1..10)
      if ($inpDays) $inpDays.value = clampDays($inpDays.value);
      const days = clampDays($inpDays ? $inpDays.value : 3);

      const bbox = [-64.9, -22.5, -57.0, -16.0];
      const sources = selectedSources();
      const urls = sources.map(src => buildAreaUrl({
        mapKey: MAP_KEY, source: src, bbox, days
      }));

      const csvs = await Promise.all(urls.map(fetchCSV));
      let all = [];
      for (const csv of csvs) all = all.concat(parseCSVtoFeatures(csv));
      const unique = dedupeFeatures(all);

      renderFirms(unique);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  // --- Eventos del dropdown (conexión UI) ---
  $chkFirms?.addEventListener('change', () => {
    if ($chkFirms.checked) loadFirmsAndRender();
    else firmsLayer.clearLayers();
  });

  $btnRefresh?.addEventListener('click', () => loadFirmsAndRender());

  $inpDays?.addEventListener('change', () => {
    if ($inpDays) $inpDays.value = clampDays($inpDays.value);
    loadFirmsAndRender();
  });

  $sensorInputs.forEach(inp => {
    inp.addEventListener('change', () => loadFirmsAndRender());
  });

  // Auto-refresco
  const intervalId = setInterval(() => {
    if (!$chkFirms || $chkFirms.checked) loadFirmsAndRender();
  }, AUTO_REFRESH_MS);

  // Volver a cargar al mover/zoom (debounce)
  let refreshTimer = null;
  map.on('moveend zoomend', () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (!$chkFirms || $chkFirms.checked) loadFirmsAndRender();
    }, 400);
  });

  // Primera carga
  loadFirmsAndRender();
});
