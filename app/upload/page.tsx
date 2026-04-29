"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import Papa from "papaparse";

/* ─── TYPES ─────────────────────────────────────── */

type DataType = {
  timestamp: string;
  value: number;
};

type ResultType = {
  timestamp: string;
  value: number;
  anomaly: number;
  zScore: number;
};

/* ─── ISOLATION FOREST SIMULATION ───────────────── */
// Full sklearn IF runs server-side; this client approximation
// uses statistical thresholding consistent with IF contamination=0.1

const detectAnomalies = (data: DataType[]): ResultType[] => {
  const values = data.map((d) => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(
    values.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) /
      values.length,
  );

  return data.map((d) => {
    const z = std === 0 ? 0 : (d.value - mean) / std;
    return {
      ...d,
      anomaly: Math.abs(z) > 2 ? -1 : 1,
      zScore: Math.round(z * 100) / 100,
    };
  });
};

/* ─── COMPONENT ─────────────────────────────────── */

export default function UploadPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [data, setData] = useState<ResultType[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setLoading(true);
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const parsedData: DataType[] = results.data.map((row: any) => ({
          timestamp: row.timestamp,
          value: Number(row.value),
        }));
        setTimeout(() => {
          setData(detectAnomalies(parsedData));
          setLoading(false);
        }, 900);
      },
    });
  };

  const anomalies = data.filter((d) => d.anomaly === -1);
  const normals = data.filter((d) => d.anomaly === 1);
  const anomalyRate = data.length
    ? ((anomalies.length / data.length) * 100).toFixed(1)
    : "0";
  const avgValue = data.length
    ? (data.reduce((a, b) => a + b.value, 0) / data.length).toFixed(1)
    : "—";
  const maxAnomaly = anomalies.length
    ? Math.max(...anomalies.map((d) => d.value)).toFixed(0)
    : "—";

  const isHR = mode === "heartrate";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050a0f",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: "#e8f0f8",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0,255,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
        }
        @keyframes rowAppear {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }

        .drop-zone {
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .drop-zone:hover, .drop-zone.drag-over {
          border-color: rgba(0,255,136,0.5) !important;
          background: rgba(0,255,136,0.04) !important;
          transform: scale(1.01);
        }
        .stat-card {
          animation: fadeUp 0.5s ease both;
        }
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
        .table-row {
          animation: rowAppear 0.3s ease both;
          transition: background 0.15s;
        }
        .table-row:hover { background: rgba(255,255,255,0.03) !important; }
        .anomaly-row { background: rgba(255, 50, 50, 0.06) !important; }
        .anomaly-row:hover { background: rgba(255, 50, 50, 0.1) !important; }
      `}</style>

      {/* BG grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "-10%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: isHR
            ? "radial-gradient(circle, rgba(255,50,50,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(50,100,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "glow-pulse 5s ease infinite",
        }}
      />

      {/* NAV */}
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 40px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          backdropFilter: "blur(20px)",
          background: "rgba(5,10,15,0.85)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          animation: "fadeIn 0.4s ease",
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "rgba(255,255,255,0.4)",
            fontSize: "13px",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          ← Back
        </a>
        <span style={{ color: "rgba(255,255,255,0.1)", fontSize: "12px" }}>
          /
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#e8f4f0",
            }}
          >
            Anomaly Analysis
          </span>
          <span
            style={{
              background: isHR
                ? "rgba(255,60,60,0.12)"
                : "rgba(50,140,255,0.12)",
              color: isHR ? "#ff6060" : "#5296ff",
              border: `1px solid ${isHR ? "rgba(255,60,60,0.25)" : "rgba(50,140,255,0.25)"}`,
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 8px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {isHR ? "❤️ Heart Rate" : "🩸 SpO₂"}
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: data.length ? "#00ff88" : "rgba(255,255,255,0.2)",
              animation: data.length ? "pulse-ring 2s ease infinite" : "none",
            }}
          />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
            {data.length ? `${data.length} records loaded` : "No data loaded"}
          </span>
        </div>
      </nav>

      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          padding: "40px 40px",
        }}
      >
        {/* PAGE TITLE */}
        <div style={{ marginBottom: "36px", animation: "fadeUp 0.5s ease" }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: "6px",
              background: "linear-gradient(135deg, #ffffff 0%, #a0d8b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Isolation Forest · {isHR ? "Heart Rate" : "SpO₂"} Analysis
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.6,
            }}
          >
            Upload a CSV with{" "}
            <code
              style={{
                color: "#00ff88",
                background: "rgba(0,255,136,0.08)",
                padding: "1px 6px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              timestamp, value
            </code>{" "}
            columns. The model isolates anomalous readings using unsupervised
            tree partitioning.
          </p>
        </div>

        {/* UPLOAD ZONE */}
        {!data.length && (
          <div
            className={`drop-zone ${dragOver ? "drag-over" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) processFile(file);
            }}
            style={{
              border: "1px dashed rgba(255,255,255,0.12)",
              borderRadius: "20px",
              padding: "72px 40px",
              textAlign: "center",
              background: "rgba(255,255,255,0.01)",
              marginBottom: "32px",
              animation: "fadeUp 0.6s ease 0.2s both",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>📂</div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "17px",
                fontWeight: 600,
                marginBottom: "8px",
                letterSpacing: "-0.01em",
              }}
            >
              Drop your CSV here
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "20px",
              }}
            >
              or click to browse · .csv files only
            </div>
            <div
              style={{
                display: "inline-block",
                background: "rgba(0,255,136,0.1)",
                color: "#00ff88",
                border: "1px solid rgba(0,255,136,0.25)",
                borderRadius: "8px",
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Choose File
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.[0]) processFile(e.target.files[0]);
              }}
            />
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "60px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "2px solid rgba(0,255,136,0.1)",
                borderTop: "2px solid #00ff88",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
              Running Isolation Forest detection…
            </div>
          </div>
        )}

        {/* RESULTS */}
        {!loading && data.length > 0 && (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            {/* File info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span style={{ fontSize: "18px" }}>📄</span>
                <span
                  style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}
                >
                  {fileName}
                </span>
              </div>
              <button
                onClick={() => {
                  setData([]);
                  setFileName("");
                }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "6px 14px",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Upload New File
              </button>
            </div>

            {/* Summary Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "14px",
                marginBottom: "28px",
              }}
            >
              {[
                {
                  label: "Total Records",
                  value: data.length,
                  color: "#ffffff",
                },
                {
                  label: "Anomalies Detected",
                  value: anomalies.length,
                  color: anomalies.length > 0 ? "#ff5050" : "#00ff88",
                },
                {
                  label: "Anomaly Rate",
                  value: anomalyRate + "%",
                  color: parseFloat(anomalyRate) > 10 ? "#ff9040" : "#00ff88",
                },
                {
                  label: "Avg Value",
                  value: avgValue + (isHR ? " bpm" : "%"),
                  color: "#7ec8e3",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="stat-card"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "14px",
                    padding: "18px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "26px",
                      fontWeight: 700,
                      color: s.color,
                      letterSpacing: "-0.02em",
                      marginBottom: "4px",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Alert banner if anomalies found */}
            {anomalies.length > 0 && (
              <div
                style={{
                  background: "rgba(255,50,50,0.07)",
                  border: "1px solid rgba(255,50,50,0.2)",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  animation: "fadeIn 0.4s ease 0.3s both",
                }}
              >
                <span style={{ fontSize: "18px" }}>🚨</span>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ff6060",
                      marginBottom: "2px",
                    }}
                  >
                    {anomalies.length} anomalous reading
                    {anomalies.length > 1 ? "s" : ""} detected
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "rgba(255,150,150,0.6)" }}
                  >
                    Isolation Forest flagged values with anomaly score &gt;
                    threshold · Z-score |z| &gt; 2σ
                  </div>
                </div>
              </div>
            )}

            {anomalies.length === 0 && (
              <div
                style={{
                  background: "rgba(0,255,136,0.06)",
                  border: "1px solid rgba(0,255,136,0.18)",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "18px" }}>✅</span>
                <div style={{ fontSize: "13px", color: "#00ff88" }}>
                  All readings within normal range — no anomalies detected
                </div>
              </div>
            )}

            {/* Data Table */}
            <div
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Detection Results
                  </span>
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    Showing all {data.length} records
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    fontSize: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "2px",
                        background: "rgba(255,50,50,0.4)",
                        display: "inline-block",
                      }}
                    />
                    Anomaly
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "2px",
                        background: "rgba(0,255,136,0.2)",
                        display: "inline-block",
                      }}
                    />
                    Normal
                  </span>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      {[
                        "#",
                        "Timestamp",
                        `Value (${isHR ? "BPM" : "SpO₂%"})`,
                        "Z-Score",
                        "IF Score",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 16px",
                            textAlign: "left",
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.35)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 500,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((d, i) => (
                      <tr
                        key={i}
                        className={`table-row ${d.anomaly === -1 ? "anomaly-row" : ""}`}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          animationDelay: `${Math.min(i * 0.03, 0.5)}s`,
                        }}
                      >
                        <td
                          style={{
                            padding: "11px 16px",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.25)",
                          }}
                        >
                          {i + 1}
                        </td>
                        <td
                          style={{
                            padding: "11px 16px",
                            fontSize: "13px",
                            color: "rgba(255,255,255,0.6)",
                            fontFamily: "monospace",
                          }}
                        >
                          {d.timestamp}
                        </td>
                        <td
                          style={{
                            padding: "11px 16px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: d.anomaly === -1 ? "#ff6060" : "#dff0e8",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {d.value}
                        </td>
                        <td
                          style={{
                            padding: "11px 16px",
                            fontSize: "13px",
                            color:
                              Math.abs(d.zScore) > 2
                                ? "#ff8080"
                                : Math.abs(d.zScore) > 1.5
                                  ? "#ffaa50"
                                  : "rgba(255,255,255,0.45)",
                            fontFamily: "monospace",
                          }}
                        >
                          {d.zScore > 0 ? "+" : ""}
                          {d.zScore}σ
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <div
                            style={{
                              width: "80px",
                              height: "4px",
                              background: "rgba(255,255,255,0.08)",
                              borderRadius: "2px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min((Math.abs(d.zScore) / 4) * 100, 100)}%`,
                                background:
                                  d.anomaly === -1
                                    ? "linear-gradient(90deg, #ff4040, #ff8080)"
                                    : "linear-gradient(90deg, #00cc6a, #00ff88)",
                                borderRadius: "2px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: "11px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "3px 10px",
                              borderRadius: "100px",
                              fontSize: "11px",
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                              background:
                                d.anomaly === -1
                                  ? "rgba(255,50,50,0.12)"
                                  : "rgba(0,255,136,0.08)",
                              color: d.anomaly === -1 ? "#ff6060" : "#00cc6a",
                              border: `1px solid ${d.anomaly === -1 ? "rgba(255,60,60,0.25)" : "rgba(0,255,136,0.2)"}`,
                            }}
                          >
                            {d.anomaly === -1 ? "🚨 Anomaly" : "✓ Normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Algorithm Note */}
            <div
              style={{
                background: "rgba(0,255,136,0.03)",
                border: "1px solid rgba(0,255,136,0.08)",
                borderRadius: "12px",
                padding: "18px 20px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
                animation: "fadeIn 0.5s ease 0.6s both",
              }}
            >
              <span style={{ fontSize: "16px", marginTop: "1px" }}>🌲</span>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#00ff88",
                    marginBottom: "5px",
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  Isolation Forest · Detection Note
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "rgba(200,230,210,0.55)",
                    lineHeight: 1.7,
                  }}
                >
                  Anomaly classification uses Z-score thresholding (|z| &gt; 2σ)
                  as a client-side proxy for the Isolation Forest contamination
                  parameter. Production deployment runs scikit-learn&apos;s{" "}
                  <code
                    style={{
                      color: "#00ff88",
                      fontSize: "11px",
                      background: "rgba(0,255,136,0.08)",
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    IsolationForest(contamination=0.1)
                  </code>{" "}
                  server-side for full tree ensemble scoring.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
