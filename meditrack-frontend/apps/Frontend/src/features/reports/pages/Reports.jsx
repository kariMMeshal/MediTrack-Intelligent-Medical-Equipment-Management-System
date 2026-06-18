import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import searchIcon from "../../../assets/Gray-Search.svg";

/* ─── helpers ─────────────────────────────────────────────────────────── */

function getStatusColor(status) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return {
        dot: "bg-color-green",
        badge: "bg-color-green/10 border border-color-green text-color-green",
      };
    case "MAINTENANCE":
      return {
        dot: "bg-color-warning",
        badge:
          "bg-color-warning/10 border border-color-warning text-color-warning",
      };
    case "PASSIVE":
    case "OUT_OF_SERVICE":
      return {
        dot: "bg-color-red",
        badge: "bg-color-red/10 border border-color-red text-color-red",
      };
    case "SEMI_ACTIVE":
      return {
        dot: "bg-sky-500",
        badge: "bg-sky-500/10 border border-sky-500 text-sky-500",
      };
    default:
      return {
        dot: "bg-color-white/40",
        badge:
          "bg-color-white/10 border border-color-white/20 text-color-white/60",
      };
  }
}

/** Lightweight markdown → JSX renderer (headers, bold, bullets, paragraphs) */
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^### /.test(line)) {
      elements.push(
        <h3
          key={i}
          className="text-[15px] font-semibold text-color-purple mt-4 mb-1"
        >
          {line.replace(/^### /, "")}
        </h3>,
      );
    } else if (/^## /.test(line)) {
      elements.push(
        <h2
          key={i}
          className="text-[17px] font-bold text-white mt-5 mb-1 border-b border-color-white/10 pb-1"
        >
          {line.replace(/^## /, "")}
        </h2>,
      );
    } else if (/^# /.test(line)) {
      elements.push(
        <h1 key={i} className="text-[20px] font-extrabold text-white mt-4 mb-2">
          {line.replace(/^# /, "")}
        </h1>,
      );
    } else if (/^[-*] /.test(line)) {
      elements.push(
        <li
          key={i}
          className="text-[13px] text-color-white/80 leading-relaxed ml-3 list-disc"
        >
          {line.replace(/^[-*] /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>,
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1" />);
    } else {
      // inline bold
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
        /^\*\*.*\*\*$/.test(part) ? (
          <strong key={j} className="text-white font-semibold">
            {part.replace(/\*\*/g, "")}
          </strong>
        ) : (
          part
        ),
      );
      elements.push(
        <p key={i} className="text-[13px] text-color-white/75 leading-relaxed">
          {parts}
        </p>,
      );
    }
    i++;
  }
  return <div className="flex flex-col gap-0.5">{elements}</div>;
}

/* ─── Report Modal ─────────────────────────────────────────────────────── */

function ReportModal({ device, token, onClose }) {
  const [reportLoading, setReportLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const generateReport = useCallback(async () => {
    setReportLoading(true);
    setError(null);
    try {
      const sessionId = crypto.randomUUID();
      const additionalContext = [
        device.name && `Device name: ${device.name}`,
        device.model && `Model: ${device.model}`,
        device.location && `Location: ${device.location}`,
        device.status && `Current status: ${device.status}`,
        device.purchaseDate && `Purchase date: ${device.purchaseDate}`,
        device.lastMaintenanceDate &&
          `Last maintenance: ${device.lastMaintenanceDate}`,
        device.nextMaintenanceDate &&
          `Next maintenance: ${device.nextMaintenanceDate}`,
        device.purchasePrice &&
          `Purchase price: $${device.purchasePrice.toLocaleString()}`,
      ]
        .filter(Boolean)
        .join(". ");

      const res = await axios.post(
        "/api/ai/report/generate",
        {
          sessionId,
          reportType: "DEVICE_REVIEW",
          additionalContext,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setReport(res.data);
    } catch (e) {
      setError("Failed to generate report. Please try again.");
      console.error("Report generation error:", e);
    } finally {
      setReportLoading(false);
    }
  }, [device, token]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Modal */}
      <div
        className="relative bg-color-gray1 border border-color-white/10 rounded-[8px] w-full max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-color-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-color-purple/10 flex items-center justify-center text-color-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div className="flex flex-col">
              <h2 className="text-[18px] font-bold text-white leading-tight">AI Device Report</h2>
              <p className="text-color-white/40 text-[12px] font-semibold uppercase tracking-wider">
                {device.name} · {device.model || "—"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-color-white/5 transition-all text-color-white/40 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 user-card">
          {/* ── State 1: Loading ── */}
          {reportLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-color-purple/20" />
                <div className="absolute inset-0 rounded-full border-2 border-color-purple border-t-transparent animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[15px] font-medium">Generating AI Report…</p>
                <p className="text-color-white/40 text-[13px]">
                  This may take a few seconds
                </p>
              </div>
            </div>
          )}

          {/* ── State 2: Error ── */}
          {!reportLoading && error && (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-color-red/10 border border-color-red flex items-center justify-center text-color-red text-[20px]">
                !
              </div>
              <p className="text-color-red font-medium">{error}</p>
              <button
                onClick={generateReport}
                className="px-5 py-2 bg-color-purple rounded-full text-[14px] font-medium hover:opacity-90 duration-150"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── State 3: Report ── */}
          {!reportLoading && report && (
            <div className="flex flex-col gap-4">
              {/* Meta badges */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] px-3 py-1 rounded-full bg-color-purple/15 border border-color-purple/30 text-color-purple">
                  {report.reportType}
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full bg-color-white/5 border border-color-white/10 text-color-white/50">
                  Provider: {report.provider}
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full bg-color-white/5 border border-color-white/10 text-color-white/50">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Report content */}
              <div className="bg-color-gray3 rounded-[12px] p-5">
                {renderMarkdown(report.reportContent)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Device Card ──────────────────────────────────────────────────────── */

function DeviceCard({ device, onGenerateReport }) {
  const [hovered, setHovered] = useState(false);
  const colors = getStatusColor(device.status);

  return (
    <div
      className="relative bg-color-gray2 rounded-[12px] p-6 flex flex-col gap-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Hover Overlay ── */}
      {hovered && (
        <div
          className="absolute inset-0 rounded-[12px] flex items-center justify-center z-10"
          style={{
            backgroundColor: "rgba(10,10,20,0.65)",
            backdropFilter: "blur(2px)",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onGenerateReport(device);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-color-purple rounded-full text-[14px] font-semibold shadow-lg hover:opacity-90 transition-opacity duration-150"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
            Generate Report
          </button>
        </div>
      )}

      {/* Card Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[16px] font-semibold leading-snug">
            {device.name}
          </h2>
          <p className="text-color-white/40 text-[13px]">
            {device.model || "—"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <span
            className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap ${colors.badge}`}
          >
            {device.status}
          </span>
        </div>
      </div>

      {/* Info Rows */}
      <div className="flex flex-col gap-2 bg-color-gray3 rounded-[10px] p-4">
        {[
          { label: "Location", value: device.location },
          { label: "Purchase Date", value: device.purchaseDate },
          { label: "Last Maintenance", value: device.lastMaintenanceDate },
          {
            label: "Next Maintenance",
            value: device.nextMaintenanceDate,
            highlight: true,
          },
        ].map(({ label, value, highlight }, idx, arr) => (
          <div key={label}>
            <div className="flex justify-between text-[13px]">
              <span className="text-color-white/40">{label}</span>
              <span
                className={`font-medium ${highlight && value ? "text-color-warning" : "text-color-white/80"}`}
              >
                {value || "—"}
              </span>
            </div>
            {idx < arr.length - 1 && (
              <div className="w-full h-[1px] bg-color-white/5 mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="text-color-white/40 text-[13px]">Purchase Price</span>
        <span className="text-[15px] font-semibold text-color-purple">
          ${device.purchasePrice?.toLocaleString() ?? "—"}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */

export default function Reports() {
  const token = localStorage.getItem("token");

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "/api/medical-devices?size=1000",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setDevices(res.data.content || res.data);
      } catch (e) {
        console.error("Error fetching devices:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, [token]);

  const validDevices = Array.isArray(devices) ? devices : [];
  const filtered = validDevices.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 pt-1 pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-bold text-white tracking-tight">
          Equipment Reports & Analytics
        </h1>
        <p className="text-[14px] text-color-white/50">
          Generate detailed status reports and monitor equipment performance history
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-[400px]">
        <img
          src={searchIcon}
          alt="Search"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4"
        />
        <input
          type="text"
          placeholder="Search By Device Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-color-gray1 border border-color-white/10 rounded-[8px] py-3 pl-11 pr-4 text-[14px] text-white placeholder-color-white/50 focus:border-color-purple outline-none"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-color-purple border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onGenerateReport={setSelectedDevice}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-color-white/40 col-span-3 text-center py-10">
              No devices found.
            </p>
          )}
        </div>
      )}

      {/* Report Modal */}
      {selectedDevice && (
        <ReportModal
          device={selectedDevice}
          token={token}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}
