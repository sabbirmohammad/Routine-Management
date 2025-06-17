"use client";
import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Semester { id: string; number: number; }

export default function SemesterTable() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>("add");
  const [form, setForm] = useState<any>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string|null>(null);
  const [toast, setToast] = useState<{ type: "success"|"error"; message: string }|null>(null);

  useEffect(() => { fetchSemesters(); }, []);
  async function fetchSemesters() {
    setLoading(true);
    const res = await fetch("/api/semesters");
    const data = await res.json();
    setSemesters(data);
    setLoading(false);
  }

  function openAddModal() {
    setModalMode("add");
    setForm({});
    setModalError("");
    setShowModal(true);
  }
  function openEditModal(semester: Semester) {
    setModalMode("edit");
    setForm({ id: semester.id, number: semester.number });
    setModalError("");
    setShowModal(true);
  }

  async function handleModalSubmit(e: any) {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    const method = modalMode === "add" ? "POST" : "PUT";
    const url = modalMode === "add" ? "/api/semesters" : `/api/semesters/${form.id}`;
    const body = { number: Number(form.number) };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({});
      setToast({ type: "success", message: modalMode === "add" ? "Semester added!" : "Semester updated!" });
      fetchSemesters();
    } else {
      let data = {};
      try { data = await res.json(); } catch {}
      setModalError((data as any).error || "Failed to save semester");
      setToast({ type: "error", message: (data as any).error || "Failed to save semester" });
    }
    setModalLoading(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/semesters/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ type: "success", message: "Semester deleted!" });
      fetchSemesters();
    } else {
      setToast({ type: "error", message: "Failed to delete semester" });
    }
  }

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Semesters</h1>
        <button onClick={openAddModal} className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">Add Semester</button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Number</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="text-center py-6 text-gray-900 text-lg">Loading...</td></tr>
            ) : semesters.length === 0 ? (
              <tr><td colSpan={2} className="text-center py-6 text-gray-900 text-lg">No semesters found.</td></tr>
            ) : (
              semesters.map((semester, idx) => (
                <tr key={semester.id} className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{semester.number}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base flex gap-2">
                    <button className="p-2 rounded hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition" onClick={()=>openEditModal(semester)} title="Edit Semester">
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-800 transition" onClick={()=>{setDeleteId(semester.id);setShowDeleteModal(true);}} title="Delete Semester">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === "add" ? "Add Semester" : "Edit Semester"}</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Semester Number</label>
                <input type="number" className="border rounded px-3 py-2 w-full" required value={form.number||""} onChange={e=>setForm((f:any)=>({...f,number:e.target.value}))} placeholder="e.g. 1, 2, 3" min={1} />
              </div>
              {modalError && <div className="text-red-600 mb-4">{modalError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>setShowModal(false)} disabled={modalLoading}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" disabled={modalLoading}>{modalLoading ? (modalMode==="add"?"Adding...":"Saving...") : (modalMode==="add"?"Add Semester":"Save Changes")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Delete Semester</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this semester?</p>
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>setShowDeleteModal(false)}>Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition" onClick={async()=>{if(deleteId){await handleDelete(deleteId);setShowDeleteModal(false);setDeleteId(null);}}}>Delete</button>
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