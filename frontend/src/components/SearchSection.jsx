import React from "react";
import { LOCATIONS, SERVICE_CATS } from "./constants";

export default function SearchSection({
  isDark,
  search,
  setSearch,
  locFilter,
  setLocFilter,
  activeCat,
  setActiveCat,
  showToast,
  scrollToServices,
  onSearch,
}) {
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const titleColor = isDark ? "#fff" : "#0f172a";
  const inputBg = isDark ? "#1e293b" : "#fff";
  const inputBorder = isDark ? "#334155" : "#e2e8f0";

  return (
    <section
      style={{
        background: bgColor,
        padding: "72px 2rem 48px",
        transition: "background 0.3s",
      }}
    >
      <h2
        style={{
          fontFamily: "Syne",
          fontWeight: 800,
          fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
          textAlign: "center",
          color: titleColor,
          marginBottom: 32,
          transition: "color 0.3s",
        }}
      >
        Find Help in Your Area —{" "}
        <span style={{ color: "#16a34a" }}>Start Today!</span>
      </h2>
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto 20px",
          display: "flex",
          background: inputBg,
          border: `1.5px solid ${inputBorder}`,
          borderRadius: 999,
          overflow: "hidden",
          boxShadow: isDark
            ? "0 4px 24px rgba(0,0,0,0.4)"
            : "0 4px 24px rgba(0,0,0,0.06)",
          transition: "all 0.3s",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && showToast(`Searching "${search || "all"}"`)
          }
          placeholder="Search helpers by skill or name..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "14px 20px",
            fontFamily: "DM Sans",
            fontSize: 15,
            color: titleColor,
            background: "transparent",
          }}
        />
        <div style={{ width: 1, background: inputBorder }} />
        <select
          value={locFilter}
          onChange={(e) => setLocFilter(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            padding: "14px 14px",
            fontFamily: "DM Sans",
            fontSize: 14,
            color: isDark ? "#94a3b8" : "#374151",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {LOCATIONS.map((l) => (
            <option key={l} style={{ background: inputBg, color: titleColor }}>
              {l}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (onSearch) {
              onSearch(search, activeCat, locFilter);
            } else {
              showToast(
                `Showing results for "${search || "all helpers"}" in ${locFilter}`,
              );
              scrollToServices();
            }
          }}
          style={{
            background: "#22c55e",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          🔍 FIND HELP
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: isDark ? "#94a3b8" : "#475569",
            fontFamily: "DM Sans",
            fontSize: 13,
            alignSelf: "center",
            marginRight: 4,
          }}
        >
          Filter by:
        </span>
        {SERVICE_CATS.map((cat) => {
          const active = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                background: active ? "#22c55e" : isDark ? "#1e293b" : "#fff",
                color: active ? "#fff" : isDark ? "#94a3b8" : "#374151",
                border: "1.5px solid",
                borderColor: active
                  ? "#22c55e"
                  : isDark
                    ? "#334155"
                    : "#d1d5db",
                borderRadius: 999,
                padding: "6px 16px",
                fontFamily: "DM Sans",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </section>
  );
}
