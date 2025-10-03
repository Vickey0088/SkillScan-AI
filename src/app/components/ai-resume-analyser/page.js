// src/app/components/ai-resume-analyser/page.jsx
"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";

// --- Constants ---
const MAX_JD_CHARS = 8000;

// --- Helper Functions & Components ---
function Card({ title, children, right, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={clsx(
        "rounded-2xl border border-gray-700 bg-gray-800/60 backdrop-blur-md shadow-lg p-6 hover:shadow-2xl transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </motion.div>
  );
}

// --- Main Component ---
export default function AIResumeAnalyser() {
  const router = useRouter();
  const [jd, setJd] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError("File size must be less than 10MB");
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF, DOCX, or TXT file");
        return;
      }
      setError(null);
      setResumeFile(file);
    }
  }, []);

  const onAnalyze = async () => {
    if (!resumeFile) {
      setError("Please upload a resume file");
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      if (jd.trim()) {
        formData.append("jobDescription", jd.trim());
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`
        );
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }
      localStorage.setItem("resumeAnalysisResult", JSON.stringify(data));
      router.push("/components/ai-resume-analyser/ai-resume-analyzer-feedback");
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Something went wrong during analysis");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-gray-900/80 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl">
              ⚡
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                AI-Powered
              </p>
              <h1 className="font-bold tracking-tight text-xl text-white">
                Resume Analyzer
              </h1>
            </div>
          </div>
          <a
            className="text-sm rounded-xl border border-gray-600 px-4 py-2 hover:bg-gray-800 transition-colors"
            href="https://github.com/Vicke0088"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* File Upload */}
          <Card
            title="Upload Resume"
            right={
              <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                PDF • DOCX • TXT
              </span>
            }
          >
            <div className="flex items-center gap-4">
              <label className="shrink-0 inline-flex items-center gap-2 rounded-2xl border-2 border-dashed border-gray-600 bg-gray-900/50 px-6 py-3 text-sm font-medium hover:bg-gray-800 cursor-pointer transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                />
                📂 Choose Resume File
              </label>
              <div className="flex-1 text-sm">
                {resumeFile ? (
                  <div className="inline-flex items-center gap-3 bg-green-900/40 border border-green-700 rounded-xl px-3 py-2 text-green-400">
                    <span className="font-medium">{resumeFile.name}</span>
                    <span className="text-xs">
                      ({Math.round(resumeFile.size / 1024)} KB)
                    </span>
                    <button
                      className="text-red-400 hover:text-red-600 transition-colors"
                      onClick={() => setResumeFile(null)}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">No file selected</span>
                )}
              </div>
            </div>
          </Card>

          {/* Job Description */}
          <Card
            title="Job Description (Optional)"
            right={
              <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                Improves accuracy
              </span>
            }
          >
            <textarea
              className="w-full min-h-[200px] rounded-xl border border-gray-700 bg-gray-900/70 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-colors resize-none"
              placeholder="Paste the job description here for a more targeted analysis and keyword matching..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
            <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
              <span>
                A JD helps identify missing skills and improves keyword
                matching.
              </span>
              <span>
                {jd.length}/{MAX_JD_CHARS}
              </span>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Analyze Button */}
          <Card title="Run Analysis">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-400 bg-red-900/40 border border-red-700 rounded-lg">
                {error}
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAnalyze}
              disabled={busy || !resumeFile}
              className={clsx(
                "w-full rounded-xl px-6 py-4 font-semibold text-lg transition-all duration-200",
                busy || !resumeFile
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              )}
            >
              {busy ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </div>
              ) : (
                "Analyze Resume"
              )}
            </motion.button>
            {!resumeFile && (
              <p className="mt-2 text-xs text-gray-400 text-center">
                Please upload a resume to begin.
              </p>
            )}
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
        <p>⚡ Built with Next.js & Google Gemini AI. No data is stored.</p>
      </footer>
    </div>
  );
}
