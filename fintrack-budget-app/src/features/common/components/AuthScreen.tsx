import { useState } from "react";
import { C } from "../../../app/constants";

const initialForm = {
  email: "",
  password: "",
};

export default function AuthScreen({ onSignIn, onSignUp, isLoading, authError }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState(initialForm);
  const [localError, setLocalError] = useState("");

  const submitLabel = mode === "signin" ? "Sign In" : "Create Account";
  const helperText =
    mode === "signin"
      ? "Sign in to load your FinTrack budget across devices."
      : "Create your FinTrack account with email and password.";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setLocalError("Enter both your email and password.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setLocalError("Use a password with at least 6 characters.");
      return;
    }

    const action = mode === "signin" ? onSignIn : onSignUp;
    await action({ email, password });
  };

  const sharedInputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "14px",
    border: `1.5px solid ${C.border}`,
    fontSize: "15px",
    color: C.text,
    background: C.surface,
  };

  return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          backgroundImage: "radial-gradient(circle at top, rgba(30,80,212,0.12), transparent 45%)",
          fontFamily: "'DM Sans', sans-serif",
          color: C.text,
          display: "grid",
          placeItems: "center",
          padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`,
            padding: "28px 28px 24px",
            color: C.white,
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "34px",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            FinTrack
          </div>
          <div
            style={{
              marginTop: "8px",
              fontSize: "13px",
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.74)",
            }}
          >
            Budget Sync
          </div>
          <p
            style={{
              margin: "18px 0 0",
              fontSize: "15px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            {helperText}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "28px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              background: C.surfaceAlt,
              borderRadius: "16px",
              padding: "6px",
              marginBottom: "22px",
            }}
          >
            <button
              type="button"
              onClick={() => setMode("signin")}
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "11px 12px",
                background: mode === "signin" ? C.surface : "transparent",
                color: mode === "signin" ? C.text : C.textMid,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: mode === "signin" ? "0 6px 14px rgba(15,28,77,0.08)" : "none",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "11px 12px",
                background: mode === "signup" ? C.surface : "transparent",
                color: mode === "signup" ? C.text : C.textMid,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: mode === "signup" ? "0 6px 14px rgba(15,28,77,0.08)" : "none",
              }}
            >
              Create Account
            </button>
          </div>

          <div style={{ display: "grid", gap: "14px" }}>
            <input
              type="email"
              autoComplete="email"
              placeholder="Email address"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              style={sharedInputStyle}
            />
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              style={sharedInputStyle}
            />
          </div>

          {(localError || authError) && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                borderRadius: "14px",
                background: C.redLight,
                color: C.red,
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {localError || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px 18px",
              border: "none",
              borderRadius: "16px",
              background: isLoading ? C.blueMid : C.blue,
              color: C.white,
              fontSize: "15px",
              fontWeight: 700,
              cursor: isLoading ? "wait" : "pointer",
              boxShadow: "0 14px 28px rgba(30,80,212,0.22)",
            }}
          >
            {isLoading ? "Working..." : submitLabel}
          </button>

          <p
            style={{
              margin: "16px 0 0",
              fontSize: "13px",
              lineHeight: 1.6,
              color: C.textMid,
              textAlign: "center",
            }}
          >
            Your current browser budget data will migrate into your account the first time you
            sign in on this device.
          </p>
        </form>
      </div>
    </div>
  );
}
