"use client";
import { useEffect, useState } from "react";

interface Batch { id: string; name: string; }
interface Semester { id: string; name: string; }
interface Section { id: string; name: string; batchId: string; semesterId: string; }

export default function BatchSemesterSectionPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [batchForm, setBatchForm] = useState<any>({});
  const [semesterForm, setSemesterForm] = useState<any>({});
  const [sectionForm, setSectionForm] = useState<any>({});
  const [modalMode, setModalMode] = useState<'add'|'edit'>("add");
  const [modalError, setModalError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'batch'|'semester'|'section', id: string, name: string} | null>(null);

  useEffect(() => { fetchAll(); }, []);
  async function fetchAll() {
    setLoading(true);
    const [b, s, sec] = await Promise.all([
      fetch("/api/batches").then(r=>r.json()),
      fetch("/api/semesters").then(r=>r.json()),
      fetch("/api/sections").then(r=>r.json()),
    ]);
    setBatches(b);
    setSemesters(s);
    setSections(sec);
    setLoading(false);
  }

  // Add Batch
  async function handleBatchSubmit(e: any) {
    e.preventDefault();
    setModalError("");
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: batchForm.name }),
      });
      if (!res.ok) throw new Error("Failed to add batch");
      setShowBatchModal(false);
      setBatchForm({});
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }

  // Add Semester
  async function handleSemesterSubmit(e: any) {
    e.preventDefault();
    setModalError("");
    try {
      const res = await fetch("/api/semesters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: semesterForm.name }),
      });
      if (!res.ok) throw new Error("Failed to add semester");
      setShowSemesterModal(false);
      setSemesterForm({});
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }

  // Add Section
  async function handleSectionSubmit(e: any) {
    e.preventDefault();
    setModalError("");
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sectionForm.name,
          batchId: sectionForm.batchId,
          semesterId: sectionForm.semesterId,
        }),
      });
      if (!res.ok) throw new Error("Failed to add section");
      setShowSectionModal(false);
      setSectionForm({});
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }

  // Edit Batch
  function openEditBatch(batch: Batch) {
    setBatchForm({ ...batch });
    setModalMode('edit');
    setShowBatchModal(true);
  }
  async function handleBatchEditSubmit(e: any) {
    e.preventDefault();
    setModalError("");
    try {
      const res = await fetch(`/api/batches/${batchForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: batchForm.name }),
      });
      if (!res.ok) throw new Error("Failed to update batch");
      setShowBatchModal(false);
      setBatchForm({});
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }
  async function handleBatchDelete() {
    if (!deleteTarget) return;
    setModalError("");
    try {
      const res = await fetch(`/api/batches/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete batch");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }

  // Edit Semester
  function openEditSemester(semester: Semester) {
    setSemesterForm({ ...semester });
    setModalMode('edit');
    setShowSemesterModal(true);
  }
  async function handleSemesterEditSubmit(e: any) {
    e.preventDefault();
    setModalError("");
    try {
      const res = await fetch(`/api/semesters/${semesterForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: semesterForm.name }),
      });
      if (!res.ok) throw new Error("Failed to update semester");
      setShowSemesterModal(false);
      setSemesterForm({});
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }
  async function handleSemesterDelete() {
    if (!deleteTarget) return;
    setModalError("");
    try {
      const res = await fetch(`/api/semesters/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete semester");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }

  // Edit Section
  function openEditSection(section: Section) {
    setSectionForm({ ...section });
    setModalMode('edit');
    setShowSectionModal(true);
  }
  async function handleSectionEditSubmit(e: any) {
    e.preventDefault();
    setModalError("");
    try {
      const res = await fetch(`/api/sections/${sectionForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sectionForm.name,
          batchId: sectionForm.batchId,
          semesterId: sectionForm.semesterId,
        }),
      });
      if (!res.ok) throw new Error("Failed to update section");
      setShowSectionModal(false);
      setSectionForm({});
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }
  async function handleSectionDelete() {
    if (!deleteTarget) return;
    setModalError("");
    try {
      const res = await fetch(`/api/sections/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete section");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      setModalError(err.message);
    }
  }

  // Render
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Batch, Semester & Section Management</h1>
      <div className="flex gap-4 mb-8">
        <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow" onClick={()=>{setShowBatchModal(true);setModalMode('add');}}>Add Batch</button>
        <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow" onClick={()=>{setShowSemesterModal(true);setModalMode('add');}}>Add Semester</button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Batch</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Semester</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Sections</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-6 text-gray-900 text-lg">Loading...</td></tr>
            ) : (
              batches.flatMap(batch => (
                semesters.map(semester => {
                  const secList = sections.filter(sec => sec.batchId === batch.id && sec.semesterId === semester.id);
                  return (
                    <tr key={batch.id + '-' + semester.id}>
                      <td className="px-5 py-3 border-b text-gray-900 text-base">{batch.name}</td>
                      <td className="px-5 py-3 border-b text-gray-900 text-base">{semester.name}</td>
                      <td className="px-5 py-3 border-b text-gray-900 text-base">
                        {secList.length === 0 ? <span className="text-gray-400">No sections</span> : secList.map(s => (
                          <span key={s.id} className="inline-flex items-center gap-2 mr-2">
                            {s.name}
                            <button className="text-xs text-blue-600 hover:underline" onClick={()=>openEditSection(s)}>Edit</button>
                            <button className="text-xs text-red-600 hover:underline ml-1" onClick={()=>{setDeleteTarget({type:'section',id:s.id,name:s.name});setShowDeleteModal(true);}}>Delete</button>
                          </span>
                        ))}
                      </td>
                      <td className="px-5 py-3 border-b text-gray-900 text-base">
                        <button className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-medium mr-2" onClick={()=>{setShowSectionModal(true);setModalMode('add');setSectionForm({batchId: batch.id, semesterId: semester.id});}}>Add Section</button>
                        <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-medium mr-2" onClick={()=>openEditBatch(batch)}>Edit Batch</button>
                        <button className="px-3 py-1 rounded bg-red-100 text-red-700 font-medium mr-2" onClick={()=>{setDeleteTarget({type:'batch',id:batch.id,name:batch.name});setShowDeleteModal(true);}}>Delete Batch</button>
                        <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-medium mr-2" onClick={()=>openEditSemester(semester)}>Edit Semester</button>
                        <button className="px-3 py-1 rounded bg-red-100 text-red-700 font-medium" onClick={()=>{setDeleteTarget({type:'semester',id:semester.id,name:semester.name});setShowDeleteModal(true);}}>Delete Semester</button>
                      </td>
                    </tr>
                  );
                })
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modals for add/edit batch, semester, section would go here */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'add' ? 'Add Batch' : 'Edit Batch'}</h2>
            <form onSubmit={modalMode === 'add' ? handleBatchSubmit : handleBatchEditSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Batch Name</label>
                <input type="text" className="border rounded px-3 py-2 w-full" required value={batchForm.name||""} onChange={e=>setBatchForm({...batchForm, name:e.target.value})} placeholder="e.g. 62 Batch" />
              </div>
              {modalError && <div className="text-red-600 mb-4">{modalError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>setShowBatchModal(false)}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow">{modalMode === 'add' ? 'Add Batch' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'add' ? 'Add Semester' : 'Edit Semester'}</h2>
            <form onSubmit={modalMode === 'add' ? handleSemesterSubmit : handleSemesterEditSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Semester Name</label>
                <input type="text" className="border rounded px-3 py-2 w-full" required value={semesterForm.name||""} onChange={e=>setSemesterForm({...semesterForm, name:e.target.value})} placeholder="e.g. 8th Semester" />
              </div>
              {modalError && <div className="text-red-600 mb-4">{modalError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>setShowSemesterModal(false)}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow">{modalMode === 'add' ? 'Add Semester' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'add' ? 'Add Section' : 'Edit Section'}</h2>
            <form onSubmit={modalMode === 'add' ? handleSectionSubmit : handleSectionEditSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Section Name</label>
                <input type="text" className="border rounded px-3 py-2 w-full" required value={sectionForm.name||""} onChange={e=>setSectionForm({...sectionForm, name:e.target.value})} placeholder="e.g. A, B, C" />
              </div>
              {modalError && <div className="text-red-600 mb-4">{modalError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>setShowSectionModal(false)}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow">{modalMode === 'add' ? 'Add Section' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Delete {deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)}</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete {deleteTarget.type} <span className="font-bold">{deleteTarget.name}</span>?</p>
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>{setShowDeleteModal(false);setDeleteTarget(null);}}>Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition" onClick={
                deleteTarget.type === 'batch' ? handleBatchDelete :
                deleteTarget.type === 'semester' ? handleSemesterDelete :
                handleSectionDelete
              }>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 