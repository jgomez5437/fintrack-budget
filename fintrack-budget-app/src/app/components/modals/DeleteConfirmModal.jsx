import { useEffect } from "react";
import { C } from "../../constants";

export default function DeleteConfirmModal({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,28,77,0.46)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        zIndex: 30,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: C.surface,
          borderRadius: "24px",
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 70px rgba(15,28,77,0.18)",
          padding: "24px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1.6px",
            color: C.red,
            textTransform: "uppercase",
          }}
        >
          Confirm Deletion
        </div>
        <h2
          style={{
            margin: "10px 0 0",
            fontSize: "26px",
            color: C.text,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
        <p style={{ margin: "14px 0 0", color: C.textMid, lineHeight: 1.7 }}>
          {description}
        </p>

        <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
          <button
            onClick={onConfirm}
            style={{
              border: "none",
              borderRadius: "16px",
              padding: "14px 18px",
              background: C.red,
              color: C.white,
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>

          <button
            onClick={onCancel}
            style={{
              border: `1.5px solid ${C.border}`,
              borderRadius: "16px",
              padding: "14px 18px",
              background: C.surfaceAlt,
              color: C.text,
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
