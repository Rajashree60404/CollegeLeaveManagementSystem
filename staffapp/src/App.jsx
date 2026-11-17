
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LeaveApplications from "./pages/LeaveApplications";

import RegisterStudents from "./pages/RegisterStudents";
import Profile from "./pages/Profile";
import LeaveRecords from "./pages/LeaveRecords";
import Layout from "./components/Layout";
import ForgotPassword from "./pages/ForgotPassword";
import Logout from "./pages/Logout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* First page */}
        <Route path="/" element={<Home />} />

        {/* Staff login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Forgot Password - Standalone Page */}
        <Route
          path="/staff/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Staff protected layout */}
        <Route path="/staff" element={<Layout />}>

          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="leave-applications"
            element={<LeaveApplications />}
          />

          <Route
            path="leave-records"
            element={<LeaveRecords />}
          />

          <Route
            path="register-students"
            element={<RegisterStudents />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="logout"
            element={<Logout />}
          />

        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
