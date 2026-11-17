
import { useEffect,useState } from "react";
import {
  UserPlus,
  User,
  Mail,
  Phone,
  Building2,
  Hash,
  CheckCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
} from "formik";

import * as Yup from "yup";

import api from "../api/axiosConfig";

const initialValues = {
  registerNo: "",
  name: "",
  department: "",
  email: "",
  phoneNumber: "",
  parentEmail: "",
};

// Yup Validation Schema
const validationSchema = Yup.object({
  registerNo: Yup.string()
    .required("Register number is required")
    .matches(/^[1-9]\d*$/, "Enter a valid register number"),

  name: Yup.string()
    .trim()
    .required("Student name is required")
    .min(3, "Name must contain at least 3 characters"),

  department: Yup.string()
    .trim()
    .required("Department is required"),

  email: Yup.string()
    .trim()
    .email("Enter a valid student email address")
    .required("Student email is required"),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number"),

  parentEmail: Yup.string()
    .trim()
    .email("Enter a valid parent email address")
    .required("Parent email is required"),
});

export default function RegisterStudents() {
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const [success, setSuccess] = useState("");
// Automatically hide success message after 3 seconds.
useEffect(() => {
  if (!success) return;

  const timer = setTimeout(() => {
    setSuccess("");
  }, 3000);

  return () => clearTimeout(timer);
}, [success]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setMessage("");
    setApiError("");

    const payload = {
      registerNo: Number(values.registerNo),
      name: values.name.trim(),
      department: values.department.trim(),
      email: values.email.trim(),
      phoneNumber: Number(values.phoneNumber),
      parentEmail: values.parentEmail.trim(),
    };

    try {
      const response = await api.post(
        "/staffs/register-student",
        payload
      );

      setMessage(
        response.data?.message ||
        "Student registered successfully! The student can set their password later."
      );

      resetForm();

    } catch (err) {
      console.error("Student registration error:", err);

      setApiError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Unable to register student. Please check the details and try again."
      );

    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = (resetForm) => {
    resetForm();
    setMessage("");
    setApiError("");
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-orange-900";

  const fields = [
    {
      label: "Register Number",
      name: "registerNo",
      type: "text",
      placeholder: "Enter register number",
      icon: Hash,
    },
    {
      label: "Student Name",
      name: "name",
      type: "text",
      placeholder: "Enter full name",
      icon: User,
    },
    {
      label: "Department",
      name: "department",
      type: "text",
      placeholder: "e.g. MCA",
      icon: Building2,
    },
    {
      label: "Student Email",
      name: "email",
      type: "email",
      placeholder: "student@example.com",
      icon: Mail,
    },
    {
      label: "Phone Number",
      name: "phoneNumber",
      type: "tel",
      placeholder: "10-digit phone number",
      icon: Phone,
    },
    {
      label: "Parent Email",
      name: "parentEmail",
      type: "email",
      placeholder: "parent@example.com",
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 transition-colors duration-300 dark:bg-slate-950 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        {/* Page Header */}
        <div className="mb-8">

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
            <UserPlus size={28} />
          </div>

          <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
            Register Students
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Add student information to the College Leave Management System.
          </p>

        </div>

        {/* Registration Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

          {/* Card Header */}
          <div className="border-b border-slate-200 bg-orange-50 px-6 py-5 dark:border-slate-700 dark:bg-slate-800">

            <h2 className="font-semibold text-slate-800 dark:text-white">
              Student Information
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter the student's details below.
            </p>

          </div>

          {/* Formik */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >

            {({ isSubmitting, resetForm }) => (

              <Form noValidate className="p-6 sm:p-8">

                {/* Success Message */}
                {message && (
                  <div
                    role="status"
                    className="mb-6 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300"
                  >
                    <CheckCircle size={20} className="shrink-0" />
                    <p>{message}</p>
                  </div>
                )}

                {/* API Error */}
                {apiError && (
                  <div
                    role="alert"
                    className="mb-6 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300"
                  >
                    <AlertCircle size={20} className="shrink-0" />
                    <p>{apiError}</p>
                  </div>
                )}

                {/* Input Fields */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {fields.map((field) => {

                    const Icon = field.icon;

                    return (
                      <div key={field.name}>

                        <label
                          htmlFor={field.name}
                          className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
                        >
                          {field.label}
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <div className="relative">

                          <Icon
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <Field
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            className={`${inputClass} pl-10`}
                          />

                        </div>

                        <ErrorMessage
                          name={field.name}
                          component="p"
                          className="mt-1.5 text-xs font-medium text-red-500"
                        />

                      </div>
                    );
                  })}

                </div>

                {/* Password Information
                <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">

                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                    Password Setup
                  </p>

                  <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                    Staff do not create the student's password. The student
                    can set their own password through the password setup process.
                  </p>

                </div> */}

                {/* Buttons */}
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() => handleReset(resetForm)}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <RotateCcw size={17} />
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UserPlus size={18} />

                    {isSubmitting
                      ? "Registering..."
                      : "Register Student"}

                  </button>

                </div>

              </Form>
            )}

          </Formik>

        </div>

      </div>

    </div>
  );
}
