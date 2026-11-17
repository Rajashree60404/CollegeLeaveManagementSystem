
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  CalendarCheck,
} from "lucide-react";

function getStatus(value) {
  const normalized = String(value || "PENDING").toUpperCase();

  if (normalized.includes("REJECT")) {
    return {
      label: "Rejected",
      className:
        "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
      icon: XCircle,
    };
  }

  if (normalized.includes("APPROV")) {
    return {
      label: "Approved",
      className:
        "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300",
      icon: CheckCircle2,
    };
  }

  return {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    icon: Clock,
  };
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

function getRequests(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.content)) return data.content;

  return [];
}

export default function LeaveStatus() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("ALL");

  const student = JSON.parse(
    sessionStorage.getItem("student") || "null"
  );

  const studentId = student?.id;

  // TanStack Query: Fetch student leave requests
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
    ? "Student details were not found. Please log in again."
    : isError
    ? queryError.response?.data?.message ||
      "Unable to load your leave requests. Please try again."
    : "";

  const getOverallStatus = (request) => {
    // Prefer the final status returned by the backend.
    if (request.status) return getStatus(request.status);

    // If there is no final status, derive it from the approval fields.
    const parent = String(request.parentStatus || "").toUpperCase();
    const staff = String(request.staffStatus || "").toUpperCase();

    if (parent.includes("REJECT") || staff.includes("REJECT")) {
      return getStatus("REJECTED");
    }

    if (staff.includes("APPROV")) {
      return getStatus("APPROVED");
    }

    return getStatus("PENDING");
  };

  const filteredRequests = leaveRequests.filter((request) => {
    if (filter === "ALL") return true;

    return getOverallStatus(request).label.toUpperCase() === filter;
  });

  const approvedCount = leaveRequests.filter(
    (request) => getOverallStatus(request).label === "Approved"
  ).length;

  const pendingCount = leaveRequests.filter(
    (request) => getOverallStatus(request).label === "Pending"
  ).length;

  const rejectedCount = leaveRequests.filter(
    (request) => getOverallStatus(request).label === "Rejected"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
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
                <ClipboardList size={27} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Leave Status
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Track your submitted leave applications and approvals.
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
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Applications"
            value={leaveRequests.length}
            icon={ClipboardList}
            iconClass="bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
          />

          <SummaryCard
            title="Approved"
            value={approvedCount}
            icon={CheckCircle2}
            iconClass="bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400"
          />

          <SummaryCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            iconClass="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          />

          <SummaryCard
            title="Rejected"
            value={rejectedCount}
            icon={XCircle}
            iconClass="bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="mb-5 flex flex-wrap gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                filter === item
                  ? "bg-orange-500 text-white shadow-sm hover:bg-orange-600"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
              }`}
            >
              {item === "ALL"
                ? "All Requests"
                : item.charAt(0) + item.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
            <h2 className="text-lg font-bold">Your Leave Applications</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "application" : "applications"}{" "}
              displayed
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Loading your leave requests...
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
                  ? "No leave applications yet"
                  : "No applications in this category"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {leaveRequests.length === 0
                  ? "Your submitted leave requests will appear here."
                  : "Try selecting a different status filter."}
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
                      <th className="px-6 py-4 font-semibold">Leave Dates</th>
                      <th className="px-6 py-4 font-semibold">Duration</th>
                      <th className="px-6 py-4 font-semibold">Reason</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRequests.map((request, index) => {
                      const status = getOverallStatus(request);
                      const StatusIcon = status.icon;
                      const start = new Date(
                        `${String(request.fromDate).slice(0, 10)}T00:00:00`
                      );
                      const end = new Date(
                        `${String(request.toDate).slice(0, 10)}T00:00:00`
                      );

                      const days =
                        request.fromDate &&
                        request.toDate &&
                        !Number.isNaN(start.getTime()) &&
                        !Number.isNaN(end.getTime())
                          ? Math.floor(
                              (end.getTime() - start.getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) + 1
                          : "—";

                      return (
                        <tr
                          key={request.id ?? index}
                          className="transition hover:bg-orange-50/40 dark:hover:bg-slate-800/50"
                        >
                          <td className="whitespace-nowrap px-6 py-5 font-semibold text-orange-600 dark:text-orange-400">
                            {index+1}
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            <div className="font-medium">
                              {formatDate(request.fromDate)}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              to {formatDate(request.toDate)}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            {days} {days === 1 ? "day" : days === "—" ? "" : "days"}
                          </td>

                          <td className="max-w-xs px-6 py-5">
                            <p className="line-clamp-2 text-slate-600 dark:text-slate-300">
                              {request.reason || "—"}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                            >
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-4 p-4 md:hidden">
                {filteredRequests.map((request, index) => {
                  const status = getOverallStatus(request);
                  const StatusIcon = status.icon;

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
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold ${status.className}`}
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
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Reason
                        </p>
                        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">
                          {request.reason || "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Your Leave status.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}
