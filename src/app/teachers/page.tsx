"use client";

import TeacherTable from "./TeacherTable";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function TeachersPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Teachers</h1>
          <p className="text-gray-700 max-w-2xl">Manage all university teachers here. Add, edit, or remove teachers as needed. Each teacher should have a unique initial and full name.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow hover:from-pink-600 hover:to-rose-600 transition text-base"
          onClick={() => {
            // Open the add modal via a custom event
            const event = new CustomEvent("openAddTeacherModal");
            window.dispatchEvent(event);
          }}
        >
          <PlusIcon className="w-5 h-5" /> Add Teacher
        </button>
      </div>
      <TeacherTable />
    </div>
  );
} 