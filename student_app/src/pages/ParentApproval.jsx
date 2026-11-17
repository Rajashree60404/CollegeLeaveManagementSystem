
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ParentApproval() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const action = searchParams.get("action");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError("");

      await axios.post(
        "http://localhost:8082/parent/approval/confirm",
        { token, action }
      );

      setMessage(
        action === "APPROVE"
          ? "Leave approved successfully!"
          : "Leave rejected successfully!"
      );

      setSuccess(true);

      // Hide the success message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);

    } catch (err) {
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message ||
            "Unable to process your decision."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token || !["APPROVE", "REJECT"].includes(action)) {
    return (
      <div className="p-8 text-center">
        Invalid approval link.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      {!success && (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

          <h1 className="text-2xl font-bold text-gray-800">
            Parent Leave Approval
          </h1>

          <p className="mt-4 text-gray-600">
            Are you sure you want to {action.toLowerCase()} this leave request?
          </p>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-orange-500 hover:bg-orange-600 text-white py-3 font-semibold disabled:opacity-50 transition"
          >
            {loading ? "Submitting..." : "Confirm Decision"}
          </button>

          {error && (
            <p className="mt-4 text-red-600">
              {error}
            </p>
          )}

        </div>
      )}

      {success && message && (
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4 text-green-500">
            ✓
          </div>

          <h2 className="text-xl font-bold text-green-600">
            {message}
          </h2>
        </div>
      )}

    </div>
  );
}
