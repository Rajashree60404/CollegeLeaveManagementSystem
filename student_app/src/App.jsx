
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ApplyLeave from "./pages/ApplyLeave";
import LeaveStatus from "./pages/LeaveStatus";
import LeaveHistory from "./pages/LeaveHistory";
import Profile from "./pages/Profile";

import Layout from "./components/Layout";
import ParentApproval from "./pages/ParentApproval";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Home */}
        <Route path="/" element={<Home />} />

        {/* Student Login */}
        <Route path="/login" element={<Login />} />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Student Portal - Common Sidebar */}
        <Route element={<Layout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/apply-leave" element={<ApplyLeave />} />

          <Route path="/leave-status" element={<LeaveStatus />} />

          <Route path="/leave-history" element={<LeaveHistory />} />

          <Route path="/profile" element={<Profile />} />
</Route>
        <Route path="/parent-approval" element={<ParentApproval />} />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
