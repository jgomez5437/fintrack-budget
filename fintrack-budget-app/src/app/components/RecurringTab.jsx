import { C } from "../constants";

export default function RecurringTab({
  recurring,
  formatCurrency,
  getCategoryById,
}) {
  return (
    <div className="fade-up">
      <div
        style={{
          marginBottom: "20px",
          background: C.surface,
          border: `1.5px solid ${C.border}`,
          borderRadius: "14px",
          boxShadow: "0 4px 16px rgba(30,80,212,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: recurring && recurring.length > 0 ? `1px solid ${C.border}` : "none",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: C.textLight,
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            RECURRING SUBSCRIPTIONS & BILLS
          </div>
        </div>

        {recurring && recurring.length > 0 ? (
          <div>
            {recurring.map((item, index) => {
              const category = getCategoryById ? getCategoryById(item.categoryId) : null;
              return (
              <div
                key={item.id || index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px 18px",
                  background: index % 2 === 0 ? C.surface : C.surfaceAlt,
                  borderBottom: index < recurring.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
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
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "3px",
                        flexWrap: "wrap",
                      }}
                    >
                      {category ? (
                        <div
                          style={{
                            fontSize: "11px",
                            color: C.blue,
                            background: C.blueLight,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 600,
                          }}
                        >
                          {category.name}
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: "11px",
                            color: C.textLight,
                            background: C.surfaceAlt,
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          Uncategorized
                        </div>
                      )}
                      
                      <div
                        style={{
                          fontSize: "11px",
                          color: C.textLight,
                        }}
                      >
                        Renews on the {item.dayOfMonth}{["st", "nd", "rd"][((item.dayOfMonth + 90) % 100 - 10) % 10 - 1] || "th"}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: C.text,
                    flexShrink: 0
                  }}
                >
                  ${formatCurrency(Math.abs(parseFloat(item.amount)))}
                </div>
              </div>
            );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: C.surfaceAlt,
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
