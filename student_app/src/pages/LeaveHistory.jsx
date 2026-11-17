
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

import {
  ArrowLeft,
  History,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  FileText,
  ClipboardList,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";

function getRequests(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateDays(fromDate, toDate) {
  if (!fromDate || !toDate) return null;

  const start = new Date(`${String(fromDate).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(toDate).slice(0, 10)}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return null;
  }

  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getStatus(request) {
  const status = String(request.status || "").toUpperCase();

  if (status.includes("REJECT")) {
    return {
      label: "Rejected",
      icon: XCircle,
      style:
        "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    };
  }

  if (status.includes("APPROVE")) {
    return {
      label: "Approved",
      icon: CheckCircle2,
      style:
        "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
    };
  }

  // Fall back to individual approval fields if final status is absent.
  const parentStatus = String(request.parentStatus || "").toUpperCase();
  const staffStatus = String(request.staffStatus || "").toUpperCase();

  if (
    parentStatus.includes("REJECT") ||
    staffStatus.includes("REJECT")
  ) {
    return {
      label: "Rejected",
      icon: XCircle,
      style:
        "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    };
  }

  if (staffStatus.includes("APPROV")) {
    return {
      label: "Approved",
      icon: CheckCircle2,
      style:
        "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
    };
  }

  return {
    label: "Pending",
    icon: Clock,
    style:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  };
}

export default function LeaveHistory() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");

  const student = JSON.parse(
    sessionStorage.getItem("student") || "null"
  );

  const studentId = student?.id;

  // TanStack Query: Fetch leave history
  const {
    data: leaveRequests = [],
    isLoading: loading,
    isFetching,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["studentLeaveRequests", studentId],

    queryFn: async () => {
      const response = await api.get(
        `/leaves/student/${studentId}`
      );

      return getRequests(response.data);
    },

    enabled: !!studentId,
  });

  const error = !studentId
    ? "Your details were not found. Please log in again."
    : isError
    ? queryError.response?.data?.message ||
      "Unable to load leave history. Please try again."
    : "";

  // Search, filter and sort
  const filteredRequests = useMemo(() => {
    const filtered = leaveRequests.filter((request) => {
      const status = getStatus(request).label;

      const matchesStatus =
        statusFilter === "ALL" ||
        status.toUpperCase() === statusFilter;

      const search = searchTerm.toLowerCase();

      const matchesSearch = [
        request.id,
        request.reason,
        request.fromDate,
        request.toDate,
        status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(search)
      );

      return matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(
        `${String(a.fromDate || "").slice(0, 10)}T00:00:00`
      ).getTime();

      const dateB = new Date(
        `${String(b.fromDate || "").slice(0, 10)}T00:00:00`
      ).getTime();

      return sortOrder === "NEWEST"
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [leaveRequests, searchTerm, statusFilter, sortOrder]);

  const approvedCount = leaveRequests.filter(
    (request) => getStatus(request).label === "Approved"
  ).length;

  const rejectedCount = leaveRequests.filter(
    (request) => getStatus(request).label === "Rejected"
  ).length;

  const pendingCount = leaveRequests.filter(
    (request) => getStatus(request).label === "Pending"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                <History size={27} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Leave History
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Review and search your submitted leave applications.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading || isFetching}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-500 dark:hover:text-orange-400"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh History
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Applications"
            value={leaveRequests.length}
            icon={ClipboardList}
            iconStyle="bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
          />

          <SummaryCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle2}
            iconStyle="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
          />

          <SummaryCard
            title="Rejected"
            value={rejectedCount}
            icon={XCircle}
            iconStyle="bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
          />

          <SummaryCard
            title="Awaiting Decision"
            value={pendingCount}
            icon={Clock}
            iconStyle="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          />
        </div>

        {/* Search and filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_200px_200px]">
            <div>
              <label
                htmlFor="historySearch"
                className="mb-2 block text-sm font-semibold"
              >
                Search applications
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 focus-within:border-orange-500 dark:border-slate-700 dark:bg-slate-800">
                <Search
                  size={18}
                  className="shrink-0 text-slate-400"
                />
                <input
                  id="historySearch"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by ID, reason or date..."
                  className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="statusFilter"
                className="mb-2 block text-sm font-semibold"
              >
                Filter by status
              </label>

              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sortOrder"
                className="mb-2 block text-sm font-semibold"
              >
                Sort by date
              </label>

              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-orange-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="NEWEST">Newest First</option>
                <option value="OLDEST">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* History list */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
            <h2 className="text-lg font-bold">Application Records</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredRequests.length} of {leaveRequests.length}{" "}
              applications
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Loading leave history...
              </p>
            </div>
          ) : error ? (
            <div className="px-6 py-14 text-center">
              <AlertCircle
                size={38}
                className="mx-auto text-red-500"
              />
              <p className="mt-4 font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <CalendarCheck size={30} />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                {leaveRequests.length === 0
                  ? "No leave history available"
                  : "No matching applications"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {leaveRequests.length === 0
                  ? "Your leave applications will appear here after you submit them."
                  : "Try changing your search term or status filter."}
              </p>

              {leaveRequests.length === 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/apply-leave")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  <CalendarDays size={17} />
                  Apply for Leave
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">S.No</th>
                      <th className="px-6 py-4 font-semibold">From Date</th>
                      <th className="px-6 py-4 font-semibold">To Date</th>
                      <th className="px-6 py-4 font-semibold">Duration</th>
                      <th className="px-6 py-4 font-semibold">Reason</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Document</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRequests.map((request, index) => {
                      const status = getStatus(request);
                      const StatusIcon = status.icon;
                      const days = calculateDays(
                        request.fromDate,
                        request.toDate
                      );

                      return (
                        <tr
                          key={request.id ?? index}
                          className="transition hover:bg-orange-50/40 dark:hover:bg-slate-800/50"
                        >
                          <td className="whitespace-nowrap px-6 py-5 font-semibold text-orange-600 dark:text-orange-400">
                            {index+1}
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            {formatDate(request.fromDate)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            {formatDate(request.toDate)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            {days == null
                              ? "—"
                              : `${days} ${days === 1 ? "day" : "days"}`}
                          </td>

                          <td className="max-w-xs px-6 py-5">
                            <p className="line-clamp-2 text-slate-600 dark:text-slate-300">
                              {request.reason || "—"}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.style}`}
                            >
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            {request.medicalFile ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                                <FileText size={15} />
                                Attached
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                None
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile layout */}
              <div className="space-y-4 p-4 md:hidden">
                {filteredRequests.map((request, index) => {
                  const status = getStatus(request);
                  const StatusIcon = status.icon;
                  const days = calculateDays(
                    request.fromDate,
                    request.toDate
                  );

                  return (
                    <div
                      key={request.id ?? index}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Request ID
                          </p>
                          <p className="mt-1 font-bold text-orange-600 dark:text-orange-400">
                            {request.id ?? "—"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold ${status.style}`}
                        >
                          <StatusIcon size={13} />
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <CalendarDays
                          size={18}
                          className="mt-0.5 shrink-0 text-orange-500"
                        />
                        <div className="text-sm">
                          <p>{formatDate(request.fromDate)}</p>
                          <p className="mt-1 text-slate-500 dark:text-slate-400">
                            to {formatDate(request.toDate)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {days == null
                              ? "Duration unavailable"
                              : `${days} ${days === 1 ? "day" : "days"}`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Reason
                        </p>
                        <p className="mt-1 wrap-break-word text-sm text-slate-600 dark:text-slate-300">
                          {request.reason || "—"}
                        </p>
                      </div>

                      {request.medicalFile && (
                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-orange-600 dark:text-orange-400">
                          <FileText size={15} />
                          Medical document attached
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          This page displays the leave records returned by your CLMS backend.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, iconStyle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}
