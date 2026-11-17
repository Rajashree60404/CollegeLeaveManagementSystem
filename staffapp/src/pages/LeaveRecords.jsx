
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  FileText,
  Download,
  Eye,
  CalendarDays,
  UserRound,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Moon,
  Sun,
  Filter,
  GraduationCap,
  FileDown,
} from "lucide-react";

import api from "../api/axiosConfig";

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function getLeaveId(record) {
  return record?.id ?? record?.leaveId ?? record?.leaveRequestId;
}

function getStudentName(record) {
  return (
    record?.studentName ||
    record?.student?.name ||
    record?.name ||
    "Unknown Student"
  );
}

function getRegisterNo(record) {
  return (
    record?.registerNo ??
    record?.studentRegisterNo ??
    record?.student?.registerNo ??
    record?.studentId ??
    "-"
  );
}

function getStatus(record) {
  return String(record?.status || "PENDING").toUpperCase();
}

function getLeaveType(record) {
  return String(record?.leaveType || "NORMAL").toUpperCase();
}


function hasMedicalFile(record) {
  const file = record?.medicalFile;

  if (typeof file === "boolean") {
    return file;
  }

  if (typeof file === "string") {
    const value = file.trim();

    if (!value) return false;

    if (["APPROVED", "PENDING", "REJECTED", "NOT ATTACHED"].includes(value.toUpperCase())) {
      return false;
    }

    return true;
  }

  return Boolean(
    record?.hasMedicalFile ||
    record?.medicalFileName ||
    record?.medicalFileUrl
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}



function StatusBadge({ status }) {
  const value = String(status || "PENDING").toUpperCase();

  let styles =
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";

  if (value === "APPROVED") {
    styles =
      "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400";
  } else if (value === "REJECTED") {
    styles =
      "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {value}
    </span>
  );
}



function LeaveTypeBadge({ leaveType }) {
  const emergency = leaveType === "EMERGENCY";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        emergency
          ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
          : "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400"
      }`}
    >
      {emergency ? "Emergency" : "Normal"}
    </span>
  );
}



function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}


export default function LeaveRecords() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingMedicalId, setDownloadingMedicalId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("clms-theme") === "dark"
  );

  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("clms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

 
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [notice]);

  

  // TanStack Query: fetch and cache leave records
  const {
    data: records = [],
    isLoading: loading,
    isFetching,
    error: queryError,
    refetch: fetchRecords,
  } = useQuery({
    queryKey: ["leaveRecords"],
    queryFn: async () => {
      try {
        const response = await api.get("/leaves");

        console.log("Leave Records API Response:", response.data);

        const leaves = Array.isArray(response.data)
          ? response.data
          : response.data?.data;

        if (!Array.isArray(leaves)) {
          console.error("Unexpected leave records response:", response.data);
          throw new Error("Unexpected response received from the server.");
        }

        return leaves;
      } catch (err) {
        console.error("Error fetching leave records:", err);
        throw new Error(getErrorMessage(err));
      }
    },
  });

  //  Summary counts 

  const totalRecords = records.length;

  const pendingRecords = records.filter(
    (record) => getStatus(record) === "PENDING"
  ).length;

  const approvedRecords = records.filter(
    (record) => getStatus(record) === "APPROVED"
  ).length;

  const rejectedRecords = records.filter(
    (record) => getStatus(record) === "REJECTED"
  ).length;

  //  Search and filtering 

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const studentName = getStudentName(record).toLowerCase();
      const registerNo = String(getRegisterNo(record)).toLowerCase();
      const reason = String(record?.reason || "").toLowerCase();
      const status = getStatus(record);
      const leaveType = getLeaveType(record).toLowerCase();

      const searchValue = search.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        studentName.includes(searchValue) ||
        registerNo.includes(searchValue) ||
        reason.includes(searchValue) ||
        status.toLowerCase().includes(searchValue) ||
        leaveType.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  //  Download medical file 

  const downloadMedicalFile = async (record) => {
    const id = getLeaveId(record);

    if (!id) {
      setError("Leave request ID is missing.");
      return;
    }

    if (!hasMedicalFile(record)) {
      setError("No medical document is attached to this leave request.");
      return;
    }

    try {
      setError("");
      setDownloadingMedicalId(id);

      const response = await api.get(
        `/leaves/${encodeURIComponent(id)}/medical-file`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type:
          response.headers?.["content-type"] ||
          "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download =
        record?.medicalFileName || `medical-document-${id}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setNotice("Medical document downloaded successfully.");
    } catch (err) {
      console.error("Medical file download error:", err);
      setError(getErrorMessage(err));
    } finally {
      setDownloadingMedicalId(null);
    }
  };

  //  PDF 

  const downloadPdf = async () => {
    try {
      setError("");
      setDownloadingPdf(true);

      const response = await api.get("/leaves/records/pdf", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "CLMS_Leave_Records.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setNotice("Leave records PDF downloaded successfully.");
    } catch (err) {
      console.error("PDF download error:", err);
      setError(getErrorMessage(err));
    } finally {
      setDownloadingPdf(false);
    }
  };

  

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

 

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <GraduationCap size={25} />

            <span className="text-sm font-semibold tracking-wide">
              COLLEGE LEAVE MANAGEMENT SYSTEM
            </span>
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Leave Records
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View all student leave application records and medical documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
         
          <button
            type="button"
            onClick={() => fetchRecords()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloadingPdf || records.length === 0}
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown size={18} />
            {downloadingPdf ? "Downloading..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {(error || queryError) && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div className="flex-1">{error || queryError?.message}</div>

          <button
            type="button"
            onClick={() => setError("")}
            className="font-semibold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success message */}
      {notice && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={18} />
            {notice}
          </span>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="font-semibold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Records"
          value={totalRecords}
          icon={FileText}
          color="bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
        />

        <SummaryCard
          title="Pending"
          value={pendingRecords}
          icon={Clock}
          color="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
        />

        <SummaryCard
          title="Approved"
          value={approvedRecords}
          icon={CheckCircle2}
          color="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
        />

        <SummaryCard
          title="Rejected"
          value={rejectedRecords}
          icon={XCircle}
          color="bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
        />
      </div>

      {/* Records section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

        {/* Search and filters */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 dark:border-gray-700 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold">
              All Leave Applications
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filteredRecords.length} record(s) displayed
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student, register no, leave type..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-orange-900 sm:w-80"
              />
            </div>

            <div className="relative">
              <Filter
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-9 text-sm outline-none transition focus:border-orange-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white sm:w-44"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Leave records table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1350px] text-left text-sm">
            <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600 dark:bg-gray-900 dark:text-gray-400">
              <tr>
                <th className="px-5 py-4">Student Name</th>
                <th className="px-5 py-4">Register No.</th>
                <th className="px-5 py-4">Leave Period</th>
                <th className="px-5 py-4">Leave Type</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Medical File</th>
                <th className="px-5 py-4">Parent Status</th>
                <th className="px-5 py-4">Staff Status</th>
                <th className="px-5 py-4">Overall Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                      <RefreshCw
                        size={28}
                        className="animate-spin text-orange-500"
                      />

                      <span>Loading leave records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                      <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                        <FileText size={30} />
                      </div>

                      <p className="font-semibold text-gray-700 dark:text-gray-200">
                        No leave records found
                      </p>

                      <p className="text-sm">
                        {records.length === 0
                          ? "There are no leave applications available."
                          : "Try changing your search or status filter."}
                      </p>

                      {(search || statusFilter !== "ALL") && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-1 font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => {
                  const id = getLeaveId(record);
                  const medicalAvailable = hasMedicalFile(record);

                  return (
                    <tr
                      key={id ?? index}
                      className="transition hover:bg-orange-50/50 dark:hover:bg-gray-700/40"
                    >
                      {/* Student */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                            <UserRound size={19} />
                          </div> */}

                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {getStudentName(record)}
                            </p>

                            {/* <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Leave ID: {id ?? "-"}
                            </p> */}
                          </div>
                        </div>
                      </td>

                      {/* Register number */}
                      <td className="px-5 py-4 font-medium text-gray-700 dark:text-gray-300">
                        {getRegisterNo(record)}
                      </td>

                      {/* Leave period */}
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          <CalendarDays
                            size={17}
                            className="mt-0.5 text-orange-500"
                          />

                          <div className="space-y-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200">
                              {formatDate(record?.fromDate)}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              to {formatDate(record?.toDate)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Leave type */}
                      <td className="px-5 py-4">
                        <LeaveTypeBadge
                          leaveType={getLeaveType(record)}
                        />
                      </td>

                      {/* Reason */}
                      <td className="max-w-[220px] px-5 py-4">
                        <p
                          className="line-clamp-2 text-gray-700 dark:text-gray-300"
                          title={record?.reason || ""}
                        >
                          {record?.reason || "-"}
                        </p>
                      </td>

                      {/* Medical file */}
                      <td className="px-5 py-4">
                        {medicalAvailable ? (
                          <button
                            type="button"
                            onClick={() => downloadMedicalFile(record)}
                            disabled={downloadingMedicalId === id}
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
                          >
                            <Download size={15} />

                            {downloadingMedicalId === id
                              ? "Downloading..."
                              : "Download"}
                          </button>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            Not attached
                          </span>
                        )}
                      </td>

                      {/* Parent status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={record?.parentStatus} />
                      </td>

                      {/* Staff status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={record?.staffStatus} />
                      </td>

                      {/* Overall status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={record?.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && records.length > 0 && (
          <div className="flex flex-col justify-between gap-2 border-t border-gray-200 px-5 py-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400 sm:flex-row sm:items-center">
            <p>
              Showing {filteredRecords.length} of {records.length} records
            </p>

            <p className="flex items-center gap-2">
              <Eye size={16} />
              Leave records overview
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
