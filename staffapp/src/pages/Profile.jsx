
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  Pencil,
  Save,
  X,
  ArrowLeft,
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";
import api from "../api/axiosConfig";

const StaffProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Get staff details from session storage
  const [staff, setStaff] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("staff") || "null");
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = useState({
    name: staff?.name || "",
    department: staff?.department || "",
    phoneNumber: staff?.phoneNumber || "",
    email: staff?.email || "",
  });

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if staff is not logged in
  useEffect(() => {
    if (!sessionStorage.getItem("staff")) {
      navigate("/staff/login");
    }
  }, [navigate]);

  // Automatically hide success message after 3 seconds
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  // 1. useQuery - Fetch profile image
  const {
  data: profileImage = "",
  isLoading: loading,
  isError,
  error: imageError,
} = useQuery({
  queryKey: ["staffProfileImage", staff?.id],

  queryFn: async () => {
    const response = await api.get(
      `/staffs/${staff.id}/profile-image`
    );

    console.log("Profile image API response:", response.data);

    return response.data?.data?.imageUrl || "";
  },

  enabled: !!staff?.id,

  // Always fetch the image when this query runs.
  staleTime: 0,
});

useEffect(() => {
  console.log("Profile Image URL:", profileImage);
}, [profileImage]);

  // 2. useMutation - Update staff profile
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.put(`/staffs/${staff.id}`, payload);
    },
    onSuccess: (response, payload) => {
      const updatedStaff = {
        ...staff,
        ...(response.data?.data || {}),
        ...payload,
        profileImageUrl: profileImage,
      };

      setStaff(updatedStaff);
      sessionStorage.setItem("staff", JSON.stringify(updatedStaff));
      window.dispatchEvent(new Event("staffProfileUpdated"));

      setFormData({
        name: updatedStaff.name || "",
        department: updatedStaff.department || "",
        phoneNumber: updatedStaff.phoneNumber || "",
        email: updatedStaff.email || "",
      });

      setEditing(false);
      setSuccess("Profile updated successfully.");
      setError("");
    },
    onError: (err) => {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update profile. Please try again."
      );
    },
  });

  // 3. useMutation - Upload profile image
  const uploadImageMutation = useMutation({
    mutationFn: async (formData) => {
      return await api.post(
        `/staffs/${staff.id}/profile-image`,
        formData
      );
    },
    onSuccess: (response) => {
      const imageUrl = response.data?.data?.imageUrl;

      if (!imageUrl) {
        setError("Image URL was not returned by the server.");
        return;
      }

      queryClient.setQueryData(
        ["staffProfileImage", staff.id],
        imageUrl
      );

      const updatedStaff = {
        ...staff,
        profileImageUrl: imageUrl,
      };

      setStaff(updatedStaff);
      sessionStorage.setItem("staff", JSON.stringify(updatedStaff));
      window.dispatchEvent(new Event("staffProfileUpdated"));
      setSuccess("Profile image uploaded successfully.");
      setError("");
    },
    onError: (err) => {
      console.error("Profile image upload error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to upload profile image."
      );
    },
  });

  // 4. useMutation - Delete profile image
  const deleteImageMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(
        `/staffs/${staff.id}/profile-image`
      );
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ["staffProfileImage", staff.id],
        ""
      );

      const updatedStaff = {
        ...staff,
        profileImageUrl: null,
      };

      setStaff(updatedStaff);
      sessionStorage.setItem("staff", JSON.stringify(updatedStaff));
window.dispatchEvent(new Event("staffProfileUpdated"));
      setSuccess("Profile image deleted successfully.");
      setError("");
    },
    onError: (err) => {
      console.error("Profile image delete error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete profile image."
      );
    },
  });

  const saving = updateProfileMutation.isPending;
  const imageLoading = uploadImageMutation.isPending;
  const deletingImage = deleteImageMutation.isPending;

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save staff profile details
  const handleSave = () => {
    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.department.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(String(formData.phoneNumber))) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    updateProfileMutation.mutate({
      name: formData.name.trim(),
      department: formData.department.trim(),
      email: formData.email.trim(),
      phoneNumber: Number(formData.phoneNumber),
    });
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: staff.name || "",
      department: staff.department || "",
      phoneNumber: staff.phoneNumber || "",
      email: staff.email || "",
    });

    setEditing(false);
    setError("");
    setSuccess("");
  };

  // Select profile image
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    const imageFormData = new FormData();
    imageFormData.append("image", file);

    uploadImageMutation.mutate(imageFormData);

    e.target.value = "";
  };

  // Delete profile image
  const handleDeleteImage = () => {
    if (!profileImage) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your profile image?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    deleteImageMutation.mutate();
  };

  const displayName = formData.name || staff?.name || "Staff";
  const initial = displayName.charAt(0).toUpperCase();

  if (!staff) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* Back Button */}
        <button
          onClick={() => navigate("/staff")}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-orange-500 dark:text-gray-300"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Manage your personal information and profile image.
          </p>
        </motion.div>

        {/* Alerts */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Profile Image Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-1"
          >
            <div className="flex flex-col items-center text-center">

              <div className="relative">

                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-orange-100 bg-orange-500 text-5xl font-bold text-white shadow-lg dark:border-orange-900">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={`${displayName}'s profile`}
                      className="h-full w-full object-cover"
                      onError={() =>
                        queryClient.setQueryData(
                          ["staffProfileImage", staff.id],
                          ""
                        )
                      }
                    />
                  ) : (
                    initial
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading || deletingImage}
                  className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-orange-500 text-white shadow-md transition hover:bg-orange-600 disabled:opacity-50 dark:border-gray-900"
                  title="Upload profile image"
                >
                  {imageLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Camera size={19} />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />

              </div>

              <h2 className="mt-5 text-xl font-bold">
                {displayName}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formData.department || "Department"}
              </p>

              <span className="mt-3 rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                Staff Account
              </span>

              <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
                Image size must be 5 MB.
              </p>

              <div className="mt-5 flex w-full flex-col gap-3">

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={imageLoading || deletingImage}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  <Camera size={17} />
                  {profileImage ? "Change Photo" : "Upload Photo"}
                </button>

                {profileImage && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={deletingImage || imageLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950/40"
                  >
                    {deletingImage ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                    Delete Image
                  </button>
                )}

              </div>
            </div>
          </motion.div>

          {/* Profile Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2"
          >
            <div className="mb-7 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your staff account details
                </p>
              </div>

              {!editing && (
                <button
                  onClick={() => {
                    setEditing(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-orange-950"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Department
                </label>

                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-orange-950"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-orange-950"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />

                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!editing}
                    maxLength={10}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-70 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-orange-950"
                  />
                </div>
              </div>

            </div>

            {/* Save / Cancel */}
            {editing && (
              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            )}

          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default StaffProfile;
