"use client";

import { useEffect, useState, useRef } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Room {
  id: string;
  number: string;
  capacity?: number | null;
  isAvailable: boolean;
  createdAt: string;
}

export default function RoomTable() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editAvailable, setEditAvailable] = useState(true);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add Room modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addNumber, setAddNumber] = useState("");
  const [addCapacity, setAddCapacity] = useState("");
  const [addAvailable, setAddAvailable] = useState(true);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const addModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  // Listen for custom event to open add modal from header button
  useEffect(() => {
    function handleOpenAddModal() {
      setShowAddModal(true);
    }
    window.addEventListener("openAddRoomModal", handleOpenAddModal);
    return () => {
      window.removeEventListener("openAddRoomModal", handleOpenAddModal);
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
    fetchRooms();
  }, [search]);

  async function fetchRooms() {
    setLoading(true);
    const res = await fetch(`/api/rooms?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setRooms(data);
    setLoading(false);
  }

  function openEditModal(room: Room) {
    setEditId(room.id);
    setEditNumber(room.number);
    setEditCapacity(room.capacity?.toString() || "");
    setEditAvailable(room.isAvailable);
    setEditError("");
    setShowEditModal(true);
  }

  async function handleEditRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditError("");
    setEditLoading(true);
    const res = await fetch(`/api/rooms/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: editNumber, capacity: editCapacity, isAvailable: editAvailable }),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditId(null);
      setEditNumber("");
      setEditCapacity("");
      setEditAvailable(true);
      setToast({ type: "success", message: "Room updated!" });
      fetchRooms();
    } else {
      const data = await res.json();
      setEditError(data.error || "Failed to update room");
      setToast({ type: "error", message: data.error || "Failed to update room" });
    }
    setEditLoading(false);
  }

  async function handleDeleteRoom() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await fetch(`/api/rooms/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    setDeleteLoading(false);
    setToast({ type: "success", message: "Room deleted!" });
    fetchRooms();
  }

  async function handleAddRoom(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: addNumber, capacity: addCapacity, isAvailable: addAvailable }),
    });
    if (res.ok) {
      setShowAddModal(false);
      setAddNumber("");
      setAddCapacity("");
      setAddAvailable(true);
      setToast({ type: "success", message: "Room added!" });
      fetchRooms();
    } else {
      const data = await res.json();
      setAddError(data.error || "Failed to add room");
      setToast({ type: "error", message: data.error || "Failed to add room" });
    }
    setAddLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search by room number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
        />
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Number</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Capacity</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Available</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-900 text-lg">Loading...</td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-900 text-lg">No rooms found.</td>
              </tr>
            ) : (
              rooms
                .slice()
                .sort((a, b) => {
                  const aNum = parseInt(a.number, 10);
                  const bNum = parseInt(b.number, 10);
                  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                  return a.number.localeCompare(b.number);
                })
                .map((room, idx) => (
                <tr key={room.id} className={
                  `transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50`}
                >
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{room.number}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{room.capacity ?? '-'}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">
                    {room.isAvailable ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">Available</span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">Unavailable</span>
                    )}
                  </td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-green-100 text-green-600 hover:text-green-800 transition"
                      onClick={() => openEditModal(room)}
                      title="Edit Room"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-800 transition"
                      onClick={() => setDeleteId(room.id)}
                      title="Delete Room"
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
      {/* Edit Room Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={editModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Room</h2>
            <form onSubmit={handleEditRoom}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Room Number</label>
                <input
                  type="text"
                  value={editNumber}
                  onChange={e => setEditNumber(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Capacity (optional)</label>
                <input
                  type="number"
                  value={editCapacity}
                  onChange={e => setEditCapacity(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  min={0}
                />
              </div>
              <div className="mb-5 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editAvailable}
                  onChange={e => setEditAvailable(e.target.checked)}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  id="edit-available"
                />
                <label htmlFor="edit-available" className="font-semibold text-gray-900">Available</label>
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
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
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
            <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Room</h2>
            <p className="mb-6 text-gray-900">Are you sure you want to delete this room?</p>
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
                onClick={handleDeleteRoom}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={addModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Add Room</h2>
            <form onSubmit={handleAddRoom}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Room Number</label>
                <input
                  type="text"
                  value={addNumber}
                  onChange={e => setAddNumber(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  required
                />
              </div>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-900">Capacity (optional)</label>
                <input
                  type="number"
                  value={addCapacity}
                  onChange={e => setAddCapacity(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  min={0}
                />
              </div>
              <div className="mb-5 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={addAvailable}
                  onChange={e => setAddAvailable(e.target.checked)}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  id="add-available"
                />
                <label htmlFor="add-available" className="font-semibold text-gray-900">Available</label>
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
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  disabled={addLoading}
                >
                  {addLoading ? "Adding..." : "Add Room"}
                </button>
              </div>
            </form>
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