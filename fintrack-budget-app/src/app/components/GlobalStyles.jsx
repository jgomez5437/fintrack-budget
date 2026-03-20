import { C } from "../constants";

export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@900&display=swap');
      * { box-sizing: border-box; }
      input, select { outline: none; }
      input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      input::placeholder { color: ${C.textLight}; }
      select option { background: ${C.white}; color: ${C.text}; }
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
      @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      .fade-up { animation: fadeUp 0.3s ease both; }
      .slide-down { animation: slideDown 0.2s ease both; }
      .bar-fill { transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }
      .mini-bar-fill { transition: width 0.6s cubic-bezier(0.4,0,0.2,1); }
      @media (max-width: 768px) {
        .import-table-container { overflow-x: scroll; -webkit-overflow-scrolling: touch; }
        .import-table-row { min-width: 600px; }
      }
    `}</style>
  );
}
