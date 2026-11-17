
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  FilePlus2,
  History,
  ArrowRight,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const student = JSON.parse(
    sessionStorage.getItem("student") || "{}"
  );

  const studentId = student.id;

  const {
    data: dashboard,
    isLoading: loading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["studentDashboard", studentId],

    queryFn: async () => {
      const response = await api.get(
        `/students/${studentId}/dashboard`
      );

      return response.data.data;
    },

    enabled: !!studentId,
  });

  const error = !studentId
    ? "Student information not found. Please log in again."
    : isError
    ? queryError.response?.data?.message ||
      "Unable to load dashboard details."
    : "";

  const totalAllowed = Number(dashboard?.totalAllowedLeaves ?? 7);
  const leavesTaken = Number(dashboard?.leavesTaken ?? 0);
  const remainingLeaves = Math.max(0, totalAllowed - leavesTaken);

  const stats = [
    {
      title: "Total Allowed Leaves",
      value: totalAllowed,
      icon: CalendarDays,
      color: "blue",
      description: "Your yearly leave allowance",
    },
    {
      title: "Leaves Taken",
      value: leavesTaken,
      icon: CheckCircle2,
      color: "green",
      description: "Approved leave days",
    },
    {
      title: "Remaining Leaves",
      value: remainingLeaves,
      icon: Clock,
      color: "orange",
      description: "Available leave days",
    },
    {
      title: "Pending Requests",
      value: dashboard?.pendingRequests ?? 0,
      icon: XCircle,
      color: "purple",
      description: "Awaiting approval",
    },
  ];

  const colorStyles = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    green: "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 transition-colors dark:bg-slate-900 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Welcome Section */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-orange-100">
                <GraduationCap size={22} />
                <span className="text-sm font-medium">
                  Student Portal
                </span>
              </div>

              <h2 className="text-2xl font-bold sm:text-3xl">
                Welcome back, {student.name || student.studentName || "Student"}!
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-orange-50">
                Manage your leave applications, track approval status,
                and keep your academic leave records organized.
              </p>
            </div>

            <Link
              to="/apply-leave"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-orange-600 shadow-md transition hover:bg-orange-50"
            >
              <FilePlus2 size={18} />
              Apply for Leave
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Leave Overview
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A quick summary of your leave information.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl p-3 ${colorStyles[item.color]}`}>
                      <Icon size={23} />
                    </div>

                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>

                  <h4 className="mt-5 font-semibold text-slate-800 dark:text-slate-100">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              to="/apply-leave"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                  <FilePlus2 size={25} />
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Apply for Leave
                  </h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Submit a new leave application.
                  </p>
                </div>
              </div>

              <ArrowRight className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-500" />
            </Link>

            <Link
              to="/leave-history"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                  <History size={25} />
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Leave History
                  </h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    View your previous leave records.
                  </p>
                </div>
              </div>

              <ArrowRight className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-500" />
            </Link>
          </div>
        </div>

        {/* Leave Information */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/50 dark:bg-orange-950/20">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
              <CalendarDays size={21} />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">
                Leave Application Reminder
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Make sure you provide accurate leave dates and reasons.
                For leave exceeding 7 days, attach the required medical
                document before submitting your application.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
