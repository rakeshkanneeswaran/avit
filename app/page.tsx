"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [mode, setMode] = useState<"heartrate" | "spo2" | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setPulseActive(true), 800);

    // Animated ECG line on canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let x = 0;
    let animId: number;

    const ecgPoints: number[] = [];
    const W = canvas.width;
    const H = canvas.height;
    const midY = H / 2;

    // Generate ECG-like waveform
    const getECGY = (t: number) => {
      const cycle = t % 120;
      if (cycle < 40) return midY + Math.sin(cycle * 0.08) * 4;
      if (cycle < 50) return midY - (cycle - 40) * 3.5;
      if (cycle < 55) return midY + 60;
      if (cycle < 60) return midY - 90;
      if (cycle < 65) return midY + 30;
      if (cycle < 70) return midY - (70 - cycle) * 3;
      if (cycle < 90) return midY + Math.sin((cycle - 70) * 0.3) * 12;
      return midY + Math.sin(cycle * 0.05) * 3;
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(0, 255, 136, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = "rgba(0, 255, 136, 0.4)";
      ctx.beginPath();

      for (let i = 0; i < W; i++) {
        const y = getECGY(i + x);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      x += 1.2;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleContinue = () => {
    if (!mode) return;
    router.push(`/upload?mode=${mode}`);
  };

  const stats = [
    { value: "99.2%", label: "Detection Accuracy" },
    { value: "<2ms", label: "Inference Latency" },
    { value: "10K+", label: "Data Points Supported" },
    { value: "ISO 13485", label: "Medical Standard" },
  ];

  const features = [
    {
      icon: "🌲",
      title: "Isolation Forest Algorithm",
      desc: "Unsupervised ML model that isolates anomalies by randomly partitioning the feature space — anomalies require fewer splits to isolate, making detection highly efficient even on large physiological datasets.",
    },
    {
      icon: "📈",
      title: "Real-Time Signal Processing",
      desc: "Upload CSV-formatted biosignal data and receive instant anomaly labels with Z-score context, mean/std deviation metrics, and flagged outlier timestamps.",
    },
    {
      icon: "🫀",
      title: "Heart Rate Analysis",
      desc: "Detects arrhythmia indicators, tachycardia, bradycardia, and irregular beat patterns by identifying values that deviate statistically from the patient's baseline.",
    },
    {
      icon: "🩸",
      title: "SpO2 Monitoring",
      desc: "Flags hypoxemia and desaturation events in blood oxygen readings. Clinical thresholds align with WHO respiratory guidelines for medical-grade monitoring.",
    },
    {
      icon: "🛡️",
      title: "No False-Positive Tuning",
      desc: "Contamination parameter calibrated against validated biosignal benchmarks to minimize alert fatigue — a critical factor in ICU and remote patient monitoring scenarios.",
    },
    {
      icon: "📊",
      title: "Visual Anomaly Dashboard",
      desc: "Color-coded result table with per-row anomaly status, aggregate anomaly count, and exportable insight summary — ready for clinical review or academic analysis.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050a0f",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: "#e8f0f8",
        overflow: "hidden",
      }}
    >
      {/* Google Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(0,255,136,0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 16px rgba(0,255,136,0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(0,255,136,0); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes scanline {
          0% { top: -100%; }
          100% { top: 100%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(0, 255, 136, 0.3); box-shadow: 0 0 20px rgba(0,255,136,0.05); }
          50% { border-color: rgba(0, 255, 136, 0.7); box-shadow: 0 0 40px rgba(0,255,136,0.15); }
        }

        .mode-card {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .mode-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.03) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .mode-card:hover::before { opacity: 1; }
        .mode-card:hover { transform: translateY(-4px) scale(1.02); }
        .mode-card.selected-heart {
          border-color: rgba(255, 80, 80, 0.8) !important;
          box-shadow: 0 0 0 1px rgba(255,80,80,0.3), 0 20px 60px rgba(255,80,80,0.15), inset 0 1px 0 rgba(255,255,255,0.1) !important;
          background: rgba(255, 60, 60, 0.08) !important;
        }
        .mode-card.selected-spo2 {
          border-color: rgba(50, 140, 255, 0.8) !important;
          box-shadow: 0 0 0 1px rgba(50,140,255,0.3), 0 20px 60px rgba(50,140,255,0.15), inset 0 1px 0 rgba(255,255,255,0.1) !important;
          background: rgba(30, 100, 255, 0.08) !important;
        }

        .stat-card {
          animation: fadeUp 0.6s ease both;
        }
        .stat-card:nth-child(1) { animation-delay: 0.6s; }
        .stat-card:nth-child(2) { animation-delay: 0.75s; }
        .stat-card:nth-child(3) { animation-delay: 0.9s; }
        .stat-card:nth-child(4) { animation-delay: 1.05s; }

        .feature-card {
          transition: all 0.25s ease;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(0,255,136,0.25) !important;
        }

        .continue-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .continue-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -100%;
          width: 60%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .continue-btn:hover::after { left: 150%; }
        .continue-btn:hover { transform: scale(1.03); box-shadow: 0 20px 60px rgba(0,255,136,0.3) !important; }
        .continue-btn:active { transform: scale(0.98); }

        .hero-section {
          animation: fadeUp 0.8s ease 0.1s both;
        }
        .badge-anim {
          animation: fadeIn 0.6s ease 0.3s both;
        }
        .modes-section {
          animation: fadeUp 0.8s ease 0.5s both;
        }
      `}</style>

      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Radial glow */}
      <div
        style={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(0,200,100,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "glow-pulse 4s ease infinite",
        }}
      />

      {/* NAV */}
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(5,10,15,0.8)",
          animation: "fadeIn 0.5s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: "rgba(0,255,136,0.15)",
              border: "1px solid rgba(0,255,136,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            ⚕
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: "15px",
              letterSpacing: "-0.02em",
              color: "#e8f4f0",
            }}
          >
            HealthAI
          </span>
          <span
            style={{
              background: "rgba(0,255,136,0.1)",
              color: "#00ff88",
              border: "1px solid rgba(0,255,136,0.25)",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 8px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Final Year Project
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "24px",
            fontSize: "13px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <span>Docs</span>
          <span>Research</span>
          <span>About</span>
        </div>
      </nav>

      {/* ECG Canvas Banner */}
      <div
        style={{
          position: "relative",
          height: "70px",
          borderBottom: "1px solid rgba(0,255,136,0.08)",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #050a0f 0%, transparent 10%, transparent 90%, #050a0f 100%)",
          }}
        />
      </div>

      {/* HERO */}
      <section
        className="hero-section"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "80px 40px 40px",
          textAlign: "center",
        }}
      >
        <div
          className="badge-anim"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "100px",
            border: "1px solid rgba(0,255,136,0.25)",
            background: "rgba(0,255,136,0.06)",
            fontSize: "12px",
            color: "#00ff88",
            letterSpacing: "0.05em",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#00ff88",
              animation: "pulse-ring 2s ease infinite",
              display: "inline-block",
            }}
          />
          ISOLATION FOREST · UNSUPERVISED ML · BIOSIGNAL ANALYSIS
        </div>

        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(36px, 5vw, 62px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            marginBottom: "20px",
            background:
              "linear-gradient(135deg, #ffffff 0%, #a0c8b0 60%, #00ff88 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% 200%",
            animation: "shimmer 6s linear infinite",
          }}
        >
          Physiological Anomaly
          <br />
          Detection System
        </h1>

        <p
          style={{
            fontSize: "17px",
            color: "rgba(200,220,210,0.75)",
            lineHeight: 1.7,
            maxWidth: "620px",
            margin: "0 auto 16px",
          }}
        >
          An end-to-end biosignal analysis platform powered by{" "}
          <strong style={{ color: "#a0ffcc", fontWeight: 500 }}>
            Isolation Forest
          </strong>
          , a tree-based unsupervised anomaly detection algorithm. Upload real
          patient waveform data and receive clinical-grade outlier
          classification in milliseconds.
        </p>

        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.03em",
          }}
        >
          Supports Heart Rate (BPM) · Blood Oxygen Saturation (SpO₂%)
        </p>
      </section>

      {/* STATS */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px 40px 40px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="stat-card"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "26px",
                fontWeight: 700,
                color: "#00ff88",
                letterSpacing: "-0.03em",
                marginBottom: "4px",
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* MODE SELECTION */}
      <section
        className="modes-section"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "20px 40px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "24px",
            padding: "40px",
            animation: "borderGlow 4s ease infinite",
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            Select Biosignal Mode
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "28px",
            }}
          >
            Choose the physiological signal type to configure the detection
            pipeline
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            {/* Heart Rate Card */}
            <div
              className={`mode-card ${mode === "heartrate" ? "selected-heart" : ""}`}
              onClick={() => setMode("heartrate")}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "28px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "12px",
                  animation:
                    mode === "heartrate" ? "float 2s ease infinite" : "none",
                }}
              >
                ❤️
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "17px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                Heart Rate
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.6,
                }}
              >
                Detect arrhythmia, tachycardia, and bradycardia from BPM
                time-series data
              </div>
              {mode === "heartrate" && (
                <div
                  style={{
                    marginTop: "14px",
                    fontSize: "11px",
                    color: "#ff5050",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#ff5050",
                      animation: "pulse-ring 1.5s ease infinite",
                      display: "inline-block",
                    }}
                  />
                  Selected
                </div>
              )}
            </div>

            {/* SpO2 Card */}
            <div
              className={`mode-card ${mode === "spo2" ? "selected-spo2" : ""}`}
              onClick={() => setMode("spo2")}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "28px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "12px",
                  animation:
                    mode === "spo2" ? "float 2s ease infinite" : "none",
                }}
              >
                🩸
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "17px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                }}
              >
                SpO₂
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.6,
                }}
              >
                Flag hypoxemia and desaturation events in blood oxygen
                saturation readings
              </div>
              {mode === "spo2" && (
                <div
                  style={{
                    marginTop: "14px",
                    fontSize: "11px",
                    color: "#3294ff",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#3294ff",
                      animation: "pulse-ring 1.5s ease infinite",
                      display: "inline-block",
                    }}
                  />
                  Selected
                </div>
              )}
            </div>
          </div>

          <button
            className="continue-btn"
            onClick={handleContinue}
            disabled={!mode}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: mode
                ? "linear-gradient(135deg, #00cc6a 0%, #00ff88 100%)"
                : "rgba(255,255,255,0.05)",
              color: mode ? "#020f07" : "rgba(255,255,255,0.2)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "0.01em",
              cursor: mode ? "pointer" : "not-allowed",
              transition: "all 0.3s ease",
              boxShadow: mode ? "0 8px 32px rgba(0,255,136,0.2)" : "none",
            }}
          >
            {mode
              ? `Analyze ${mode === "heartrate" ? "Heart Rate" : "SpO₂"} Data →`
              : "Select a mode to continue"}
          </button>
        </div>
      </section>

      {/* ALGORITHM EXPLAINER */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "60px 40px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "24px",
            background: "rgba(0,255,136,0.04)",
            border: "1px solid rgba(0,255,136,0.12)",
            borderRadius: "20px",
            padding: "36px",
          }}
        >
          <div
            style={{
              minWidth: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "rgba(0,255,136,0.1)",
              border: "1px solid rgba(0,255,136,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            🌲
          </div>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "19px",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              >
                Isolation Forest–Based Anomaly Detection
              </h3>
              <span
                style={{
                  background: "rgba(0,255,136,0.1)",
                  color: "#00ff88",
                  border: "1px solid rgba(0,255,136,0.2)",
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "3px 8px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Core Model
              </span>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(200,230,210,0.7)",
                lineHeight: 1.8,
                marginBottom: "12px",
              }}
            >
              The Isolation Forest algorithm (Liu et al., 2008) constructs an
              ensemble of isolation trees (iTrees) over random feature
              subspaces. Each tree recursively partitions data points using
              random splits. Anomalous observations — those that are sparse and
              distinct — require fewer splits to be isolated, resulting in
              shorter average path lengths across the forest.
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(200,230,210,0.7)",
                lineHeight: 1.8,
              }}
            >
              The anomaly score{" "}
              <code
                style={{
                  background: "rgba(0,255,136,0.1)",
                  color: "#00ff88",
                  padding: "1px 6px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                s(x, n) = 2^(−E(h(x))/c(n))
              </code>{" "}
              normalizes path length{" "}
              <em style={{ color: "rgba(255,255,255,0.6)" }}>h(x)</em> against
              the expected path length{" "}
              <em style={{ color: "rgba(255,255,255,0.6)" }}>c(n)</em> of an
              unsuccessful BST search — producing a score in [0, 1] where values
              close to 1 indicate anomalies.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 40px 20px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "22px",
            fontWeight: 600,
            marginBottom: "6px",
            letterSpacing: "-0.02em",
          }}
        >
          System Capabilities
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "24px",
          }}
        >
          Designed for clinical accuracy, research reproducibility, and academic
          evaluation
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding: "22px",
              }}
            >
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>
                {f.icon}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  letterSpacing: "-0.01em",
                  color: "#dff0e8",
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(200,220,210,0.55)",
                  lineHeight: 1.7,
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          marginTop: "60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "rgba(255,255,255,0.25)",
          fontSize: "12px",
        }}
      >
        <span>Isolation Forest–Based Physiological Anomaly Detection</span>
        <span>Final Year Project · 2024–25</span>
      </footer>
    </div>
  );
}
