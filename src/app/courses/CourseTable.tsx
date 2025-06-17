"use client";

import { useEffect, useState, useRef } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Course {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export default function CourseTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCode, setAddCode] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const addModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  // Accessibility: ESC to close modals
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setShowEditModal(false);
        setDeleteId(null);
      }
    }
    if (showAddModal || showEditModal || deleteId) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [showAddModal, showEditModal, deleteId]);

  // Focus trap for modals
  useEffect(() => {
    if (showAddModal && addModalRef.current) addModalRef.current.focus();
    if (showEditModal && editModalRef.current) editModalRef.current.focus();
    if (deleteId && deleteModalRef.current) deleteModalRef.current.focus();
  }, [showAddModal, showEditModal, deleteId]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    fetchCourses();
    // Listen for custom event to open add modal from header button
    function handleOpenAddModal() {
      setShowAddModal(true);
    }
    window.addEventListener("openAddCourseModal", handleOpenAddModal);
    return () => {
      window.removeEventListener("openAddCourseModal", handleOpenAddModal);
    };
    // eslint-disable-next-line
  }, [search]);

  async function fetchCourses() {
    setLoading(true);
    const res = await fetch(`/api/courses?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setCourses(data);
    setLoading(false);
  }

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addName, code: addCode }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setAddName("");
      setAddCode("");
      setToast({ type: "success", message: "Course added!" });
      fetchCourses();
    } else {
      const data = await res.json();
      setAddError(data.error || "Failed to add course");
      setToast({ type: "error", message: data.error || "Failed to add course" });
    }
    setAddLoading(false);
  }

  function openEditModal(course: Course) {
    setEditId(course.id);
    setEditName(course.name);
    setEditCode(course.code);
    setEditError("");
    setShowEditModal(true);
  }

  async function handleEditCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditError("");
    setEditLoading(true);
    const res = await fetch(`/api/courses/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, code: editCode }),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditId(null);
      setEditName("");
      setEditCode("");
      setToast({ type: "success", message: "Course updated!" });
      fetchCourses();
    } else {
      const data = await res.json();
      setEditError(data.error || "Failed to update course");
      setToast({ type: "error", message: data.error || "Failed to update course" });
    }
    setEditLoading(false);
  }

  async function handleDeleteCourse() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await fetch(`/api/courses/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setDeleteLoading(false);
    setToast({ type: "success", message: "Course deleted!" });
    fetchCourses();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Name</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Code</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-900 text-lg">Loading...</td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-900 text-lg">No courses found.</td>
              </tr>
            ) : (
              courses.map((course, idx) => (
                <tr key={course.id} className={
                  `transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}
                >
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{course.name}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{course.code}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition"
                      onClick={() => openEditModal(course)}
                      title="Edit Course"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-800 transition"
                      onClick={() => setDeleteId(course.id)}
                      title="Delete Course"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={addModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Course</h2>
            <form onSubmit={handleAddCourse}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Code</label>
                <input
                  type="text"
                  value={addCode}
                  onChange={e => setAddCode(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
              {addError && <div className="text-red-600 mb-4">{addError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition"
                  onClick={() => setShowAddModal(false)}
                  disabled={addLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  disabled={addLoading}
                >
                  {addLoading ? "Adding..." : "Add Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={editModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Course</h2>
            <form onSubmit={handleEditCourse}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Code</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={e => setEditCode(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
              {editError && <div className="text-red-600 mb-4">{editError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={deleteModalRef}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Course</h2>
            <p className="mb-6 text-gray-900">Are you sure you want to delete this course?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition"
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                onClick={handleDeleteCourse}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
} 