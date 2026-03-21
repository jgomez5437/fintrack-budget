export default function SkeletonDashboard() {
  const SkeletonBox = ({ style, className }) => (
    <div
      className={`skeleton-shimmer ${className || ""}`}
      style={{
        borderRadius: "8px",
        background: "var(--color-surface-alt)",
        ...style,
      }}
    />
  );

  return (
    <div className="fade-up">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
          background-color: var(--color-surface-alt);
        }
        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0,
            rgba(0, 0, 0, 0.04) 20%,
            rgba(0, 0, 0, 0.08) 60%,
            rgba(0, 0, 0, 0)
          );
          animation: shimmer 1.5s infinite;
        }
        .dark .skeleton-shimmer::after {
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.03) 20%,
            rgba(255, 255, 255, 0.06) 60%,
            rgba(255, 255, 255, 0)
          );
        }
      `}</style>
      
      {/* 8 Tiles Skeleton */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px",
        marginBottom: "24px",
      }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: "14px",
            padding: "20px",
            height: "116px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <SkeletonBox style={{ width: "50%", height: "14px", borderRadius: "4px" }} />
            <SkeletonBox style={{ width: "70%", height: "26px", borderRadius: "6px" }} />
            <SkeletonBox style={{ width: "40%", height: "12px", borderRadius: "4px" }} />
          </div>
        ))}
      </div>

      {/* Tab Switcher Skeleton */}
      <div style={{
        background: "var(--color-surface-alt)",
        borderRadius: "10px",
        height: "46px",
        marginBottom: "24px",
        display: "flex",
        padding: "4px"
      }}>
        <SkeletonBox style={{ flex: 1, height: "100%", borderRadius: "8px", background: "var(--color-surface)", border: "1.5px solid var(--color-border)" }} />
        <SkeletonBox style={{ flex: 1, height: "100%", borderRadius: "8px", background: "transparent" }} />
        <SkeletonBox style={{ flex: 1, height: "100%", borderRadius: "8px", background: "transparent" }} />
      </div>

      {/* Budget Tab Section Title Skeleton */}
      <SkeletonBox style={{ width: "130px", height: "12px", borderRadius: "4px", marginBottom: "16px" }} />

      {/* Add Button Skeleton */}
      <SkeletonBox style={{ width: "100%", height: "52px", borderRadius: "10px", marginBottom: "16px" }} />

      {/* Budget Rows Skeleton */}
      <div style={{
        borderRadius: "12px",
        border: "1.5px solid var(--color-border)",
        background: "var(--color-surface)",
        overflow: "hidden"
      }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            padding: "14px 18px",
            borderBottom: i < 2 ? "1px solid var(--color-border)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}>
            <SkeletonBox style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0 }} />
            
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <SkeletonBox style={{ width: "45%", height: "16px", borderRadius: "4px" }} />
                  <SkeletonBox style={{ width: "20%", height: "16px", borderRadius: "4px" }} />
               </div>
               <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <SkeletonBox style={{ width: "25%", height: "12px", borderRadius: "4px" }} />
                  <SkeletonBox style={{ width: "25%", height: "12px", borderRadius: "4px" }} />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
