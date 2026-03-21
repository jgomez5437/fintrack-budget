import { C } from "../constants";

export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@900&display=swap');
      
      :root {
        --color-bg: #f0f4ff;
        --color-surface: #ffffff;
        --color-surface-alt: #eef2ff;
        --color-border: #d0d9f5;
        --color-border-hover: #9aaee8;
        --color-blue: #1e50d4;
        --color-blue-dark: #163ba8;
        --color-blue-light: #e8eeff;
        --color-blue-mid: #c5d0f7;
        --color-gold: #f5a623;
        --color-gold-dark: #d9891a;
        --color-gold-light: #fff8ec;
        --color-green: #16a34a;
        --color-green-light: #dcfce7;
        --color-red: #dc2626;
        --color-red-light: #fee2e2;
        --color-orange: #ea580c;
        --color-text: #0f1c4d;
        --color-text-mid: #4a5a8a;
        --color-text-light: #8896bb;
        --color-white: #ffffff;
      }
      
      html.dark {
        --color-bg: #0b1121;
        --color-surface: #151e32;
        --color-surface-alt: #1c2742;
        --color-border: #2c3e66;
        --color-border-hover: #3b5286;
        --color-blue: #3b82f6;
        --color-blue-dark: #2563eb;
        --color-blue-light: #16244d;
        --color-blue-mid: #213670;
        --color-gold: #fbbf24;
        --color-gold-dark: #d97706;
        --color-gold-light: #372a0f;
        --color-green: #22c55e;
        --color-green-light: #113320;
        --color-red: #ef4444;
        --color-red-light: #3e1b1b;
        --color-orange: #f97316;
        --color-text: #f8fafc;
        --color-text-mid: #94a3b8;
        --color-text-light: #64748b;
        --color-white: #ffffff;
      }

      body {
        margin: 0;
        padding: 0;
        background: var(--color-bg);
        color: var(--color-text);
        font-family: 'DM Sans', sans-serif;
        transition: background 0.3s ease, color 0.3s ease;
      }

      * { box-sizing: border-box; }
      input, select { outline: none; }
      input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      input::placeholder { color: ${C.textLight}; }
      select option { background: ${C.surface}; color: ${C.text}; }
      
      .nav-btn:hover { background: rgba(255,255,255,0.3) !important; }
      .income-card:hover { box-shadow: 0 4px 20px rgba(30,80,212,0.25) !important; }
      .income-card:hover .edit-hint { opacity: 1 !important; }
      .tab-btn:hover { color: inherit !important; }
      .cat-row:hover { background: ${C.blueLight} !important; }
      .cat-row:hover .row-actions { opacity: 1 !important; }
      .tx-row:hover { background: ${C.blueLight} !important; }
      .tx-row:hover .tx-actions { opacity: 1 !important; }
      .del-btn:hover { color: ${C.red} !important; }
      .edit-lbl:hover { color: ${C.blue} !important; }
      .dupe-btn:hover { background: ${C.blueLight} !important; color: ${C.blue} !important; }
      .cat-add-btn:hover { background: ${C.gold} !important; color: ${C.white} !important; border-color: ${C.gold} !important; }
      .add-cat-btn:hover { background: ${C.blue} !important; color: ${C.white} !important; }
      .log-btn:hover { background: ${C.blueLight} !important; border-color: ${C.blue} !important; color: ${C.text} !important; }
      .primary-btn:hover { background: ${C.blueDark} !important; }
      .cancel-btn:hover { border-color: ${C.borderHover} !important; color: ${C.textMid} !important; }
      .save-btn:hover { background: ${C.green} !important; color: ${C.white} !important; }
      .ac-item:hover { background: ${C.blueLight} !important; color: ${C.blue} !important; }
      .import-btn:hover { background: ${C.blueLight} !important; border-color: ${C.blue} !important; color: ${C.textMid} !important; }
      .import-row:hover { background: ${C.blueLight} !important; }
      
      .import-table-container { overflow-x: auto; }
      .import-review-grid { grid-template-columns: 32px minmax(0, 2fr) minmax(96px, auto) minmax(0, 1.5fr) 32px; }
      .import-amount-cell { justify-self: end; text-align: right; }
      
      .modern-checkbox {
        appearance: none;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 2px solid ${C.blueMid};
        background: ${C.surface};
        display: inline-grid;
        place-content: center;
        margin: 0;
        transition: all 0.15s ease;
        box-shadow: 0 1px 2px rgba(30,80,212,0.08);
      }
      .modern-checkbox:hover {
        border-color: ${C.blue};
        box-shadow: 0 0 0 4px rgba(30,80,212,0.08);
      }
      .modern-checkbox:checked {
        background-color: ${C.blue};
        border-color: ${C.blue};
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.2 6.7 11 12 5.5' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        background-size: 11px 11px;
        box-shadow: 0 0 0 4px rgba(30,80,212,0.14);
      }
      .modern-checkbox:focus-visible {
        outline: 2px solid rgba(30,80,212,0.28);
        outline-offset: 2px;
      }
      
      .desktop-email-pill { display: block; }
      
      @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      .fade-up { animation: fadeUp 0.3s ease both; }
      .slide-down { animation: slideDown 0.2s ease both; }
      
      .bar-fill { transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }
      .mini-bar-fill { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
      
      @media (max-width: 768px) {
        .desktop-email-pill { display: none; }
        .import-table-container { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .import-table-row { min-width: 0; }
        .import-review-grid { grid-template-columns: 28px minmax(0, 1.8fr) minmax(88px, auto) minmax(0, 1.1fr) 24px; gap: 6px; }
        .tx-bulk-actions { width: 100%; flex-direction: column; align-items: stretch !important; }
        .tx-bulk-buttons { display: grid !important; grid-template-columns: 1fr 1fr; width: 100%; }
      }
    `}</style>
  );
}
