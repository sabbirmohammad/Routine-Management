"use client";

import { useEffect, useState, useRef } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Teacher {
  id: string;
  name: string;
  initial: string;
  department?: string;
  createdAt: string;
}

export default function TeacherTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addInitial, setAddInitial] = useState("");
  const [addDepartment, setAddDepartment] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editInitial, setEditInitial] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const addModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  // Listen for custom event to open add modal from header button
  useEffect(() => {
    function handleOpenAddModal() {
      setShowAddModal(true);
    }
    window.addEventListener("openAddTeacherModal", handleOpenAddModal);
    return () => {
      window.removeEventListener("openAddTeacherModal", handleOpenAddModal);
    };
  }, []);

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
    fetchTeachers();
  }, [search]);

  async function fetchTeachers() {
    setLoading(true);
    const res = await fetch(`/api/teachers?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setTeachers(data);
    setLoading(false);
  }

  async function handleAddTeacher(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    const res = await fetch("/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addName, initial: addInitial, department: addDepartment }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setAddName("");
      setAddInitial("");
      setAddDepartment("");
      setToast({ type: "success", message: "Teacher added!" });
      fetchTeachers();
    } else {
      const data = await res.json();
      setAddError(data.error || "Failed to add teacher");
      setToast({ type: "error", message: data.error || "Failed to add teacher" });
    }
    setAddLoading(false);
  }

  function openEditModal(teacher: Teacher) {
    setEditId(teacher.id);
    setEditName(teacher.name);
    setEditInitial(teacher.initial);
    setEditDepartment(teacher.department || "");
    setEditError("");
    setShowEditModal(true);
  }

  async function handleEditTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditError("");
    setEditLoading(true);
    const res = await fetch(`/api/teachers/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, initial: editInitial, department: editDepartment }),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditId(null);
      setEditName("");
      setEditInitial("");
      setEditDepartment("");
      setToast({ type: "success", message: "Teacher updated!" });
      fetchTeachers();
    } else {
      const data = await res.json();
      setEditError(data.error || "Failed to update teacher");
      setToast({ type: "error", message: data.error || "Failed to update teacher" });
    }
    setEditLoading(false);
  }

  async function handleDeleteTeacher() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await fetch(`/api/teachers/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setDeleteLoading(false);
    setToast({ type: "success", message: "Teacher deleted!" });
    fetchTeachers();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search by name, initial, or department..."
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
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Initial</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Department</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-900 text-lg">Loading...</td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-900 text-lg">No teachers found.</td>
              </tr>
            ) : (
              teachers.map((teacher, idx) => (
                <tr key={teacher.id} className={
                  `transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-pink-50`}
                >
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{teacher.name}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{teacher.initial}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{teacher.department || '-'}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-pink-100 text-pink-600 hover:text-pink-800 transition"
                      onClick={() => openEditModal(teacher)}
                      title="Edit Teacher"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-800 transition"
                      onClick={() => setDeleteId(teacher.id)}
                      title="Delete Teacher"
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
      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={addModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Teacher</h2>
            <form onSubmit={handleAddTeacher}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Full Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Initial</label>
                <input
                  type="text"
                  value={addInitial}
                  onChange={e => setAddInitial(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Department</label>
                <input
                  type="text"
                  value={addDepartment}
                  onChange={e => setAddDepartment(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
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
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  disabled={addLoading}
                >
                  {addLoading ? "Adding..." : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Teacher Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={editModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Teacher</h2>
            <form onSubmit={handleEditTeacher}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Initial</label>
                <input
                  type="text"
                  value={editInitial}
                  onChange={e => setEditInitial(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Department</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={e => setEditDepartment(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
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
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
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
            <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Teacher</h2>
            <p className="mb-6 text-gray-900">Are you sure you want to delete this teacher?</p>
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
                onClick={handleDeleteTeacher}
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