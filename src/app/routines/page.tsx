"use client";

import RoutineTable from "./RoutineTable";
import RoutineCalendar from "./RoutineCalendar";
import RoutineBoard from "./RoutineBoard";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function RoutinesPage() {
  const [view, setView] = useState("table");
  const [routines, setRoutines] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);

  // Fetch routines and time slots once on mount
  useEffect(() => {
    fetch("/api/routines").then(r => r.json()).then(setRoutines);
    fetch("/api/time-slots").then(r => r.json()).then(setTimeSlots);
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Routines</h1>
          <p className="text-gray-700 max-w-2xl">Manage all class routines here. Add, edit, or remove routines as needed. Each routine assigns a course, teacher, room, and time slot for a specific day, department, and semester.</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition text-base"
          onClick={() => {
            // Open the add modal via a custom event
            const event = new CustomEvent("openAddRoutineModal");
            window.dispatchEvent(event);
          }}
        >
          <PlusIcon className="w-5 h-5" /> Add Routine
        </button>
      </div>
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition ${view === "table" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-900"}`}
          onClick={() => setView("table")}
        >
          Table View
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition ${view === "calendar" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-900"}`}
          onClick={() => setView("calendar")}
        >
          Calendar View
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition ${view === "board" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-900"}`}
          onClick={() => setView("board")}
        >
          Board View
        </button>
      </div>
      {view === "table" ? (
        <RoutineTable />
      ) : view === "calendar" ? (
        <RoutineCalendar routines={routines} timeSlots={timeSlots} />
      ) : (
        <RoutineBoard />
      )}
    </div>
  );
} 