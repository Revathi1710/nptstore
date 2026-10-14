import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../component/Sidebar";

const PdfList = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/pdf-files`);
      setPdfs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) => {
    // Opens PDF in new browser tab
    window.open(`${import.meta.env.VITE_API_URL}/pdf-files/${id}/download`, '_blank');
  };

  const handleDownload = async (id, filename) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/pdf-files/${id}/download`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Generated PDFs</h1>
            <p style={styles.subtitle}>View and download all project PDFs generated from Excel uploads.</p>
          </div>
          <button style={styles.refreshBtn} onClick={fetchPdfs}>
            ↻ Refresh
          </button>
        </div>

        {/* Table */}
        <div style={styles.card}>
          {loading ? (
            <div style={styles.center}>Loading...</div>
          ) : pdfs.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: 40 }}>📄</p>
              <p>No PDFs generated yet. Upload an Excel file first.</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Filename</th>
                  <th style={styles.th}>Generated On</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pdfs.map((pdf, index) => (
                  <tr key={pdf.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>
                      <div style={styles.fileRow}>
                        <span style={styles.pdfIcon}>📄</span>
                        <span style={styles.filename}>{pdf.filename}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{pdf.created_at}</td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          style={styles.viewBtn}
                          onClick={() => handleView(pdf.id)}
                        >
                          👁 View
                        </button>
                        <button
                          style={styles.downloadBtn}
                          onClick={() => handleDownload(pdf.id, pdf.filename)}
                        >
                          ⬇ Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  main: { flex: 1, padding: "32px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },
  title: { fontSize: "24px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px" },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  refreshBtn: {
    padding: "8px 18px",
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    color: "#475569",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { backgroundColor: "#f8fafc" },
  th: {
    padding: "14px 20px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid #e2e8f0",
  },
  td: {
    padding: "14px 20px",
    fontSize: "14px",
    color: "#334155",
    borderBottom: "1px solid #f1f5f9",
  },
  trEven: { backgroundColor: "#fff" },
  trOdd: { backgroundColor: "#fafafa" },
  fileRow: { display: "flex", alignItems: "center", gap: "8px" },
  pdfIcon: { fontSize: "20px" },
  filename: { fontWeight: 500, color: "#0f172a" },
  actions: { display: "flex", gap: "8px" },
  viewBtn: {
    padding: "6px 14px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  },
  downloadBtn: {
    padding: "6px 14px",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  },
  center: { padding: "40px", textAlign: "center", color: "#94a3b8" },
  empty: { padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "14px" },
};

export default PdfList;