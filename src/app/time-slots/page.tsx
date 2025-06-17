"use client";

import TimeSlotTable from "./TimeSlotTable";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function TimeSlotsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Time Slots</h1>
          <p className="text-gray-700 max-w-2xl">Manage all time slots here. Add, edit, or remove time slots as needed. Each time slot should have a unique start and end time.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow hover:from-yellow-600 hover:to-orange-600 transition text-base"
          onClick={() => {
            // Open the add modal via a custom event
            const event = new CustomEvent("openAddTimeSlotModal");
            window.dispatchEvent(event);
          }}
        >
          <PlusIcon className="w-5 h-5" /> Add Time Slot
        </button>
      </div>
      <TimeSlotTable />
    </div>
  );
} 