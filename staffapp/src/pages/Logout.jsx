
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear staff session
    sessionStorage.removeItem("staff");

    // Clear authentication token
    sessionStorage.removeItem("token");

    // Redirect to staff login
    navigate("/staffs-login", { replace: true });
  }, [navigate]);

  return null;
}
