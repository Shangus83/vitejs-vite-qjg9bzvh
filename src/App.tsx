import { useState, useRef, useCallback } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0d0a08;
    color: #e8ddd0;
    font-family: 'Cormorant Garamond', serif;
    min-height: 100vh;
  }

  :root {
    --wine: #6b1a2a;
    --wine-light: #8c2438;
    --gold: #c9a84c;
    --gold-light: #e2c47a;
    --cream: #f5ede0;
    --dark: #0d0a08;
    --dark-2: #1a1410;
    --dark-3: #231c16;
    --text: #e8ddd0;
    --text-muted: #9a8a7a;
  }

  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  header {
    padding: 40px 0 30px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid rgba(201, 168, 76, 0.2);
    margin-bottom: 40px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
    position: relative;
  }

  .logo-text h1 {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 400;
    color: var(--cream);
    letter-spacing: 2px;
  }

  .logo-text span {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    letter-spacing: 4px;
    color: var(--gold);
    text-transform: uppercase;
  }

  .stats-bar {
    display: flex;
    gap: 40px;
    text-align: right;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    color: var(--gold);
    line-height: 1;
  }

  .stat-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    color: var(--text-muted);
    text-transform: uppercase;
    margin-top: 4px;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 30px;
    align-items: start;
  }

  .panel {
    background: var(--dark-2);
    border: 1px solid rgba(201, 168, 76, 0.15);
    border-radius: 2px;
    overflow: hidden;
  }

  .panel-header {
    padding: 20px 24px;
    background: rgba(201, 168, 76, 0.05);
    border-bottom: 1px solid rgba(201, 168, 76, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .panel-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
  }

  .panel-body {
    padding: 24px;
  }

  .tabs {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    border: 1px solid rgba(201, 168, 76, 0.2);
  }

  .tab {
    flex: 1;
    padding: 10px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .tab:first-child {
    border-right: 1px solid rgba(201, 168, 76, 0.2);
  }

  .tab.active {
    background: rgba(107, 26, 42, 0.4);
    color: var(--gold-light);
  }

  .tab:hover:not(.active) {
    background: rgba(201, 168, 76, 0.05);
    color: var(--text);
  }

  .photo-zone {
    border: 1px dashed rgba(201, 168, 76, 0.3);
    border-radius: 2px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .photo-zone:hover {
    border-color: rgba(201, 168, 76, 0.6);
    background: rgba(201, 168, 76, 0.03);
  }

  .photo-zone.has-image {
    padding: 0;
    border-style: solid;
    border-color: rgba(201, 168, 76, 0.4);
  }

  .photo-preview {
    width: 100%;
    max-height: 200px;
    object-fit: contain;
    display: block;
  }

  .photo-zone-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .photo-icon {
    font-size: 36px;
    opacity: 0.4;
  }

  .photo-zone-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .photo-zone-sub {
    font-size: 13px;
    color: var(--text-muted);
    font-style: italic;
  }

  input[type="file"] { display: none; }

  .form-group {
    margin-bottom: 16px;
  }

  .form-label {
    display: block;
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 2px;
    color: var(--text);
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    padding: 10px 14px;
    transition: border-color 0.3s;
    outline: none;
  }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: rgba(201, 168, 76, 0.5);
  }

  .form-select option { background: var(--dark-2); }

  .form-textarea {
    min-height: 80px;
    resize: vertical;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .btn {
    width: 100%;
    padding: 14px;
    background: var(--wine);
    border: none;
    color: var(--cream);
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
  }

  .btn:hover:not(:disabled) {
    background: var(--wine-light);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid rgba(201, 168, 76, 0.3);
    color: var(--gold);
    margin-top: 8px;
  }

  .btn-secondary:hover {
    background: rgba(201, 168, 76, 0.08);
    border-color: rgba(201, 168, 76, 0.6);
  }

  .analyzing-overlay {
    position: absolute;
    inset: 0;
    background: rgba(13, 10, 8, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    z-index: 10;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(201, 168, 76, 0.2);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .analyzing-text {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--gold);
    text-transform: uppercase;
  }

  /* Cellar view */
  .filter-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    align-items: center;
  }

  .filter-btn {
    padding: 6px 16px;
    background: transparent;
    border: 1px solid rgba(201, 168, 76, 0.2);
    color: var(--text-muted);
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 1px;
  }

  .filter-btn.active {
    background: rgba(107, 26, 42, 0.5);
    border-color: var(--wine-light);
    color: var(--cream);
  }

  .filter-btn:hover:not(.active) {
    border-color: rgba(201, 168, 76, 0.4);
    color: var(--text);
  }

  .search-input {
    flex: 1;
    min-width: 180px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 2px;
    color: var(--text);
    font-family: 'Cormorant Garamond', serif;
    font-size: 15px;
    padding: 7px 14px;
    outline: none;
  }

  .search-input:focus { border-color: rgba(201, 168, 76, 0.5); }
  .search-input::placeholder { color: var(--text-muted); }

  .wine-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }

  .wine-card {
    background: var(--dark-3);
    border: 1px solid rgba(201, 168, 76, 0.12);
    border-radius: 2px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }

  .wine-card:hover {
    border-color: rgba(201, 168, 76, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  }

  .wine-card-accent {
    height: 3px;
    background: linear-gradient(to right, var(--wine), var(--wine-light));
  }

  .wine-card-accent.white { background: linear-gradient(to right, #b8a050, #e8d090); }
  .wine-card-accent.rose { background: linear-gradient(to right, #c05070, #e890a0); }
  .wine-card-accent.sparkling { background: linear-gradient(to right, #708090, #b0c0d0); }
  .wine-card-accent.dessert { background: linear-gradient(to right, #c07020, #e0a050); }

  .wine-card-body {
    padding: 18px;
  }

  .wine-card-type {
    font-family: 'Montserrat', sans-serif;
    font-size: 8px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 6px;
  }

  .wine-card-name {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: var(--cream);
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .wine-card-vintage {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    color: var(--text-muted);
    font-style: italic;
    margin-bottom: 14px;
  }

  .wine-card-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .wine-rating {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rating-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 8px;
    letter-spacing: 2px;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .rating-value {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: var(--gold);
    line-height: 1;
  }

  .aging-badge {
    padding: 4px 10px;
    font-family: 'Montserrat', sans-serif;
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    border-radius: 20px;
  }

  .aging-badge.drink-now { background: rgba(80, 160, 80, 0.2); color: #80c080; border: 1px solid rgba(80, 160, 80, 0.3); }
  .aging-badge.hold { background: rgba(201, 168, 76, 0.15); color: var(--gold-light); border: 1px solid rgba(201, 168, 76, 0.3); }
  .aging-badge.peak { background: rgba(107, 26, 42, 0.4); color: #d07080; border: 1px solid rgba(107, 26, 42, 0.6); }

  .empty-state {
    text-align: center;
    padding: 80px 40px;
    color: var(--text-muted);
  }

  .empty-icon { font-size: 60px; margin-bottom: 20px; opacity: 0.3; }
  .empty-text { font-family: 'Playfair Display', serif; font-size: 22px; font-style: italic; margin-bottom: 10px; }
  .empty-sub { font-family: 'Montserrat', sans-serif; font-size: 11px; letter-spacing: 2px; }

  /* Detail Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
    backdrop-filter: blur(4px);
  }

  .modal {
    background: var(--dark-2);
    border: 1px solid rgba(201, 168, 76, 0.25);
    border-radius: 2px;
    max-width: 700px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-top {
    display: flex;
    gap: 0;
  }

  .modal-color-bar {
    width: 6px;
    background: linear-gradient(to bottom, var(--wine), var(--wine-light));
    flex-shrink: 0;
  }

  .modal-color-bar.white { background: linear-gradient(to bottom, #b8a050, #e8d090); }
  .modal-color-bar.rose { background: linear-gradient(to bottom, #c05070, #e890a0); }

  .modal-content {
    flex: 1;
    padding: 32px;
  }

  .modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
    padding: 4px;
  }

  .modal-close:hover { color: var(--text); }

  .modal-header {
    margin-bottom: 28px;
    position: relative;
  }

  .modal-type {
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 8px;
  }

  .modal-name {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    color: var(--cream);
    line-height: 1.2;
    margin-bottom: 6px;
  }

  .modal-vintage {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-style: italic;
    color: var(--text-muted);
  }

  .modal-sections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 28px;
  }

  .modal-section h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(201, 168, 76, 0.15);
  }

  .modal-section p {
    font-size: 15px;
    line-height: 1.7;
    color: var(--text);
  }

  .modal-section-full {
    grid-column: 1 / -1;
  }

  .aging-timeline {
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(201, 168, 76, 0.15);
    padding: 20px;
    border-radius: 2px;
    margin-bottom: 24px;
  }

  .timeline-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 14px;
  }

  .timeline-bar-container {
    position: relative;
    height: 8px;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
    margin-bottom: 10px;
    overflow: visible;
  }

  .timeline-bar {
    height: 100%;
    background: linear-gradient(to right, var(--wine), var(--gold));
    border-radius: 4px;
    transition: width 0.8s ease;
  }

  .timeline-now-marker {
    position: absolute;
    top: -6px;
    width: 2px;
    height: 20px;
    background: var(--cream);
    border-radius: 1px;
  }

  .timeline-now-label {
    position: absolute;
    top: 16px;
    transform: translateX(-50%);
    font-family: 'Montserrat', sans-serif;
    font-size: 8px;
    letter-spacing: 1px;
    color: var(--cream);
    white-space: nowrap;
  }

  .timeline-years {
    display: flex;
    justify-content: space-between;
    font-family: 'Montserrat', sans-serif;
    font-size: 9px;
    color: var(--text-muted);
    margin-top: 24px;
  }

  .meta-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  .meta-pill {
    display: flex;
    flex-direction: column;
    padding: 10px 16px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(201, 168, 76, 0.15);
    border-radius: 1px;
  }

  .pill-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .pill-value {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    color: var(--cream);
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid rgba(201, 168, 76, 0.15);
  }

  .btn-danger {
    background: transparent;
    border: 1px solid rgba(180, 50, 50, 0.4);
    color: #c06060;
    padding: 10px 20px;
    font-family: 'Montserrat', sans-serif;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-danger:hover { background: rgba(180, 50, 50, 0.1); }

  .notification {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: var(--dark-2);
    border: 1px solid rgba(201, 168, 76, 0.4);
    border-left: 4px solid var(--gold);
    padding: 16px 24px;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--gold-light);
    animation: slideIn 0.3s ease;
    z-index: 200;
    text-transform: uppercase;
  }

  @keyframes slideIn {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @media (max-width: 900px) {
    .main-grid { grid-template-columns: 1fr; }
    .modal-sections { grid-template-columns: 1fr; }
    .stats-bar { gap: 20px; }
  }

  @media (max-width: 600px) {
    header { flex-direction: column; gap: 20px; align-items: flex-start; }
    .stats-bar { text-align: left; }
  }
`;

const WINE_TYPES = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified"];

const getTypeClass = (type) => {
  if (!type) return "";
  const t = type.toLowerCase();
  if (t === "white") return "white";
  if (t === "rosé" || t === "rose") return "rose";
  if (t === "sparkling") return "sparkling";
  if (t === "dessert" || t === "fortified") return "dessert";
  return "";
};

const getAgingStatus = (wine) => {
  const year = parseInt(wine.vintage);
  if (!year) return { label: "Unknown", cls: "hold" };
  const age = new Date().getFullYear() - year;
  const peakStart = parseInt(wine.peakStart) || age;
  const peakEnd = parseInt(wine.peakEnd) || age + 5;
  if (age < peakStart) return { label: "Hold", cls: "hold" };
  if (age > peakEnd) return { label: "Past Peak", cls: "peak" };
  return { label: "Drink Now", cls: "drink-now" };
};

const calcTimelinePosition = (wine) => {
  const vintage = parseInt(wine.vintage);
  if (!vintage) return { nowPct: 50, peakStartPct: 40, peakEndPct: 60 };
  const currentYear = new Date().getFullYear();
  const peakStart = parseInt(wine.peakStart) || currentYear;
  const peakEnd = parseInt(wine.peakEnd) || currentYear + 10;
  const totalEnd = Math.max(peakEnd + 5, currentYear + 3);
  const totalSpan = totalEnd - vintage;
  const nowPct = Math.min(100, Math.max(0, ((currentYear - vintage) / totalSpan) * 100));
  const peakStartPct = Math.min(100, ((peakStart - vintage) / totalSpan) * 100);
  const peakEndPct = Math.min(100, ((peakEnd - vintage) / totalSpan) * 100);
  return { nowPct, peakStartPct, peakEndPct, vintage, totalEnd };
};

export default function WineCellarApp() {
  const [cellar, setCellar] = useState([]);
  const [tab, setTab] = useState("photo");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedWine, setSelectedWine] = useState(null);
  const [notification, setNotification] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [manualForm, setManualForm] = useState({
    name: "", vintage: "", region: "", varietal: "", type: "Red", notes: ""
  });
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef();

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setPhotoBase64(ev.target.result.split(",")[1]);
      setAiResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async () => {
    if (!photoBase64) return;
    setAnalyzing(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: photoBase64 } },
              {
                type: "text",
                text: `Analyze this wine bottle/label image and return ONLY a JSON object with these fields:
                {
                  "name": "producer and wine name",
                  "vintage": "year as string",
                  "region": "region/appellation",
                  "country": "country",
                  "varietal": "grape variety or blend",
                  "type": "Red|White|Rosé|Sparkling|Dessert|Fortified",
                  "rating": "estimated score 85-100 based on reputation",
                  "description": "2-3 sentence tasting note and wine description",
                  "agingPotential": "brief aging potential description",
                  "peakStart": "estimated best drinking start year",
                  "peakEnd": "estimated best drinking end year",
                  "foodPairing": "2-3 food pairings"
                }
                If you cannot identify the wine clearly, make reasonable estimates. Return only valid JSON.`
              }
            ]
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiResult(parsed);
    } catch (err) {
      showNotification("Could not analyze image — try again");
    }
    setAnalyzing(false);
  };

  const analyzeManual = async () => {
    if (!manualForm.name) return;
    setAnalyzing(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `I have a wine: ${manualForm.name} ${manualForm.vintage || ""} ${manualForm.region || ""} ${manualForm.varietal || ""}. 
            Return ONLY a JSON object:
            {
              "name": "full producer and wine name",
              "vintage": "${manualForm.vintage || "unknown"}",
              "region": "region",
              "country": "country",
              "varietal": "grape variety",
              "type": "${manualForm.type}",
              "rating": "estimated score 85-100",
              "description": "2-3 sentence tasting note",
              "agingPotential": "aging potential",
              "peakStart": "best drinking start year",
              "peakEnd": "best drinking end year",
              "foodPairing": "2-3 food pairings"
            }
            Use your wine knowledge. Return only valid JSON.`
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiResult({ ...parsed, ...Object.fromEntries(Object.entries(manualForm).filter(([k, v]) => v)) });
    } catch (err) {
      showNotification("Could not analyze wine — try again");
    }
    setAnalyzing(false);
  };

  const addToCellar = () => {
    if (!aiResult) return;
    const wine = {
      ...aiResult,
      id: Date.now(),
      addedDate: new Date().toLocaleDateString()
    };
    setCellar(prev => [wine, ...prev]);
    setAiResult(null);
    setPhotoPreview(null);
    setPhotoBase64(null);
    setManualForm({ name: "", vintage: "", region: "", varietal: "", type: "Red", notes: "" });
    showNotification("Wine added to cellar");
  };

  const deleteWine = (id) => {
    setCellar(prev => prev.filter(w => w.id !== id));
    setSelectedWine(null);
    showNotification("Wine removed");
  };

  const filtered = cellar.filter(w => {
    const matchType = filterType === "All" || w.type === filterType;
    const matchSearch = !search || [w.name, w.region, w.varietal, w.vintage].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  const agingStatus = selectedWine ? getAgingStatus(selectedWine) : null;
  const timeline = selectedWine ? calcTimelinePosition(selectedWine) : null;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header>
          <div className="logo">
            <svg className="logo-icon" viewBox="0 0 48 48" fill="none">
              <path d="M24 4C24 4 14 14 14 26C14 31.5 18.5 36 24 36C29.5 36 34 31.5 34 26C34 14 24 4 24 4Z" fill="rgba(107,26,42,0.6)" stroke="#c9a84c" strokeWidth="1"/>
              <line x1="24" y1="36" x2="24" y2="44" stroke="#c9a84c" strokeWidth="1.5"/>
              <line x1="19" y1="44" x2="29" y2="44" stroke="#c9a84c" strokeWidth="1.5"/>
              <circle cx="24" cy="24" r="4" fill="rgba(201,168,76,0.3)" stroke="#c9a84c" strokeWidth="0.5"/>
            </svg>
            <div className="logo-text">
              <h1>CAVE</h1>
              <span>Wine Cellar Manager</span>
            </div>
          </div>
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-num">{cellar.length}</span>
              <span className="stat-label">Bottles</span>
            </div>
            <div className="stat">
              <span className="stat-num">{[...new Set(cellar.map(w => w.type))].length}</span>
              <span className="stat-label">Varieties</span>
            </div>
            <div className="stat">
              <span className="stat-num">{cellar.filter(w => getAgingStatus(w).cls === "drink-now").length}</span>
              <span className="stat-label">Ready</span>
            </div>
          </div>
        </header>

        <div className="main-grid">
          {/* Add Wine Panel */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Add to Cellar</span>
            </div>
            <div className="panel-body">
              <div className="tabs">
                <button className={`tab ${tab === "photo" ? "active" : ""}`} onClick={() => setTab("photo")}>
                  📷 Photo
                </button>
                <button className={`tab ${tab === "manual" ? "active" : ""}`} onClick={() => setTab("manual")}>
                  ✍️ Manual
                </button>
              </div>

              {tab === "photo" && (
                <>
                  <div className="photo-zone has-image" style={photoPreview ? {} : {}} onClick={() => !photoPreview && fileInputRef.current?.click()}>
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="Wine" className="photo-preview" />
                        {analyzing && (
                          <div className="analyzing-overlay">
                            <div className="spinner" />
                            <span className="analyzing-text">Identifying wine…</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="photo-zone-text" style={{padding: "40px 20px"}}>
                        <span className="photo-icon">📷</span>
                        <span className="photo-zone-label">Take or Upload Photo</span>
                        <span className="photo-zone-sub">Label, bottle, or cork</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} />

                  {photoPreview && !aiResult && (
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn" style={{flex:1}} onClick={analyzePhoto} disabled={analyzing}>
                        {analyzing ? "Analyzing…" : "✦ Identify Wine"}
                      </button>
                      <button className="btn btn-secondary" style={{flex:"0 0 auto",width:"auto",padding:"14px 16px",marginTop:8}} onClick={() => { setPhotoPreview(null); setPhotoBase64(null); }}>
                        ✕
                      </button>
                    </div>
                  )}
                </>
              )}

              {tab === "manual" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Wine Name *</label>
                    <input className="form-input" placeholder="e.g. Château Margaux, Opus One…" value={manualForm.name} onChange={e => setManualForm(p => ({...p, name: e.target.value}))} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Vintage</label>
                      <input className="form-input" placeholder="2019" value={manualForm.vintage} onChange={e => setManualForm(p => ({...p, vintage: e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select className="form-select" value={manualForm.type} onChange={e => setManualForm(p => ({...p, type: e.target.value}))}>
                        {WINE_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <input className="form-input" placeholder="Bordeaux, Napa Valley…" value={manualForm.region} onChange={e => setManualForm(p => ({...p, region: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Varietal</label>
                    <input className="form-input" placeholder="Cabernet Sauvignon, Chardonnay…" value={manualForm.varietal} onChange={e => setManualForm(p => ({...p, varietal: e.target.value}))} />
                  </div>
                  {!aiResult && (
                    <button className="btn" onClick={analyzeManual} disabled={!manualForm.name || analyzing}>
                      {analyzing ? "Analyzing…" : "✦ Get AI Analysis"}
                    </button>
                  )}
                </>
              )}

              {/* AI Result Preview */}
              {aiResult && (
                <div style={{marginTop: 20, padding: 16, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(201,168,76,0.2)"}}>
                  <div style={{fontFamily:"'Montserrat',sans-serif", fontSize:8, letterSpacing:3, color:"var(--gold)", marginBottom:10, textTransform:"uppercase"}}>AI Analysis Complete</div>
                  <div style={{fontFamily:"'Playfair Display',serif", fontSize:20, color:"var(--cream)", marginBottom:4}}>{aiResult.name}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif", fontSize:14, color:"var(--text-muted)", fontStyle:"italic", marginBottom:12}}>{aiResult.vintage} · {aiResult.region}</div>
                  <div style={{fontSize:13, color:"var(--text)", lineHeight:1.6, marginBottom:12}}>{aiResult.description}</div>
                  <div style={{fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:2, color:"var(--gold)", marginBottom:6, textTransform:"uppercase"}}>Aging Recommendation</div>
                  <div style={{fontSize:13, color:"var(--text)", lineHeight:1.6, marginBottom:16}}>{aiResult.agingPotential} · Peak: {aiResult.peakStart}–{aiResult.peakEnd}</div>
                  <button className="btn" onClick={addToCellar}>Add to Cellar →</button>
                  <button className="btn btn-secondary" onClick={() => setAiResult(null)}>Edit Details</button>
                </div>
              )}
            </div>
          </div>

          {/* Cellar View */}
          <div>
            <div className="filter-bar">
              {["All", ...WINE_TYPES].map(t => (
                <button key={t} className={`filter-btn ${filterType === t ? "active" : ""}`} onClick={() => setFilterType(t)}>
                  {t}
                </button>
              ))}
              <input
                className="search-input"
                placeholder="Search cellar…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍷</div>
                <div className="empty-text">{cellar.length === 0 ? "Your cellar awaits" : "No wines match"}</div>
                <div className="empty-sub">{cellar.length === 0 ? "Add your first bottle" : "Try a different filter"}</div>
              </div>
            ) : (
              <div className="wine-grid">
                {filtered.map(wine => {
                  const aging = getAgingStatus(wine);
                  const tc = getTypeClass(wine.type);
                  return (
                    <div key={wine.id} className="wine-card" onClick={() => setSelectedWine(wine)}>
                      <div className={`wine-card-accent ${tc}`} />
                      <div className="wine-card-body">
                        <div className="wine-card-type">{wine.type} · {wine.varietal}</div>
                        <div className="wine-card-name">{wine.name}</div>
                        <div className="wine-card-vintage">{wine.vintage} · {wine.region}</div>
                        <div className="wine-card-meta">
                          <div className="wine-rating">
                            <span className="rating-label">Score</span>
                            <span className="rating-value">{wine.rating || "—"}</span>
                          </div>
                          <span className={`aging-badge ${aging.cls}`}>{aging.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wine Detail Modal */}
      {selectedWine && (() => {
        const tc = getTypeClass(selectedWine.type);
        const tl = calcTimelinePosition(selectedWine);
        const aging = getAgingStatus(selectedWine);
        return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedWine(null)}>
            <div className="modal">
              <div className="modal-top">
                <div className={`modal-color-bar ${tc}`} />
                <div className="modal-content">
                  <button className="modal-close" onClick={() => setSelectedWine(null)}>✕</button>

                  <div className="modal-header">
                    <div className="modal-type">{selectedWine.type} — {selectedWine.varietal}</div>
                    <div className="modal-name">{selectedWine.name}</div>
                    <div className="modal-vintage">{selectedWine.vintage} · {selectedWine.region}{selectedWine.country ? `, ${selectedWine.country}` : ""}</div>
                  </div>

                  <div className="meta-pills">
                    {selectedWine.rating && <div className="meta-pill"><span className="pill-label">Score</span><span className="pill-value">{selectedWine.rating}</span></div>}
                    <div className="meta-pill"><span className="pill-label">Status</span><span className="pill-value" style={{fontSize:14}}>{aging.label}</span></div>
                    {selectedWine.peakStart && <div className="meta-pill"><span className="pill-label">Peak Window</span><span className="pill-value" style={{fontSize:14}}>{selectedWine.peakStart}–{selectedWine.peakEnd}</span></div>}
                  </div>

                  {/* Aging timeline */}
                  {selectedWine.vintage && (
                    <div className="aging-timeline" style={{marginTop: 24}}>
                      <div className="timeline-label">Aging Timeline</div>
                      <div className="timeline-bar-container">
                        <div className="timeline-bar" style={{width: `${tl.peakEndPct}%`, background: `linear-gradient(to right, transparent ${tl.peakStartPct/tl.peakEndPct*100}%, var(--wine) ${tl.peakStartPct/tl.peakEndPct*100}%, var(--gold))`}} />
                        <div className="timeline-now-marker" style={{left: `${tl.nowPct}%`}}>
                          <div className="timeline-now-label">Now</div>
                        </div>
                      </div>
                      <div className="timeline-years">
                        <span>{tl.vintage}</span>
                        <span>{tl.totalEnd}</span>
                      </div>
                    </div>
                  )}

                  <div className="modal-sections">
                    <div className="modal-section modal-section-full">
                      <h3>Tasting Notes</h3>
                      <p>{selectedWine.description || "No description available."}</p>
                    </div>
                    <div className="modal-section">
                      <h3>Aging Recommendation</h3>
                      <p>{selectedWine.agingPotential || "No aging data available."}</p>
                    </div>
                    <div className="modal-section">
                      <h3>Food Pairing</h3>
                      <p>{selectedWine.foodPairing || "—"}</p>
                    </div>
                    {selectedWine.notes && (
                      <div className="modal-section modal-section-full">
                        <h3>Personal Notes</h3>
                        <p>{selectedWine.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button className="btn-danger" onClick={() => deleteWine(selectedWine.id)}>Remove from Cellar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {notification && <div className="notification">{notification}</div>}
    </>
  );
}
