import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants";

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

function ConfirmBackModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,28,77,0.36)",
      display: "grid",
      placeItems: "center",
      zIndex: 2000,
      padding: "16px",
    }}>
      <div style={{
        background: C.surface,
        border: `1.5px solid ${C.border}`,
        borderRadius: "18px",
        padding: "20px",
        maxWidth: "360px",
        width: "100%",
        boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
      }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: C.text, marginBottom: "6px" }}>
          Go back to Tools?
        </div>
        <div style={{ fontSize: "14px", color: C.textMid, lineHeight: 1.5, marginBottom: "16px" }}>
          You'll leave the mortgage calculator. Are you sure you want to go back?
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: C.surfaceAlt,
              border: `1.5px solid ${C.border}`,
              color: C.textMid,
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Stay here
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: C.blue,
              border: "none",
              color: C.white,
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Yes, go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ToolsMortgage() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const [homePrice, setHomePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [taxes, setTaxes] = useState("");
  const [insurance, setInsurance] = useState("");
  const [hoa, setHoa] = useState("");

  const [nationalRate, setNationalRate] = useState(null);
  const [loadingRate, setLoadingRate] = useState(true);

  useEffect(() => {
    const fetchNationalRate = async () => {
      try {
        const response = await fetch("https://api.rateapi.dev/v1/benchmarks", {
          headers: {
            "X-API-Key": "rk_9f2cdd827f107ee4a2d0bd4a90c6d70354b59178304bfba88067a63a5a644ca2"
          }
        });
        const data = await response.json();
        const mort30 = data.benchmarks?.find(b => b.product_type === "mortgage_30yr");
        if (mort30) {
          const calculatedAvg = mort30.median_apr || ((mort30.min_rate + mort30.max_rate) / 2);
          setNationalRate(calculatedAvg.toFixed(2));
        } else {
          setNationalRate("6.44");
        }
      } catch (err) {
        console.error("Failed to fetch national average rate", err);
        setNationalRate("6.44");
      } finally {
        setLoadingRate(false);
      }
    };
    fetchNationalRate();
  }, []);

  const num = (val) => {
    const n = parseFloat(val);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const handleNumChange = (setter) => (event) => {
    const v = event.target.value;
    if (v === "") return setter("");
    if (!/^\d*\.?\d*$/.test(v)) return;
    setter(v.replace(/^0+(\d)/, "$1"));
  };

  const result = useMemo(() => {
    const principal = Math.max(num(homePrice) - num(downPayment), 0);
    const monthlyRate = (num(rate) / 100) / 12;
    const n = num(years) * 12;
    const basePayment = monthlyRate === 0
      ? (n === 0 ? 0 : principal / n)
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
    const monthlyTaxes = num(taxes) / 12;
    const monthlyInsurance = num(insurance) / 12;
    const monthlyHoa = num(hoa);
    const totalPayment = basePayment + monthlyTaxes + monthlyInsurance + monthlyHoa;
    const totalInterest = basePayment * n - principal;
    return {
      principal,
      basePayment,
      totalPayment,
      monthlyTaxes,
      monthlyInsurance,
      monthlyHoa,
      totalInterest,
    };
  }, [homePrice, downPayment, rate, years, taxes, insurance, hoa]);

  const formatMoney = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const totalExtras = result.monthlyTaxes + result.monthlyInsurance + result.monthlyHoa;
  const principalShare = result.basePayment - (result.principal * (rate / 100 / 12));
  const interestShare = result.basePayment - principalShare;
  const totalPie = result.basePayment + totalExtras || 1;

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <ConfirmBackModal
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => navigate("/tools")}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            border: `1.5px solid ${C.border}`,
            background: C.surface,
            color: C.text,
            padding: "10px 14px",
            borderRadius: "12px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Back to Tools
        </button>
        <div style={{ fontSize: "22px", fontWeight: 800, color: C.text }}>Mortgage Calculator</div>
      </div>

      <div style={{
        background: `linear-gradient(135deg, ${C.surfaceAlt}, ${C.surface})`,
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        border: `1.5px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: C.text }}>
            Current National Average (30-Year)
          </div>
          <div style={{ fontSize: "12px", color: C.textMid, fontWeight: 700 }}>
            Powered by RateAPI
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {loadingRate ? (
            <div style={{ fontSize: "16px", fontWeight: 800, color: C.textMid }}>Loading...</div>
          ) : (
            <div style={{ fontSize: "18px", fontWeight: 900, color: C.green }}>
              {nationalRate}%
            </div>
          )}
          <button
            onClick={() => setRate(nationalRate)}
            disabled={loadingRate}
            style={{
              padding: "10px 14px",
              background: C.blue,
              color: C.white,
              border: "none",
              borderRadius: "12px",
              fontWeight: 800,
              cursor: loadingRate ? "default" : "pointer",
              opacity: loadingRate ? 0.6 : 1,
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) => !loadingRate && (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => !loadingRate && (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => !loadingRate && (e.currentTarget.style.transform = "scale(1)")}
          >
            Use this rate
          </button>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px",
      }}>
        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontWeight: 800, color: C.text }}>Loan Details</div>

          <label style={fieldStyle}>
            <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Home price</span>
            <input
              type="text"
              value={homePrice}
              placeholder="0"
              onChange={handleNumChange(setHomePrice)}
              onFocus={(e) => homePrice === "0" && e.target.select()}
              style={{ padding: "10px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.text, background: C.surface }}
            />
          </label>

          <label style={fieldStyle}>
            <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Down payment</span>
            <input
              type="text"
              value={downPayment}
              placeholder="0"
              onChange={handleNumChange(setDownPayment)}
              onFocus={(e) => downPayment === "0" && e.target.select()}
              style={{ padding: "10px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.text, background: C.surface }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <label style={fieldStyle}>
              <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Rate (APR %)</span>
              <input
                type="text"
                value={rate}
                placeholder="0"
                onChange={handleNumChange(setRate)}
                onFocus={(e) => rate === "0" && e.target.select()}
                style={{ padding: "10px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.text, background: C.surface }}
              />
            </label>
            <label style={fieldStyle}>
              <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Term (years)</span>
              <input
                type="text"
                value={years}
                placeholder="0"
                onChange={handleNumChange(setYears)}
                onFocus={(e) => years === "0" && e.target.select()}
                style={{ padding: "10px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.text, background: C.surface }}
              />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <label style={fieldStyle}>
              <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Property taxes / yr</span>
              <input
                type="text"
                value={taxes}
                placeholder="0"
                onChange={handleNumChange(setTaxes)}
                onFocus={(e) => taxes === "0" && e.target.select()}
                style={{ padding: "10px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.text, background: C.surface }}
              />
            </label>
            <label style={fieldStyle}>
              <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>Insurance / yr</span>
              <input
                type="text"
                value={insurance}
                placeholder="0"
                onChange={handleNumChange(setInsurance)}
                onFocus={(e) => insurance === "0" && e.target.select()}
                style={{ padding: "10px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.text, background: C.surface }}
              />
            </label>
            <label style={fieldStyle}>
              <span style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>HOA / mo</span>
              <input
                type="text"
                value={hoa}
                placeholder="0"
                onChange={handleNumChange(setHoa)}
                onFocus={(e) => hoa === "0" && e.target.select()}
                style={{ padding: "10px", borderRadius: "10px", border: `1.5px solid ${C.border}`, fontWeight: 700, color: C.text, background: C.surface }}
              />
            </label>
          </div>
        </div>

        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontWeight: 800, color: C.text }}>Monthly Payment</div>
          <div style={{ fontSize: "32px", fontWeight: 900, color: C.text }}>
            {formatMoney(result.totalPayment)}
          </div>
          <div style={{ fontSize: "13px", color: C.textMid, lineHeight: 1.5 }}>
            Principal & Interest: {formatMoney(result.basePayment)} • Taxes: {formatMoney(result.monthlyTaxes)} • Insurance: {formatMoney(result.monthlyInsurance)} • HOA: {formatMoney(result.monthlyHoa)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
            <Breakdown label="Principal" value={principalShare} color={C.green} total={totalPie} />
            <Breakdown label="Interest (month)" value={interestShare} color={C.red} total={totalPie} />
            <Breakdown label="Taxes/Ins/HOA" value={totalExtras} color={C.gold} total={totalPie} />
          </div>

          <div style={{
            background: C.surfaceAlt,
            borderRadius: "12px",
            padding: "12px",
            border: `1.5px solid ${C.border}`,
          }}>
            <div style={{ fontSize: "13px", color: C.textLight, fontWeight: 700 }}>Loan overview</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "15px", fontWeight: 800, color: C.text }}>
              <span>Total interest (life)</span>
              <span>{formatMoney(result.totalInterest.toFixed(0))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "13px", color: C.textMid }}>
              <span>Loan amount</span>
              <span>{formatMoney(result.principal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Breakdown({ label, value, color, total }) {
  const pct = Math.max(0, Math.round((value / (total || 1)) * 100));
  return (
    <div style={{
      border: `1.5px solid ${C.border}`,
      borderRadius: "12px",
      padding: "10px",
      background: C.surface,
    }}>
      <div style={{ fontSize: "12px", color: C.textLight, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: "16px", fontWeight: 800, color: C.text }}>{value >= 0 ? `$${value.toFixed(0)}` : "$0"}</div>
      <div style={{ height: "6px", background: C.surfaceAlt, borderRadius: "999px", marginTop: "8px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}
