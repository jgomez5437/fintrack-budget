import { C, MONTHS } from "../constants";

export default function NextMonthPromptModal({
  month,
  year,
  isCreating = false,
  onTransfer,
  onCreateBlank,
  onCancel,
}) {
  return (
    <div
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
        style={{
          width: "100%",
          maxWidth: "520px",
          background: C.white,
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
            color: C.blue,
            textTransform: "uppercase",
          }}
        >
          Create Next Month
        </div>
        <h2
          style={{
            margin: "10px 0 0",
            fontSize: "26px",
            color: C.text,
            lineHeight: 1.15,
          }}
        >
          Start {MONTHS[month]} {year} with this month&apos;s setup?
        </h2>
        <p style={{ margin: "14px 0 0", color: C.textMid, lineHeight: 1.7 }}>
          You can carry over your income and budget categories with their amounts. Transactions
          will not be copied into the new month.
        </p>

        <div style={{ display: "grid", gap: "12px", marginTop: "22px" }}>
          <button
            onClick={onTransfer}
            disabled={isCreating}
            style={{
              border: "none",
              borderRadius: "16px",
              padding: "14px 18px",
              background: isCreating ? C.blueMid : C.blue,
              color: C.white,
              fontSize: "15px",
              fontWeight: 700,
              cursor: isCreating ? "wait" : "pointer",
              textAlign: "left",
            }}
          >
            {isCreating ? "Creating..." : "Create next month and transfer budget setup"}
          </button>

          <button
            onClick={onCreateBlank}
            disabled={isCreating}
            style={{
              border: `1.5px solid ${C.border}`,
              borderRadius: "16px",
              padding: "14px 18px",
              background: C.surfaceAlt,
              color: C.text,
              fontSize: "15px",
              fontWeight: 700,
              cursor: isCreating ? "wait" : "pointer",
              textAlign: "left",
            }}
          >
            Create next month without transferring anything
          </button>

          <button
            onClick={onCancel}
            disabled={isCreating}
            style={{
              border: "none",
              borderRadius: "16px",
              padding: "12px 18px",
              background: "transparent",
              color: C.textMid,
              fontSize: "14px",
              fontWeight: 700,
              cursor: isCreating ? "wait" : "pointer",
            }}
          >
            Not yet, stay on this month
          </button>
        </div>
      </div>
    </div>
  );
}
