"use client";

import RoomTable from "./RoomTable";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function RoomsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Rooms</h1>
          <p className="text-gray-700 max-w-2xl">Manage all university rooms here. Add, edit, or remove rooms as needed. Each room should have a unique number and can be marked as available or unavailable.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-600 transition text-base"
          onClick={() => {
            // Open the add modal via a custom event
            const event = new CustomEvent("openAddRoomModal");
            window.dispatchEvent(event);
          }}
        >
          <PlusIcon className="w-5 h-5" /> Add Room
        </button>
      </div>
      <RoomTable />
    </div>
  );
} 