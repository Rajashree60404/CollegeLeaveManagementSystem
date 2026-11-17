
import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosConfig";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  CalendarDays,
  UserRound,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

// -------------------- Helper functions --------------------

const getStaffStatus = (leave) =>
  String(leave?.staffStatus || "PENDING").toUpperCase();

const getParentStatus = (leave) =>
  String(leave?.parentStatus || "PENDING").toUpperCase();

const getLeaveType = (leave) =>
  String(leave?.leaveType || "NORMAL").toUpperCase();

const getStudentName = (leave) =>
  leave?.student?.name ||
  leave?.studentName ||
  leave?.name ||
  "Unknown Student";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// -------------------- Status badge --------------------

const StatusBadge = ({ status }) => {
  const value = String(status || "PENDING").toUpperCase();

  const styles =
    value === "APPROVED"
      ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
      : value === "REJECTED"
      ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
      : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {value}
    </span>
  );
};

// -------------------- Leave type badge --------------------

const LeaveTypeBadge = ({ type }) => {
  const emergency = type === "EMERGENCY";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        emergency
          ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
          : "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400"
      }`}
    >
      {emergency ? "Emergency" : "Normal"}
    </span>
  );
};

// -------------------- Statistics card --------------------

const SummaryCard = ({ title, value, icon: Icon, color, loading }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? "..." : value}
          </h2>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

// -------------------- Fetch leave requests --------------------

const fetchLeaveRequests = async () => {
  try {
    const response = await api.get("/leaves");

    console.log("Dashboard Leave API Response:", response.data);

    // Supports direct array and ResponseStructure
    const leaves = Array.isArray(response.data)
      ? response.data
      : response.data?.data;

    if (Array.isArray(leaves)) {
      return leaves;
    }

    throw new Error("Unexpected response received from the server.");
  } catch (error) {
    console.error("Error fetching leave requests:", error);

    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "Unable to load leave requests."
    );
  }
};

// -------------------- Main Dashboard --------------------

const Dashboard = () => {
  // TanStack Query
  const {
    data: leaveRequests = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["staffDashboardLeaves"],
    queryFn: fetchLeaveRequests,
  });

  const loading = isLoading;

  const errorMessage = error?.message || "";

  // -------------------- Dashboard calculations --------------------

  const totalRequests = leaveRequests.length;

  const pendingRequests = leaveRequests.filter(
    (leave) => getStaffStatus(leave) === "PENDING"
  ).length;

  const approvedRequests = leaveRequests.filter(
    (leave) => getStaffStatus(leave) === "APPROVED"
  ).length;

  const rejectedRequests = leaveRequests.filter(
    (leave) => getStaffStatus(leave) === "REJECTED"
  ).length;

  // Statistics cards
  const cards = [
    {
      title: "Total Requests",
      value: totalRequests,
      icon: FileText,
      color:
        "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: Clock,
      color:
        "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    },
    {
      title: "Approved Requests",
      value: approvedRequests,
      icon: CheckCircle,
      color:
        "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    },
    {
      title: "Rejected Requests",
      value: rejectedRequests,
      icon: XCircle,
      color:
        "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    },
  ];

  // Latest five requests
  const recentRequests = [...leaveRequests]
    .sort((a, b) => {
      const aId = Number(a?.id || 0);
      const bId = Number(b?.id || 0);
      return bId - aId;
    })
    .slice(0, 5);

  // -------------------- UI --------------------

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">

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
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of student leave applications and approval status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Statistics cards */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            loading={loading}
          />
        ))}
      </div>

      {/* Recent Leave Requests */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">

        {/* Section header */}
        <div className="flex flex-col justify-between gap-2 border-b border-gray-200 px-5 py-5 dark:border-gray-700 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Leave Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Latest student leave applications
            </p>
          </div>

          <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
            Showing {Math.min(5, leaveRequests.length)} of {leaveRequests.length}
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center gap-3 p-12 text-gray-500 dark:text-gray-400">
            <RefreshCw
              size={28}
              className="animate-spin text-orange-500"
            />
            <p>Loading leave requests...</p>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-gray-500 dark:text-gray-400">
            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-700">
              <FileText size={30} />
            </div>

            <p className="font-semibold text-gray-700 dark:text-gray-200">
              No leave requests available
            </p>

            <p className="text-sm">
              Student leave applications will appear here.
            </p>
          </div>
        ) : (

          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">

              <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">From Date</th>
                  <th className="px-5 py-4">To Date</th>
                  <th className="px-5 py-4">Leave Type</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Parent Status</th>
                  <th className="px-5 py-4">Staff Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentRequests.map((leave, index) => (
                  <tr
                    key={leave.id ?? index}
                    className="transition hover:bg-orange-50/50 dark:hover:bg-gray-700/40"
                  >
                    {/* Student */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                          <UserRound size={19} />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {getStudentName(leave)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Leave ID: {leave.id ?? "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* From date */}
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="text-orange-500"
                        />
                        {formatDate(leave.fromDate)}
                      </div>
                    </td>

                    {/* To date */}
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {formatDate(leave.toDate)}
                    </td>

                    {/* Leave type */}
                    <td className="px-5 py-4">
                      <LeaveTypeBadge type={getLeaveType(leave)} />
                    </td>

                    {/* Reason */}
                    <td className="max-w-[220px] px-5 py-4 text-gray-600 dark:text-gray-300">
                      <span
                        className="block truncate"
                        title={leave.reason || ""}
                      >
                        {leave.reason || "-"}
                      </span>
                    </td>

                    {/* Parent status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={getParentStatus(leave)} />
                    </td>

                    {/* Staff status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={getStaffStatus(leave)} />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
