import React, { useState, useRef } from "react";
import axios from "axios";
import Sidebar from "../component/Sidebar";

const UploadProjects = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }
  const fileInputRef = useRef(null);

  const handleFile = (selected) => {
    const allowed = ["xlsx", "xls", "csv"];
    const ext = selected?.name?.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setMessage({ type: "error", text: "Only .xlsx, .xls, or .csv files are allowed." });
      return;
    }
    setFile(selected);
    setMessage(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file first." });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setProgress(0);
    setMessage(null);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload-projects`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded * 100) / e.total);
            setProgress(pct);
          },
        }
      );
      setMessage({ type: "success", text: res.data.message || "Upload successful!" });
      setFile(null);
      setProgress(0);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || "Upload failed. Please try again.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setMessage(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div style={styles.layout}>
      <Sidebar />

      <main style={styles.main}>
        {/* Page Header */}
        <div style={styles.pageHeader}>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbItem}>Dashboard</span>
            <span style={styles.breadcrumbSep}>›</span>
            <span style={styles.breadcrumbActive}>Upload Projects</span>
          </div>
          <h1 style={styles.pageTitle}>Upload Projects</h1>
          <p style={styles.pageSubtitle}>
            Import project records via Excel or CSV. Each row will be stored as an
            individual project entry and a PDF report will be generated automatically.
          </p>
        </div>

        <div style={styles.grid}>
          {/* Upload Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIconWrap}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <h2 style={styles.cardTitle}>Import File</h2>
                <p style={styles.cardDesc}>Select or drag and drop your spreadsheet</p>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              style={{
                ...styles.dropZone,
                ...(dragging ? styles.dropZoneActive : {}),
                ...(file ? styles.dropZoneHasFile : {}),
              }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {!file ? (
                <div style={styles.dropInner}>
                  <div style={styles.dropIconCircle}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={dragging ? "#2563eb" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <p style={styles.dropText}>
                    {dragging ? "Drop your file here" : "Drag & drop your file here"}
                  </p>
                  <p style={styles.dropOr}>or</p>
                  <button style={styles.browseBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    Browse Files
                  </button>
                  <p style={styles.dropHint}>Supports .xlsx, .xls, .csv</p>
                </div>
              ) : (
                <div style={styles.filePreview}>
                  <div style={styles.fileIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                  </div>
                  <div style={styles.fileMeta}>
                    <span style={styles.fileName}>{file.name}</span>
                    <span style={styles.fileSize}>{formatSize(file.size)}</span>
                  </div>
                  <button style={styles.removeBtn} onClick={(e) => { e.stopPropagation(); handleRemove(); }} title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div style={styles.progressWrap}>
                <div style={styles.progressHeader}>
                  <span style={styles.progressLabel}>Uploading...</span>
                  <span style={styles.progressPct}>{progress}%</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Message */}
            {message && (
              <div style={message.type === "success" ? styles.alertSuccess : styles.alertError}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke={message.type === "success" ? "#16a34a" : "#dc2626"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {message.type === "success"
                    ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                    : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                  }
                </svg>
                <span>{message.text}</span>
              </div>
            )}

            {/* Upload Button */}
            <button
              style={{
                ...styles.uploadBtn,
                ...(uploading || !file ? styles.uploadBtnDisabled : {}),
              }}
              onClick={handleUpload}
              disabled={uploading || !file}
            >
              {uploading ? (
                <>
                  <span style={styles.spinner} />
                  Processing...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload & Generate PDF
                </>
              )}
            </button>
          </div>

          {/* Info Card */}
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              How it works
            </h3>
            <ol style={styles.infoList}>
              {[
                "Prepare your Excel file with project data in the correct column order.",
                "Upload the file using the form on the left.",
                "Each row is stored as a separate project record in the database.",
                "A multi-page PDF is auto-generated — one page per project row.",
                "The PDF is saved and accessible from the project records.",
              ].map((step, i) => (
                <li key={i} style={styles.infoListItem}>
                  <span style={styles.infoStep}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div style={styles.divider} />

            <h3 style={styles.infoTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              Expected Column Order
            </h3>
            <div style={styles.columnGrid}>
              {[
                ["A", "Company"],
                ["B", "Project"],
                ["C", "Project Type"],
                ["D", "Ownership"],
                ["E", "Industry"],
                ["F", "Project Cost"],
                ["G", "Products & Capacity"],
                ["H", "Completion Schedule"],
                ["I", "Project Stage"],
                ["J", "Location"],
                ["K", "District"],
                ["L", "State"],
                ["M", "Project History"],
                ["N", "Address"],
                ["O", "City"],
                ["P", "Pincode"],
                ["Q", "Addr State"],
                ["R", "Telephone"],
                ["S", "Email"],
                ["T", "Person Name 1"],
                ["U", "Person Name 2"],
                ["V", "Added Date"],
              ].map(([col, label]) => (
                <div key={col} style={styles.colRow}>
                  <span style={styles.colBadge}>{col}</span>
                  <span style={styles.colLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  main: {
    flex: 1,
    padding: "32px",
    overflowY: "auto",
  },

  // Page Header
  pageHeader: { marginBottom: "28px" },
  breadcrumb: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" },
  breadcrumbItem: { fontSize: "13px", color: "#64748b", cursor: "pointer" },
  breadcrumbSep: { fontSize: "13px", color: "#94a3b8" },
  breadcrumbActive: { fontSize: "13px", color: "#2563eb", fontWeight: 500 },
  pageTitle: { fontSize: "26px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  pageSubtitle: { fontSize: "14px", color: "#64748b", margin: 0, maxWidth: "600px", lineHeight: 1.6 },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "24px",
    alignItems: "start",
  },

  // Upload Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "24px",
  },
  cardIconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: { fontSize: "17px", fontWeight: 600, color: "#0f172a", margin: "0 0 2px" },
  cardDesc: { fontSize: "13px", color: "#94a3b8", margin: 0 },

  // Drop Zone
  dropZone: {
    border: "2px dashed #cbd5e1",
    borderRadius: "12px",
    padding: "40px 24px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#fafafa",
    marginBottom: "20px",
    textAlign: "center",
  },
  dropZoneActive: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  dropZoneHasFile: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
    cursor: "default",
  },
  dropInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  dropIconCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px",
  },
  dropText: { fontSize: "15px", fontWeight: 500, color: "#334155", margin: 0 },
  dropOr: { fontSize: "12px", color: "#94a3b8", margin: 0 },
  browseBtn: {
    padding: "8px 20px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  },
  dropHint: { fontSize: "12px", color: "#94a3b8", margin: 0 },

  // File Preview
  filePreview: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    justifyContent: "center",
  },
  fileIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "10px",
    backgroundColor: "#f0fdf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileMeta: { display: "flex", flexDirection: "column", gap: "3px", textAlign: "left" },
  fileName: { fontSize: "14px", fontWeight: 600, color: "#0f172a", wordBreak: "break-all" },
  fileSize: { fontSize: "12px", color: "#64748b" },
  removeBtn: {
    padding: "6px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: "auto",
  },

  // Progress
  progressWrap: { marginBottom: "16px" },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: "6px" },
  progressLabel: { fontSize: "13px", color: "#475569" },
  progressPct: { fontSize: "13px", fontWeight: 600, color: "#2563eb" },
  progressTrack: { height: "6px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },

  // Alerts
  alertSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#16a34a",
    marginBottom: "16px",
    fontWeight: 500,
  },
  alertError: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#dc2626",
    marginBottom: "16px",
    fontWeight: 500,
  },

  // Upload Button
  uploadBtn: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.2s",
  },
  uploadBtnDisabled: {
    backgroundColor: "#93c5fd",
    cursor: "not-allowed",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block",
  },

  // Info Card
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #e2e8f0",
  },
  infoTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#0f172a",
    margin: "0 0 14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  infoList: { paddingLeft: 0, listStyle: "none", margin: 0, display: "flex", flexDirection: "column", gap: "10px" },
  infoListItem: { display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "#475569", lineHeight: 1.5 },
  infoStep: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  divider: { height: "1px", backgroundColor: "#f1f5f9", margin: "20px 0" },

  // Column Grid
  columnGrid: { display: "flex", flexDirection: "column", gap: "6px" },
  colRow: { display: "flex", alignItems: "center", gap: "10px" },
  colBadge: {
    width: "26px",
    height: "22px",
    backgroundColor: "#f1f5f9",
    borderRadius: "5px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontFamily: "monospace",
  },
  colLabel: { fontSize: "12px", color: "#475569" },
};

// Add spinner keyframe via a style tag injection
if (typeof document !== "undefined" && !document.getElementById("upload-spinner-style")) {
  const style = document.createElement("style");
  style.id = "upload-spinner-style";
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export default UploadProjects;