"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export default function TimeSlotTable() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStartTime, setAddStartTime] = useState("");
  const [addEndTime, setAddEndTime] = useState("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlot, setEditSlot] = useState<TimeSlot | null>(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
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
    window.addEventListener("openAddTimeSlotModal", handleOpenAddModal);
    return () => {
      window.removeEventListener("openAddTimeSlotModal", handleOpenAddModal);
    };
  }, []);

  // Accessibility: ESC to close modals
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setShowEditModal(false);
        setDeleteSlotId(null);
      }
    }
    if (showAddModal || showEditModal || deleteSlotId) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [showAddModal, showEditModal, deleteSlotId]);

  // Focus trap for modals
  useEffect(() => {
    if (showAddModal && addModalRef.current) addModalRef.current.focus();
    if (showEditModal && editModalRef.current) editModalRef.current.focus();
    if (deleteSlotId && deleteModalRef.current) deleteModalRef.current.focus();
  }, [showAddModal, showEditModal, deleteSlotId]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    fetchSlots();
  }, [search]);

  async function fetchSlots() {
    setLoading(true);
    const res = await fetch(`/api/time-slots?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setSlots(data);
    setLoading(false);
  }

  async function handleAddTimeSlot(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    const res = await fetch("/api/time-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: addStartTime, endTime: addEndTime }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setAddStartTime("");
      setAddEndTime("");
      fetchSlots();
    } else {
      const data = await res.json();
      setAddError(data.error || "Failed to add time slot");
    }
    setAddLoading(false);
  }

  async function handleDelete(id: string) {
    setDeleteLoading(true);
    const res = await fetch(`/api/time-slots/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchSlots();
    } else {
      alert("Failed to delete time slot");
    }
    setDeleteLoading(false);
  }

  function openEditModal(slot: TimeSlot) {
    setEditSlot(slot);
    setEditStartTime(format(new Date(slot.startTime), "HH:mm"));
    setEditEndTime(format(new Date(slot.endTime), "HH:mm"));
    setShowEditModal(true);
  }

  async function handleEditTimeSlot(e: React.FormEvent) {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    const res = await fetch(`/api/time-slots/${editSlot?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime: editStartTime, endTime: editEndTime }),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditSlot(null);
      fetchSlots();
    } else {
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "Failed to update time slot" };
      }
      setEditError((data as any).error || "Failed to update time slot");
    }
    setEditLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search by start or end time..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
        />
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Start Time</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">End Time</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-900 text-lg">Loading...</td>
              </tr>
            ) : slots.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-900 text-lg">No time slots found.</td>
              </tr>
            ) : (
              slots.map((slot, idx) => (
                <tr key={slot.id} className={
                  `transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-yellow-50`}
                >
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{format(new Date(slot.startTime), "hh:mm a")}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{format(new Date(slot.endTime), "hh:mm a")}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-yellow-100 text-yellow-600 hover:text-yellow-800 transition"
                      onClick={() => openEditModal(slot)}
                      title="Edit Time Slot"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-800 transition"
                      onClick={() => {
                        setDeleteSlotId(slot.id);
                        setShowDeleteModal(true);
                      }}
                      title="Delete Time Slot"
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
      {/* Add Time Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={addModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Time Slot</h2>
            <form onSubmit={handleAddTimeSlot}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Start Time</label>
                <input
                  type="time"
                  value={addStartTime}
                  onChange={e => setAddStartTime(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">End Time</label>
                <input
                  type="time"
                  value={addEndTime}
                  onChange={e => setAddEndTime(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
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
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                  disabled={addLoading}
                >
                  {addLoading ? "Adding..." : "Add Time Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Time Slot Modal */}
      {showEditModal && editSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={editModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Time Slot</h2>
            <form onSubmit={handleEditTimeSlot}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Start Time</label>
                <input
                  type="time"
                  value={editStartTime}
                  onChange={e => setEditStartTime(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">End Time</label>
                <input
                  type="time"
                  value={editEndTime}
                  onChange={e => setEditEndTime(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
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
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
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
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={deleteModalRef}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Time Slot</h2>
            <p className="mb-6 text-gray-900">Are you sure you want to delete this time slot?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                onClick={async()=>{if(deleteSlotId){await handleDelete(deleteSlotId);setShowDeleteModal(false);setDeleteSlotId(null);}}}
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