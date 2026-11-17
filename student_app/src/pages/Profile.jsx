
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  GraduationCap,
  Hash,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
  Upload,
} from "lucide-react";
import api from "../services/api";

const emptyProfile = {
  id: "",
  name: "",
  registerNo: "",
  department: "",
  email: "",
  phoneNumber: "",
  parentEmail: "",
};

function unwrapResponse(response) {
  const body = response?.data;
  return body?.data ?? body;
}

function readStoredStudent() {
  try {
    return JSON.parse(sessionStorage.getItem("student") || "null");
  } catch {
    return null;
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [student] = useState(() => readStoredStudent());
  const studentId = student?.id;

  const [profile, setProfile] = useState(emptyProfile);
  const [formData, setFormData] = useState(emptyProfile);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Automatically hide success message after 3 seconds.
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  // Fetch student profile details.
  const profileQuery = useQuery({
    queryKey: ["studentProfile", studentId],
    queryFn: async () => {
      const response = await api.get(`/students/${studentId}`);
      const data = unwrapResponse(response);

      return {
        ...emptyProfile,
        ...data,
        id: data?.id ?? studentId,
        name: data?.name ?? data?.studentName ?? "",
        registerNo: data?.registerNo ?? "",
        department: data?.department ?? "",
        email: data?.email ?? "",
        phoneNumber: data?.phoneNumber ?? "",
        parentEmail: data?.parentEmail ?? data?.parent_email ?? "",
      };
    },
    enabled: !!studentId,
  });

  // Fetch profile image URL from backend.
  const profileImageQuery = useQuery({
    queryKey: ["studentProfileImage", studentId],
    queryFn: async () => {
      const response = await api.get(
        `/students/${studentId}/profile-image`
      );

      const data = unwrapResponse(response);

      return typeof data === "string" ? data : data?.imageUrl || "";
    },
    enabled: !!studentId,
    staleTime: 0,
  });

  // Update local profile state when profile data is fetched.
  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
      setFormData(profileQuery.data);
    }
  }, [profileQuery.data]);

  // Generate temporary image preview.
  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  // Redirect when student session is unavailable.
  useEffect(() => {
    if (!studentId) {
      navigate("/login");
    }
  }, [studentId, navigate]);

  // Profile update mutation.
  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.put(
        `/students/${profile.id}`,
        payload
      );

      return unwrapResponse(response);
    },
    onSuccess: (responseData, payload) => {
      const updatedProfile = {
        ...profile,
        ...formData,
        ...(responseData && typeof responseData === "object"
          ? responseData
          : {}),
        name: payload.name,
        phoneNumber: payload.phoneNumber,
        parentEmail: payload.parentEmail,
      };

      setProfile(updatedProfile);
      setFormData(updatedProfile);

      // Update student session information.
      const stored = sessionStorage.getItem("student");

      if (stored) {
        try {
          const cachedStudent = JSON.parse(stored);

          sessionStorage.setItem(
            "student",
            JSON.stringify({
              ...cachedStudent,
              name: updatedProfile.name,
              phoneNumber: updatedProfile.phoneNumber,
              parentEmail: updatedProfile.parentEmail,
            })
          );
        } catch {
          console.error("Unable to update cached student details.");
        }
      }

      queryClient.setQueryData(
        ["studentProfile", studentId],
        updatedProfile
      );

      setEditing(false);
      setSuccess("Your profile has been updated successfully.");
    },
    onError: (err) => {
      console.error("Profile update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save your profile. Please try again."
      );
    },
  });

  // Upload profile image mutation.
  const uploadImageMutation = useMutation({
    mutationFn: async (imageFile) => {
      const imageFormData = new FormData();
      imageFormData.append("image", imageFile);

      return api.post(
        `/students/${profile.id}/profile-image`,
        imageFormData,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["studentProfileImage", studentId],
      });

      setSelectedImage(null);
      setSuccess("Your profile image has been uploaded successfully.");
    },
    onError: (err) => {
      console.error("Image upload error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to upload your image. Please try again."
      );
    },
  });

  // Delete profile image mutation.
  const deleteImageMutation = useMutation({
    mutationFn: async () => {
      return api.delete(
        `/students/${profile.id}/profile-image`
      );
    },
    onSuccess: () => {
      queryClient.setQueryData(
        ["studentProfileImage", studentId],
        ""
      );

      setSelectedImage(null);
      setSuccess("Your profile image has been deleted successfully.");
    },
    onError: (err) => {
      console.error("Profile image delete error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete your profile image."
      );
    },
  });

  const loading = profileQuery.isLoading;
  const saving = updateProfileMutation.isPending;
  const imageLoading =
    uploadImageMutation.isPending || deleteImageMutation.isPending;

  const profileImage = profileImageQuery.data || "";

  const displayedError =
    error ||
    (profileQuery.isError
      ? profileQuery.error?.response?.data?.message ||
        "Unable to load your profile. Please try again."
      : "");

  // Select and validate profile image.
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setError("");
    setSuccess("");
  };

  // Upload profile image.
  const handleImageUpload = () => {
    if (!selectedImage || !profile.id) {
      setError("Please choose an image first.");
      return;
    }

    setError("");
    setSuccess("");
    uploadImageMutation.mutate(selectedImage);
  };

  // Delete profile image.
  const handleDeleteImage = () => {
    if (!profile.id || !profileImage) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your profile image?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    deleteImageMutation.mutate();
  };

  // Handle profile form changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // Cancel editing.
  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
    setError("");
    setSuccess("");
  };

  // Save updated profile details.
  const handleSave = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!/^\d{10}$/.test(String(formData.phoneNumber).trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (
      formData.parentEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.parentEmail.trim()
      )
    ) {
      setError("Please enter a valid parent email address.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      phoneNumber: String(formData.phoneNumber).trim(),
      parentEmail: formData.parentEmail.trim(),
    };

    updateProfileMutation.mutate(payload);
  };

  const initials = (profile.name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const displayedImage = previewUrl || profileImage;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-7 text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Page Header */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage your personal details and student account.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {displayedError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <span>{displayedError}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Banner */}
        <div className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 p-6 text-white shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[40px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">

            {/* Circular Profile Image */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white/20 shadow-xl sm:h-36 sm:w-36">
                {displayedImage ? (
                  <img
                    src={displayedImage}
                    alt="Student profile"
                    className="h-full w-full rounded-full object-cover"
                    onError={() => {
                      queryClient.setQueryData(
                        ["studentProfileImage", studentId],
                        ""
                      );
                      setSelectedImage(null);
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-orange-600 text-4xl font-bold text-white">
                    {initials}
                  </div>
                )}

                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <RefreshCw
                      size={27}
                      className="animate-spin text-white"
                    />
                  </div>
                )}
              </div>

              {/* Image Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-orange-600 shadow-sm transition hover:bg-orange-50">
                  <Camera size={15} />
                  {profileImage ? "Change Photo" : "Upload Photo"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={imageLoading}
                  />
                </label>

                {profileImage && !selectedImage && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={imageLoading}
                    title="Delete profile image"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 transition hover:bg-red-200 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Preview Upload Actions */}
              {selectedImage && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={imageLoading}
                    className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  >
                    {imageLoading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}

                    {imageLoading ? "Uploading..." : "Save Photo"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    disabled={imageLoading}
                    className="flex items-center gap-1 rounded-full border border-white/50 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              )}

              <p className="text-[11px] text-orange-50">
                JPEG, PNG or WebP · Maximum 5 MB
              </p>
            </div>

            {/* Student Details */}
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-sm font-semibold text-orange-100">
                STUDENT PROFILE
              </p>

              <h2 className="break-words text-2xl font-bold sm:text-3xl">
                {profile.name || "Student"}
              </h2>

              <p className="mt-2 break-all text-sm text-orange-50">
                {profile.email || "Email not available"}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-xs font-semibold">
                  <ShieldCheck size={15} />
                  CLMS Student Account
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-xs font-semibold">
                  <GraduationCap size={15} />
                  {profile.department || "Student"}
                </span>
              </div>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={() => {
                  setFormData(profile);
                  setEditing(true);
                  setError("");
                  setSuccess("");
                }}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-orange-600 shadow-md transition hover:bg-orange-50"
              >
                <Pencil size={17} />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

            {/* Personal Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold">
                    Personal Information
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {editing
                      ? "Update your personal contact details."
                      : "Your registered student information."}
                  </p>
                </div>

                {editing && (
                  <span className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
                    Editing Mode
                  </span>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <ProfileField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  editable={editing}
                  icon={UserRound}
                  required
                />

                <ProfileField
                  label="Register Number"
                  name="registerNo"
                  value={formData.registerNo}
                  editable={false}
                  icon={Hash}
                />

                <ProfileField
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  editable={false}
                  icon={Mail}
                  type="email"
                />

                <ProfileField
                  label="Department"
                  name="department"
                  value={formData.department}
                  editable={false}
                  icon={GraduationCap}
                />

                <ProfileField
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  editable={editing}
                  icon={Phone}
                  type="tel"
                  required
                />

                <ProfileField
                  label="Parent Email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  editable={editing}
                  icon={Users}
                  type="email"
                />
              </div>

              {/* Save and Cancel */}
              {editing && (
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={17} className="animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                  <ShieldCheck size={24} />
                </div>

                <h3 className="text-lg font-bold">
                  Account Information
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Your profile helps CLMS maintain accurate student
                  and parent contact information for leave-related
                  communication.
                </p>

                <div className="mt-6 space-y-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <InfoRow
                    icon={Mail}
                    label="Student Email"
                    value={profile.email || "Not provided"}
                  />

                  <InfoRow
                    icon={Phone}
                    label="Contact Number"
                    value={profile.phoneNumber || "Not provided"}
                  />

                  <InfoRow
                    icon={CalendarDays}
                    label="Register Number"
                    value={profile.registerNo || "Not provided"}
                  />
                </div>
              </div>

              {/* Helpful Card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-6 text-white shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                  <UserRound size={23} />
                </div>

                <h3 className="font-bold">
                  Keep Your Profile Updated
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Ensure your phone number and parent email are correct
                  so important leave notifications can reach the right
                  contacts.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Reusable Profile Field.
function ProfileField({
  label,
  name,
  value,
  onChange,
  editable,
  icon: Icon,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        {label}

        {editable && required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div
        className={`flex items-center gap-3 rounded-xl border px-4 transition ${
          editable
            ? "border-slate-200 bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-orange-900/40"
            : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60"
        }`}
      >
        <Icon
          size={18}
          className={
            editable
              ? "shrink-0 text-orange-500"
              : "shrink-0 text-slate-400"
          }
        />

        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          readOnly={!editable}
          required={editable && required}
          maxLength={name === "name" ? 100 : undefined}
          autoComplete="off"
          className={`min-w-0 w-full bg-transparent py-3.5 text-sm outline-none ${
            editable
              ? "text-slate-800 dark:text-slate-100"
              : "cursor-default text-slate-500 dark:text-slate-400"
          }`}
        />

        {!editable && (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Fixed
          </span>
        )}
      </div>
    </div>
  );
}

// Reusable Account Information Row.
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}
