"use client";
import { useEffect, useState } from "react";

interface Batch { id: string; number: number; sections: Section[]; }
interface Section { id: string; name: string; batchId: string; }

export default function SectionsPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [batchForm, setBatchForm] = useState<any>({});
  const [sectionForm, setSectionForm] = useState<any>({});
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [modalError, setModalError] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch|null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'batch'|'section', id: string, name: string} | null>(null);
  const [toast, setToast] = useState<{ type: 'success'|'error', message: string }|null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);

  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  async function fetchBatches() {
    setLoading(true);
    const res = await fetch("/api/batches?includeSections=1");
    const data = await res.json();
    setBatches(data);
    setLoading(false);
  }

  // Add Batch
  async function handleBatchSubmit(e: any) {
    e.preventDefault();
    setModalError("");
    setBatchLoading(true);
    try {
      // Validation: prevent duplicate batch number
      if (modalMode === 'add' && batches.some(b => Number(b.number) === Number(batchForm.number))) {
        setModalError('Batch number already exists.');
        setBatchLoading(false);
        return;
      }
      if (modalMode === 'edit' && batches.some(b => Number(b.number) === Number(batchForm.number) && b.id !== batchForm.id)) {
        setModalError('Batch number already exists.');
        setBatchLoading(false);
        return;
      }
      if (modalMode === 'add') {
        await fetch("/api/batches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: Number(batchForm.number) }),
        });
        setToast({ type: 'success', message: 'Batch added!' });
      } else {
        await fetch(`/api/batches/${batchForm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: Number(batchForm.number) }),
        });
        setToast({ type: 'success', message: 'Batch updated!' });
      }
      setShowBatchModal(false);
      setBatchForm({});
      fetchBatches();
    } catch (err: any) {
      setModalError(err.message);
      setToast({ type: 'error', message: err.message });
    }
    setBatchLoading(false);
  }
  async function handleBatchDelete(batchId: string, batchNumber: number) {
    setDeleteTarget({ type: 'batch', id: batchId, name: String(batchNumber) });
    setShowDeleteModal(true);
  }
  async function confirmBatchDelete() {
    if (!deleteTarget) return;
    setModalError("");
    setBatchLoading(true);
    try {
      await fetch(`/api/batches/${deleteTarget.id}`, { method: "DELETE" });
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Batch deleted!' });
      fetchBatches();
    } catch (err: any) {
      setModalError(err.message);
      setToast({ type: 'error', message: err.message });
    }
    setBatchLoading(false);
  }

  // Add/Edit Section
  async function handleSectionSubmit(e: any) {
    e.preventDefault();
    setModalError("");
    setSectionLoading(true);
    try {
      // Validation: prevent duplicate section name in batch
      const batch = batches.find(b => b.id === (sectionForm.batchId || selectedBatch?.id));
      if (batch) {
        if (modalMode === 'add' && batch.sections.some(s => s.name.toLowerCase() === sectionForm.name.toLowerCase())) {
          setModalError('Section name already exists in this batch.');
          setSectionLoading(false);
          return;
        }
        if (modalMode === 'edit' && batch.sections.some(s => s.name.toLowerCase() === sectionForm.name.toLowerCase() && s.id !== sectionForm.id)) {
          setModalError('Section name already exists in this batch.');
          setSectionLoading(false);
          return;
        }
      }
      if (modalMode === 'add') {
        await fetch("/api/sections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: sectionForm.name, batchId: sectionForm.batchId || selectedBatch?.id }),
        });
        setToast({ type: 'success', message: 'Section added!' });
      } else {
        await fetch(`/api/sections/${sectionForm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: sectionForm.name }),
        });
        setToast({ type: 'success', message: 'Section updated!' });
      }
      setShowSectionModal(false);
      setSectionForm({});
      fetchBatches();
    } catch (err: any) {
      setModalError(err.message);
      setToast({ type: 'error', message: err.message });
    }
    setSectionLoading(false);
  }
  async function handleSectionDelete(sectionId: string, sectionName: string) {
    setDeleteTarget({ type: 'section', id: sectionId, name: sectionName });
    setShowDeleteModal(true);
  }
  async function confirmSectionDelete() {
    if (!deleteTarget) return;
    setModalError("");
    setSectionLoading(true);
    try {
      await fetch(`/api/sections/${deleteTarget.id}`, { method: "DELETE" });
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setToast({ type: 'success', message: 'Section deleted!' });
      fetchBatches();
    } catch (err: any) {
      setModalError(err.message);
      setToast({ type: 'error', message: err.message });
    }
    setSectionLoading(false);
  }

  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Sections Management</h1>
      <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold shadow-lg mb-8 hover:from-indigo-700 hover:to-blue-600 transition" onClick={()=>{setShowBatchModal(true);setModalMode('add');}}>Add Batch</button>
      <div className="space-y-8">
        {loading ? <div className="text-gray-500 text-center py-8">Loading batches...</div> : batches.length === 0 ? <div className="text-gray-400 text-center py-8">No batches found. Click "Add Batch" to get started.</div> : (
          batches.map(batch => (
            <div key={batch.id} className="border rounded-xl p-5 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xl font-bold text-gray-900">Batch {batch.number}</div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition" onClick={()=>{setBatchForm(batch);setModalMode('edit');setShowBatchModal(true);}}>Edit</button>
                  <button className="px-3 py-1 rounded bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition" onClick={()=>handleBatchDelete(batch.id, batch.number)} disabled={batchLoading}>Delete</button>
                </div>
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-indigo-800 drop-shadow-sm">Sections:</span>
                  <button className="px-2 py-1 rounded bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-bold shadow hover:from-indigo-600 hover:to-blue-600 transition" onClick={()=>{setSelectedBatch(batch);setSectionForm({batchId: batch.id});setModalMode('add');setShowSectionModal(true);}}>Add Section</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {batch.sections && batch.sections.length > 0 ? batch.sections.map(section => (
                    <div key={section.id} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded-full shadow-sm hover:bg-indigo-700 transition">
                      <span className="font-bold drop-shadow-sm">{section.name}</span>
                      <button className="text-xs text-blue-200 hover:underline font-bold" onClick={()=>{setSectionForm(section);setSelectedBatch(batch);setModalMode('edit');setShowSectionModal(true);}}>Edit</button>
                      <button className="text-xs text-red-200 hover:underline font-bold" onClick={()=>handleSectionDelete(section.id, section.name)} disabled={sectionLoading}>Delete</button>
                    </div>
                  )) : <span className="text-gray-400">No sections</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modals for add/edit batch and section will go here */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'add' ? 'Add Batch' : 'Edit Batch'}</h2>
            <form onSubmit={handleBatchSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Batch Number</label>
                <input type="number" className="border rounded px-3 py-2 w-full bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400" required value={batchForm.number||""} onChange={e=>setBatchForm({...batchForm, number:e.target.value})} placeholder="e.g. 66" min={1} />
              </div>
              {modalError && <div className="text-red-600 mb-4 font-semibold">{modalError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition" onClick={()=>setShowBatchModal(false)} disabled={batchLoading}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold shadow-lg hover:from-indigo-700 hover:to-blue-600 transition" disabled={batchLoading}>{batchLoading ? (modalMode === 'add' ? 'Adding...' : 'Saving...') : (modalMode === 'add' ? 'Add Batch' : 'Save Changes')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'add' ? 'Add Section' : 'Edit Section'}</h2>
            <form onSubmit={handleSectionSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Section Name</label>
                <input type="text" className="border rounded px-3 py-2 w-full bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400" required value={sectionForm.name||""} onChange={e=>setSectionForm({...sectionForm, name:e.target.value})} placeholder="e.g. A, B, C" />
              </div>
              {modalError && <div className="text-red-600 mb-4 font-semibold">{modalError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition" onClick={()=>setShowSectionModal(false)} disabled={sectionLoading}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold shadow-lg hover:from-indigo-700 hover:to-blue-600 transition" disabled={sectionLoading}>{sectionLoading ? (modalMode === 'add' ? 'Adding...' : 'Saving...') : (modalMode === 'add' ? 'Add Section' : 'Save Changes')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Delete {deleteTarget.type === 'batch' ? 'Batch' : 'Section'}</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete {deleteTarget.type} <span className="font-bold">{deleteTarget.name}</span>?</p>
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>{setShowDeleteModal(false);setDeleteTarget(null);}} disabled={batchLoading || sectionLoading}>Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition" onClick={deleteTarget.type === 'batch' ? confirmBatchDelete : confirmSectionDelete} disabled={batchLoading || sectionLoading}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
} 