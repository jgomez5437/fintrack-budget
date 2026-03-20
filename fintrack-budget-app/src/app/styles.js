import { C } from "./constants";

export const inputStyle = {
  background: C.white,
  border: `1.5px solid ${C.border}`,
  color: C.text,
  padding: "12px 14px",
  borderRadius: "8px",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "15px",
  width: "100%",
};

export const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};
