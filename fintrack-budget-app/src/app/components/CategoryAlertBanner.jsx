import { C } from "../constants";

export default function CategoryAlertBanner({ alerts, formatCurrency, onDismiss }) {
  if (!alerts.length) return null;

  return (
    <div
      className="fade-up"
      style={{
        marginBottom: "18px",
        padding: "18px 18px 16px",
        borderRadius: "18px",
        border: `1.5px solid ${C.orange}`,
        background: C.orangeLight,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "10px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.8px",
              color: C.orange,
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            Budget Heads-Up
          </div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
            These categories are at 85% or above
          </div>
        </div>

        <button
          onClick={onDismiss}
          aria-label="Dismiss category alerts"
          style={{
            border: "none",
            background: "transparent",
            color: C.textLight,
            fontSize: "22px",
            lineHeight: 1,
            cursor: "pointer",
            padding: "0 2px",
          }}
        >
          x
        </button>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {alerts.map((alert) => {
          const remaining = alert.budget - alert.spent;

          return (
            <div
              key={alert.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "14px",
                background: C.surface,
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: C.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {alert.name}
                </div>
                <div style={{ fontSize: "13px", color: C.textMid, marginTop: "2px" }}>
                  ${formatCurrency(alert.spent)} of ${formatCurrency(alert.budget)} used
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: C.orange }}>
                  {Math.round(alert.pctUsed)}%
                </div>
                <div style={{ fontSize: "12px", color: C.textLight }}>
                  {remaining >= 0
                    ? `$${formatCurrency(remaining)} left`
                    : `$${formatCurrency(Math.abs(remaining))} over`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
