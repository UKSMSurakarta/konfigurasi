import { useState, useEffect } from "react";

let showToastFn = null;

export function useToast() {
  function showToast(msg, type = "success") {
    if (showToastFn) showToastFn(msg, type);
  }
  return { showToast };
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFn = (msg, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, msg, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    };
  }, []);

  const colors = {
    success: { bg: "#1D9E75", text: "white" },
    error: { bg: "#E24B4A", text: "white" },
    info: { bg: "#185FA5", text: "white" },
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: colors[t.type]?.bg || colors.success.bg,
            color: colors[t.type]?.text || "white",
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            animation: "slideIn 0.2s ease",
          }}
        >
          {t.msg}
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}
