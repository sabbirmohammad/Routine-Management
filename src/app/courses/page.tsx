"use client";

import CourseTable from "./CourseTable";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CoursesPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Courses</h1>
          <p className="text-gray-700 max-w-2xl">Manage all university courses here. Add, edit, or remove courses as needed. Each course should have a unique code and descriptive name.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition text-base"
          onClick={() => {
            // Open the add modal via a custom event
            const event = new CustomEvent("openAddCourseModal");
            window.dispatchEvent(event);
          }}
        >
          <PlusIcon className="w-5 h-5" /> Add Course
        </button>
      </div>
      <CourseTable />
    </div>
  );
} 