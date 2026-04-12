import { useState, useEffect } from "react";
import { C } from "../../../app/constants";
import { getSupabase } from "../../../app/services/supabase";

export default function SettingsModal({ onClose, session, onSignOut, isSigningOut, onGenerateSummary, isGeneratingSummary }) {
  const [loading, setLoading] = useState(true);
  const [activeCode, setActiveCode] = useState(null);
  const [isLinked, setIsLinked] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const supabase = getSupabase();

  useEffect(() => {
    fetchLinkStatus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fetchLinkStatus = async () => {
    if (!supabase || !session?.user?.id) return;
    setLoading(true);
    setError("");
    
    try {
      // 1. Check if user is linked to someone else
      const { data: linkData } = await supabase
        .from("account_links")
        .select("*")
        .eq("linked_user_id", session.user.id)
        .maybeSingle();

      setIsLinked(!!linkData);

      // 2. Check if user has an active invite code they generated
      const { data: inviteData } = await supabase
        .from("budget_invites")
        .select("invite_code, expires_at")
        .eq("primary_user_id", session.user.id)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (inviteData) {
        setActiveCode(inviteData.invite_code);
      } else {
        setActiveCode(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    
    try {
      // Create a random 6-character alphanumeric code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // 24 hour expiry

      const { error: inviteErr } = await supabase.from("budget_invites").insert({
        primary_user_id: session.user.id,
        invite_code: code,
        expires_at: expires.toISOString(),
      });

      if (inviteErr) throw inviteErr;
      setActiveCode(code);
      setSuccess("Invite code generated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to generate code.");
    } finally {
      setLoading(false);
    }
  };

  const joinBudget = async () => {
    if (!supabase || !joinCode.trim()) return;
    setLoading(true);
    setError("");
    
    try {
      const code = joinCode.trim().toUpperCase();
      
      // Lookup the invite
      const { data: inviteData, error: inviteErr } = await supabase
        .from("budget_invites")
        .select("primary_user_id, expires_at")
        .eq("invite_code", code)
        .maybeSingle();

      if (inviteErr || !inviteData) {
        throw new Error("Invalid or expired code.");
      }

      if (new Date(inviteData.expires_at) < new Date()) {
        throw new Error("This code has expired.");
      }

      if (inviteData.primary_user_id === session.user.id) {
        throw new Error("You cannot link to your own account.");
      }

      // Create the link
      const { error: linkErr } = await supabase.from("account_links").insert({
        primary_user_id: inviteData.primary_user_id,
        linked_user_id: session.user.id,
      });

      if (linkErr) throw linkErr;

      setIsLinked(true);
      setJoinCode("");
      setSuccess("Account successfully linked! Reloading...");
      
      // Reload page to re-initialize storage.js with new linked user ID
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const unlinkAccount = async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    
    try {
      const { error } = await supabase
        .from("account_links")
        .delete()
        .eq("linked_user_id", session.user.id);

      if (error) throw error;
      
      setIsLinked(false);
      setSuccess("Account unlinked! Reloading...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError("Failed to unlink account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          animation: "fadeIn 0.2s ease",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: C.surface,
          width: "90%",
          maxWidth: "400px",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          zIndex: 10000,
          overflow: "hidden",
          animation: "scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: 800, color: C.text }}>Account Settings</div>
          <button
            onClick={onClose}
            style={{
              background: C.surfaceAlt,
              border: "none",
              width: "32px",
              height: "32px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.textMid,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto" }}>
          {error && (
            <div style={{ padding: "12px", background: C.redLight, color: C.red, borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: "12px", background: C.greenLight, color: C.green, borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
              {success}
            </div>
          )}

          {isLinked ? (
            <div style={{ background: C.surfaceAlt, padding: "16px", borderRadius: "12px", border: `1.5px solid ${C.border}` }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>Budget Linked</div>
              <div style={{ fontSize: "13px", color: C.textMid, lineHeight: 1.5, marginBottom: "16px" }}>
                You are currently viewing and editing another account's budget. Any changes you make will sync directly to their device.
              </div>
              <button
                onClick={unlinkAccount}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: C.red,
                  color: C.white,
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading ? 0.7 : 1
                }}
              >
                Unlink Account
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>Share Your Budget</div>
                <div style={{ fontSize: "13px", color: C.textMid, lineHeight: 1.5, marginBottom: "16px" }}>
                  Generate a code to securely invite someone else (like a partner) to view and edit your budget from their own device.
                </div>
                
                {activeCode ? (
                  <div style={{ background: C.blueLight, border: `1.5px solid ${C.blueMid}`, padding: "16px", borderRadius: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "12px", color: C.blueDark, fontWeight: 700, marginBottom: "4px", letterSpacing: "1px" }}>YOUR INVITE CODE</div>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: C.blue, letterSpacing: "4px" }}>{activeCode}</div>
                    <div style={{ fontSize: "12px", color: C.blueDark, marginTop: "8px" }}>Expires in 24 hours</div>
                  </div>
                ) : (
                  <button
                    onClick={generateCode}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: C.blue,
                      color: C.white,
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: loading ? "wait" : "pointer",
                      boxShadow: "0 4px 12px rgba(30,80,212,0.2)",
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    Generate Invite Code
                  </button>
                )}
              </div>

              <div style={{ borderTop: `1.5px dashed ${C.border}`, paddingTop: "24px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>Join A Budget</div>
                <div style={{ fontSize: "13px", color: C.textMid, lineHeight: 1.5, marginBottom: "16px" }}>
                  Have an invite code from someone else? Enter it below to seamlessly link to their budget database.
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. A1B2C3"
                    maxLength={6}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: `1.5px solid ${C.border}`,
                      background: C.surface,
                      color: C.text,
                      fontSize: "15px",
                      fontWeight: 700,
                      outline: "none",
                      textTransform: "uppercase"
                    }}
                  />
                  <button
                    onClick={joinBudget}
                    disabled={loading || joinCode.length < 5}
                    style={{
                      padding: "0 20px",
                      background: joinCode.length < 5 ? C.surfaceAlt : C.gold,
                      color: joinCode.length < 5 ? C.textLight : C.white,
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: joinCode.length < 5 || loading ? "not-allowed" : "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Join
                  </button>
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: "24px", borderTop: `1px solid ${C.border}`, paddingTop: "24px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>AI Weekly Summary</div>
            <div style={{ fontSize: "13px", color: C.textMid, lineHeight: 1.5, marginBottom: "14px" }}>
              Normally generates automatically each Sunday. Tap below to generate one right now with this week's data.
            </div>
            <button
              onClick={onGenerateSummary}
              disabled={isGeneratingSummary || loading}
              style={{
                width: "100%",
                padding: "13px",
                background: `linear-gradient(135deg, #1e50d4 0%, #6366f1 100%)`,
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: isGeneratingSummary || loading ? "wait" : "pointer",
                opacity: isGeneratingSummary || loading ? 0.7 : 1,
                transition: "all 0.2s",
              }}
            >
              {isGeneratingSummary ? "Generating…" : "✦ Generate Summary Now"}
            </button>
          </div>

          <div style={{ marginTop: "24px", borderTop: `1px solid ${C.border}`, paddingTop: "24px" }}>
            <button
              onClick={onSignOut}
              disabled={isSigningOut || loading}
              style={{
                width: "100%",
                padding: "14px",
                background: "transparent",
                color: C.red,
                border: `1.5px solid ${C.redLight}`,
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: isSigningOut || loading ? "wait" : "pointer",
                transition: "all 0.2s",
                opacity: isSigningOut || loading ? 0.7 : 1
              }}
            >
              {isSigningOut ? "Signing Out..." : "Sign Out of FinTrack"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
