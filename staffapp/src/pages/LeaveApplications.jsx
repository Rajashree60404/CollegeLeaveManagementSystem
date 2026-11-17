
import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";

import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  FileText,
  AlertCircle
} from "lucide-react";

import api from "../api/axiosConfig";

export default function LeaveApplications() {
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmLeave, setConfirmLeave] = useState(null);

  const queryClient = useQueryClient();

  const staff = JSON.parse(sessionStorage.getItem("staff") || "{}");

  // FETCH LEAVE APPLICATIONS USING TANSTACK QUERY
  const {
    data: applications = [],
    isPending: loading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["leaveApplications"],
    queryFn: async () => {
      const response = await api.get("/leaves");

      const result = response.data?.data ?? response.data;

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.content)
        ? result.content
        : [];

      return list;
    },
    refetchInterval: 5000
  });

  // APPROVE OR REJECT USING TANSTACK MUTATION
  const leaveMutation = useMutation({
    mutationFn: async ({ leaveId, status }) => {
      if (status === "APPROVED") {
        return await api.put(`/leaves/${leaveId}/approve`);
      } else {
        return await api.put(`/leaves/${leaveId}/reject`);
      }
    },

    onSuccess: (_, variables) => {
      const action =
        variables.status === "APPROVED" ? "approve" : "reject";

      setMessage(`Leave request ${action}d successfully.`);
      setError("");

      queryClient.invalidateQueries({
        queryKey: ["leaveApplications"]
      });
    },

    onError: (err, variables) => {
      const action =
        variables.status === "APPROVED" ? "approve" : "reject";

      console.error("Failed to update leave status:", err);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        `Unable to ${action} the leave request.`
      );

      setMessage("");
    },

    onSettled: () => {
      setUpdatingId(null);
      setConfirmLeave(null);
    }
  });

  // OPEN CUSTOM CONFIRMATION DIALOG
  const handleLeaveStatus = (leave, status) => {
    const parentStatus = String(
      leave.parentStatus || leave.parent_status || "PENDING"
    ).toUpperCase();

    // Block BOTH approval and rejection until parent approval
    if (parentStatus !== "APPROVED") {
      setError(
        "Parent has not approved this leave request yet. Staff cannot approve or reject it."
      );
      setMessage("");
      return;
    }

    setError("");
    setMessage("");

    setConfirmLeave({
      leaveId: leave.id,
      status,
      studentName:
        leave.student?.name || leave.studentName || "this student"
    });
  };

  // CONFIRM APPROVAL OR REJECTION
  const confirmLeaveAction = async () => {
    if (!confirmLeave) return;

    setUpdatingId(confirmLeave.leaveId);
    setError("");
    setMessage("");

    try {
      await leaveMutation.mutateAsync({
        leaveId: confirmLeave.leaveId,
        status: confirmLeave.status
      });
    } catch (err) {
      // Error is handled by mutation onError
    }
  };

  const filteredApplications = applications.filter((leave) => {
    const studentName = leave.student?.name || leave.studentName || "";
    const registerNo = leave.student?.registerNo || leave.registerNo || "";
    const reason = leave.reason || "";

    const searchText =
      `${studentName} ${registerNo} ${reason} ${leave.status || ""}`.toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  const getStatusStyle = (status) => {
    switch ((status || "PENDING").toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors duration-300 dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
              Leave Applications
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Review student leave requests and manage approvals.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Requests
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-white">
              {applications.length}
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm dark:border-amber-900 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pending
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
              {
                applications.filter(
                  (item) =>
                    (item.staffStatus || item.status || "PENDING").toUpperCase() ===
                    "PENDING"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-5 shadow-sm dark:border-green-900 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Approved
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {
                applications.filter(
                  (item) =>
                    (item.staffStatus || item.status || "").toUpperCase() ===
                    "APPROVED"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-4 dark:border-slate-700 sm:p-5">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, register number..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-orange-900"
              />
            </div>
          </div>

          {message && (
            <div className="mx-4 mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300 sm:mx-5">
              {message}
            </div>
          )}

          {error && (
            <div className="mx-4 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300 sm:mx-5">
              {error}
            </div>
          )}

          {isError ? (
            <div className="p-12 text-center text-red-500 dark:text-red-400">
              Unable to load leave applications. Please check your network connection.
              <button
                onClick={() => refetch()}
                className="ml-2 font-semibold text-orange-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              Loading leave applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText
                size={40}
                className="mx-auto mb-3 text-slate-400"
              />
              <p className="font-medium text-slate-700 dark:text-slate-200">
                No leave applications found
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Applications will appear here when available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Leave Dates</th>
                    <th className="px-5 py-4 font-semibold">Reason</th>
                    <th className="px-5 py-4 font-semibold">Parent Status</th>
                    <th className="px-5 py-4 font-semibold">Staff Status</th>
                    <th className="px-5 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredApplications.map((leave) => {
                    const studentName =
                      leave.student?.name ||
                      leave.studentName ||
                      "Unknown Student";

                    const registerNo =
                      leave.student?.registerNo || leave.registerNo || "—";

                    const staffStatus = (
                      leave.staffStatus || leave.status || "PENDING"
                    ).toUpperCase();

                    const pending = staffStatus === "PENDING";

                    return (
                      <tr
                        key={leave.id}
                        className="transition hover:bg-orange-50/60 dark:hover:bg-slate-800/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800 dark:text-white">
                            {studentName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Register No: {registerNo}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          <p>{formatDate(leave.fromDate || leave.from_date)}</p>
                          <p className="my-1 text-xs text-slate-400">to</p>
                          <p>{formatDate(leave.toDate || leave.to_date)}</p>
                        </td>

                        <td className="max-w-xs px-5 py-4 text-slate-600 dark:text-slate-300">
                          <p className="whitespace-normal">
                            {leave.reason || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              leave.parentStatus || leave.parent_status
                            )}`}
                          >
                            {(
                              leave.parentStatus ||
                              leave.parent_status ||
                              "PENDING"
                            ).toUpperCase()}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              staffStatus
                            )}`}
                          >
                            {staffStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {pending ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleLeaveStatus(leave, "APPROVED")}
                                disabled={updatingId === leave.id || !!confirmLeave}
                                title="Approve request"
                                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                              >
                                <CheckCircle size={15} />
                                Approve
                              </button>

                              <button
                                onClick={() => handleLeaveStatus(leave, "REJECTED")}
                                disabled={updatingId === leave.id || !!confirmLeave}
                                title="Reject request"
                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                              >
                                <XCircle size={15} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              Action completed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredApplications.length} of {applications.length} leave
          requests.
        </p>
      </div>

      {/* CUSTOM CONFIRMATION DIALOG */}
      {confirmLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">

            <div className="mb-5 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  confirmLeave.status === "APPROVED"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                }`}
              >
                <AlertCircle size={25} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                  Confirm {confirmLeave.status === "APPROVED" ? "Approval" : "Rejection"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Leave Application
                </p>
              </div>
            </div>

            <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to{" "}
              <span
                className={`font-semibold ${
                  confirmLeave.status === "APPROVED"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {confirmLeave.status === "APPROVED" ? "approve" : "reject"}
              </span>{" "}
              the leave request submitted by:
            </p>

            <p className="mb-6 rounded-lg bg-slate-100 px-4 py-3 font-semibold text-slate-800 dark:bg-slate-800 dark:text-white">
              {confirmLeave.studentName}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmLeave(null)}
                disabled={!!updatingId}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={confirmLeaveAction}
                disabled={!!updatingId}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmLeave.status === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {updatingId ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmLeave.status === "APPROVED"
                    ? "Yes, Approve"
                    : "Yes, Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
