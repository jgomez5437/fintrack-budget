import { C } from "../constants";

export default function RecurringTab({
  recurring,
  formatCurrency,
}) {
  return (
    <div className="fade-up">
      <div
        style={{
          marginBottom: "20px",
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 4px 16px rgba(30,80,212,0.1)",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: C.textLight,
            letterSpacing: "2px",
            marginBottom: "16px",
            fontWeight: 600,
          }}
        >
          RECURRING SUBSCRIPTIONS & BILLS
        </div>

        {recurring && recurring.length > 0 ? (
          <div style={{ display: "grid", gap: "10px" }}>
            {recurring.map((item, index) => (
              <div
                key={item.id || index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  background: index % 2 === 0 ? C.surfaceAlt : C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: C.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </div>
                  {item.dayOfMonth && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: C.textMid,
                        marginTop: "4px",
                        fontWeight: 500,
                      }}
                    >
                      Renews on the {item.dayOfMonth}
                      {["st", "nd", "rd"][((item.dayOfMonth + 90) % 100 - 10) % 10 - 1] || "th"}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: C.text,
                    textAlign: "right",
                  }}
                >
                  ${formatCurrency(Math.abs(parseFloat(item.amount)))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: C.surfaceAlt,
              borderRadius: "12px",
              border: `1px dashed ${C.borderHover}`,
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: C.textMid,
                marginBottom: "8px",
              }}
            >
              No recurring items yet
            </div>
            <div
              style={{
                fontSize: "14px",
                color: C.textLight,
                lineHeight: 1.5,
              }}
            >
              Import transactions from your bank statement. FinTrack AI will automatically detect subscriptions and recurring bills.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
