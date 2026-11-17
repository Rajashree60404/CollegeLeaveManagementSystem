
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

import {
  ArrowLeft,
  ClipboardList,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Upload,
  Send,
  FileText,
  Clock,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";

export default function ApplyLeave() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    leaveType: "NORMAL",
  });

  const [medicalFile, setMedicalFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const student = JSON.parse(
    sessionStorage.getItem("student") ||
      localStorage.getItem("student") ||
      "null"
  );

  // Local date in YYYY-MM-DD format
  const today = (() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  // Calculate inclusive leave duration
  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) return 0;

    const start = new Date(`${formData.fromDate}T00:00:00`);
    const end = new Date(`${formData.toDate}T00:00:00`);

    if (end < start) return 0;

    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  // Handle medical document upload
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setMedicalFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please upload a PDF, JPG, or PNG file.");
      setMessageType("error");
      event.target.value = "";
      setMedicalFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must not exceed 5 MB.");
      setMessageType("error");
      event.target.value = "";
      setMedicalFile(null);
      return;
    }

    setMedicalFile(file);
    setMessage("");
  };

  // TanStack Query mutation for leave application
  const applyLeaveMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/leaves/apply", data);
      return response.data;
    },

    onSuccess: () => {
      setMessage("Leave application submitted successfully!");
      setMessageType("success");

      // Reset form after successful submission
      setFormData({
        fromDate: "",
        toDate: "",
        reason: "",
        leaveType: "NORMAL",
      });

      setMedicalFile(null);

      const fileInput = document.getElementById("medicalFile");

      if (fileInput) {
        fileInput.value = "";
      }

      // Refresh student dashboard data
      queryClient.invalidateQueries({
        queryKey: ["studentDashboard", student?.id],
      });
    },

    onError: (error) => {
      console.error("Leave application error:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to submit your leave application. Please try again."
      );

      setMessageType("error");
    },
  });

  const loading = applyLeaveMutation.isPending;

  // Submit leave application
  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (!student?.id) {
      setMessage("Please log in again to apply for leave.");
      setMessageType("error");
      return;
    }

    if (!formData.fromDate || !formData.toDate) {
      setMessage("Please select both leave dates.");
      setMessageType("error");
      return;
    }

    if (formData.fromDate < today) {
      setMessage("The starting date cannot be in the past.");
      setMessageType("error");
      return;
    }

    if (formData.toDate < formData.fromDate) {
      setMessage("The ending date cannot be before the starting date.");
      setMessageType("error");
      return;
    }

    if (!formData.reason.trim()) {
      setMessage("Please enter the reason for your leave.");
      setMessageType("error");
      return;
    }

    if (!["NORMAL", "EMERGENCY"].includes(formData.leaveType)) {
      setMessage("Please select a valid leave type.");
      setMessageType("error");
      return;
    }

    // Medical certificate is mandatory for all leave types over 7 days
    if (totalDays > 7 && !medicalFile) {
      setMessage(
        "A medical document is required for leave exceeding 7 days."
      );
      setMessageType("error");
      return;
    }

    const data = new FormData();

    data.append("studentId", student.id);
    data.append("fromDate", formData.fromDate);
    data.append("toDate", formData.toDate);
    data.append("reason", formData.reason.trim());
    data.append("leaveType", formData.leaveType);

    if (medicalFile) {
      data.append("medicalFile", medicalFile);
    }

    applyLeaveMutation.mutate(data);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-orange-900";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                <ClipboardList size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Apply for Leave
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Submit your leave request for parent and staff approval.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-orange-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-orange-300 sm:flex">
            <CalendarDays size={19} />
            CLMS Leave Application
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_310px]">

          {/* Main Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

            <div className="mb-7">
              <h2 className="text-lg font-bold">
                Leave Details
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Complete the information below to submit your application.
              </p>
            </div>

            {/* Success / Error Message */}
            {message && (
              <div
                role="alert"
                className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
                  messageType === "success"
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                }`}
              >
                {messageType === "success" ? (
                  <CheckCircle size={19} className="mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                )}

                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Leave Type */}
              <div>
                <label className="mb-3 block text-sm font-semibold">
                  Select Leave Type
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Normal Leave */}
                  <label
                    className={`relative flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      formData.leaveType === "NORMAL"
                        ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100 dark:border-orange-500 dark:bg-orange-500/10 dark:ring-orange-900"
                        : "border-slate-200 hover:border-orange-300 dark:border-slate-700 dark:hover:border-orange-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="leaveType"
                      value="NORMAL"
                      checked={formData.leaveType === "NORMAL"}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <Clock size={19} className="text-orange-500" />

                        <span className="font-bold">
                          Normal Leave
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Subject to your available 7-day leave balance.
                      </p>
                    </div>
                  </label>

                  {/* Emergency Leave */}
                  <label
                    className={`relative flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                      formData.leaveType === "EMERGENCY"
                        ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100 dark:border-orange-500 dark:bg-orange-500/10 dark:ring-orange-900"
                        : "border-slate-200 hover:border-orange-300 dark:border-slate-700 dark:hover:border-orange-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="leaveType"
                      value="EMERGENCY"
                      checked={formData.leaveType === "EMERGENCY"}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-orange-500"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <HeartPulse size={19} className="text-red-500" />

                        <span className="font-bold">
                          Emergency Leave
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Can exceed the normal 7-day leave limit.
                      </p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Date Fields */}
              <div>
                <label className="mb-3 block text-sm font-semibold">
                  Leave Period
                </label>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="fromDate"
                      className="mb-2 block text-sm font-medium"
                    >
                      From Date
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="fromDate"
                      type="date"
                      name="fromDate"
                      min={today}
                      value={formData.fromDate}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="toDate"
                      className="mb-2 block text-sm font-medium"
                    >
                      To Date
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="toDate"
                      type="date"
                      name="toDate"
                      min={formData.fromDate || today}
                      value={formData.toDate}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>

                </div>
              </div>

              {/* Duration Summary */}
              {totalDays > 0 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/60 dark:bg-orange-950/30">

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                        <CalendarDays size={22} />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          Total Leave Duration
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Start and end dates included
                        </p>
                      </div>
                    </div>

                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {totalDays} {totalDays === 1 ? "day" : "days"}
                    </span>

                  </div>

                  {totalDays > 7 && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/80 p-3 text-xs text-red-600 dark:bg-slate-900/70 dark:text-red-300">
                      <AlertCircle size={17} className="shrink-0" />

                      <span>
                        Medical certificate is mandatory for leave exceeding 7 days.
                      </span>
                    </div>
                  )}

                  {totalDays > 7 &&
                    formData.leaveType === "NORMAL" && (
                      <p className="mt-3 text-xs font-medium text-orange-700 dark:text-orange-300">
                        Normal leave is subject to your remaining leave balance. Select Emergency Leave if applicable.
                      </p>
                    )}

                </div>
              )}

              {/* Reason */}
              <div>
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-semibold"
                >
                  Reason for Leave
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Explain why you need leave..."
                  maxLength={500}
                  required
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-orange-900"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {formData.reason.length}/500 characters
                </p>
              </div>

              {/* Medical Document */}
              <div>
                <label
                  htmlFor="medicalFile"
                  className="mb-2 block text-sm font-semibold"
                >
                  Medical Certificate

                  {totalDays > 7 ? (
                    <span className="ml-2 text-red-500">
                      * Required
                    </span>
                  ) : (
                    <span className="ml-2 font-normal text-slate-400">
                      (Optional)
                    </span>
                  )}
                </label>

                <label
                  htmlFor="medicalFile"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-7 text-center transition hover:border-orange-400 hover:bg-orange-50/50 dark:border-slate-700 dark:hover:border-orange-500 dark:hover:bg-slate-800"
                >
                  <div className="mb-3 rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                    <Upload size={23} />
                  </div>

                  <span className="break-all text-sm font-semibold">
                    {medicalFile
                      ? medicalFile.name
                      : "Click to upload medical certificate"}
                  </span>

                  <span className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    PDF, JPG or PNG · Maximum 5 MB
                  </span>

                  <input
                    id="medicalFile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Approval Information */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    Approval Process
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400">
                    Your leave request will first be sent to your parent for approval. After parent approval, your assigned staff member can approve or reject the request.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Submit Application
                    </>
                  )}
                </button>

              </div>

            </form>
          </div>

          {/* Right Guidance Panel */}
          <div className="space-y-5">

            {/* Guidance Card */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-md">

              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-4">
                <FileText size={27} />
              </div>

              <h3 className="text-lg font-bold">
                Before You Apply
              </h3>

              <p className="mt-2 text-sm leading-6 text-orange-50">
                Make sure your dates and leave details are correct before submitting your application.
              </p>

              <div className="mt-5 rounded-xl bg-white/15 p-4">
                <p className="text-xs text-orange-100">
                  Selected Leave Type
                </p>

                {/* <p className="mt-1 text-lg font-bold">
                  {formData.leaveType === "NORMAL"
                    ? "Normal Leave"
                    : "Emergency Leave"}
                </p> */}
              </div>

            </div>

            {/* Guidelines */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

              <h3 className="font-bold">
                Application Guidelines
              </h3>

              <ul className="mt-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">

                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />
                  Select the correct leave type and dates.
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />
                  Normal leave is subject to the available 7-day balance.
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />
                  Emergency leave can exceed the normal leave limit.
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />
                  Attach a medical certificate for leave exceeding 7 days.
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />
                  Track your application in the Leave Status page.
                </li>

              </ul>
            </div>

            {/* Approval Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

              <h3 className="font-bold">
                Approval Steps
              </h3>

              <div className="mt-5 space-y-4">

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                    1
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Parent Approval
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      First level verification
                    </p>
                  </div>
                </div>

                <div className="ml-4 h-4 border-l-2 border-dashed border-slate-300 dark:border-slate-700" />

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                    2
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Staff Approval
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Final leave decision
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
