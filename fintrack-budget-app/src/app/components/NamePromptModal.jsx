import { useState } from "react";
import { C } from "../constants";

export default function NamePromptModal({ onSaveName }) {
  const [nameInput, setNameInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onSaveName(nameInput.trim());
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 28, 77, 0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
        animation: "fadeIn 0.2s ease-out",
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      <div
        className="fade-up"
        style={{
          width: "100%",
          maxWidth: "400px",
          background: C.surface,
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)",
          border: `1px solid ${C.border}`,
          color: C.text,
          textAlign: "center"
        }}
      >
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "32px",
          fontWeight: 900,
          color: C.blue,
          lineHeight: 1,
          margin: "0 0 12px 0"
        }}>
          Welcome to FinTrack
        </div>
        <p style={{
          fontSize: "15px",
          color: C.textMid,
          lineHeight: 1.6,
          margin: "0 0 28px 0"
        }}>
          FinTrack is your ultimate personal finance companion, designed to effortlessly 
          sync your budget, track expenses, and project your financial health across all devices.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: "left", marginBottom: "10px", fontWeight: 700, fontSize: "14px", color: C.text }}>
            What should we call you?
          </div>
          <input 
            type="text"
            placeholder="Enter your first name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: `1.5px solid ${C.border}`,
              background: C.surfaceAlt,
              fontSize: "16px",
              color: C.text,
              marginBottom: "28px",
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              background: nameInput.trim() ? C.blue : C.blueMid,
              border: "none",
              color: C.white,
              fontWeight: 700,
              fontSize: "16px",
              cursor: nameInput.trim() ? "pointer" : "not-allowed",
              boxShadow: nameInput.trim() ? "0 8px 16px rgba(30,80,212,0.25)" : "none",
              transition: "all 0.2s"
            }}
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
}
