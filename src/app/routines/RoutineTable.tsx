"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Routine {
  id: string;
  course: { id: string; name: string; code: string };
  teacher: { id: string; name: string; initial: string };
  room: { id: string; number: string };
  timeSlot: { id: string; startTime: string; endTime: string };
  semester: { id: string; number: number };
  section: { id: string; name: string; batch?: { number: number } };
  dayOfWeek: number;
}

interface Option { id: string; name: string; initial?: string; number?: string | number; code?: string; batch?: { number: number }; startTime?: string; endTime?: string }

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function RoutineTable() {
  // Data
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);
  // Filters
  const [departmentId, setDepartmentId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [courseId, setCourseId] = useState("");
  const [sectionId, setSectionId] = useState("");
  // Options for selects
  const [departments, setDepartments] = useState<Option[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [timeSlots, setTimeSlots] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [batches, setBatches] = useState<Option[]>([]);
  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>("add");
  const [form, setForm] = useState<any>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const addModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  // Add department modal state
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [addDeptLoading, setAddDeptLoading] = useState(false);
  const [addDeptError, setAddDeptError] = useState("");

  // Fetch options for selects
  useEffect(() => {
    fetchOptions();
  }, []);
  async function fetchOptions() {
    const [deps, tchs, rms, crs, slots, secs, bts] = await Promise.all([
      fetch("/api/departments").then(r=>r.json()),
      fetch("/api/teachers").then(r=>r.json()),
      fetch("/api/rooms").then(r=>r.json()),
      fetch("/api/courses").then(r=>r.json()),
      fetch("/api/time-slots").then(r=>r.json()),
      fetch("/api/sections?includeBatch=1").then(r=>r.json()),
      fetch("/api/batches").then(r=>r.json()),
    ]);
    setDepartments(deps);
    setTeachers(tchs);
    setRooms(rms);
    setCourses(crs);
    setTimeSlots(slots);
    setSections(secs);
    setBatches(bts);
  }

  // Fetch routines
  useEffect(() => {
    fetchRoutines();
  }, [departmentId, teacherId, roomId, dayOfWeek, courseId, sectionId]);
  async function fetchRoutines() {
    setLoading(true);
    const params = new URLSearchParams();
    if (departmentId) params.append("departmentId", departmentId);
    if (teacherId) params.append("teacherId", teacherId);
    if (roomId) params.append("roomId", roomId);
    if (dayOfWeek) params.append("dayOfWeek", dayOfWeek);
    if (courseId) params.append("courseId", courseId);
    if (sectionId) params.append("sectionId", sectionId);
    const res = await fetch(`/api/routines?${params.toString()}`);
    const data = await res.json();
    setRoutines(data);
    setLoading(false);
  }

  // Listen for custom event to open add modal from header button
  useEffect(() => {
    function handleOpenAddModal() {
      setShowModal(true);
      setModalMode("add");
      setForm({});
      setModalError("");
    }
    window.addEventListener("openAddRoutineModal", handleOpenAddModal);
    return () => {
      window.removeEventListener("openAddRoutineModal", handleOpenAddModal);
    };
  }, []);

  // Accessibility: ESC to close modals
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowModal(false);
        setShowDeleteModal(false);
      }
    }
    if (showModal || showDeleteModal) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [showModal, showDeleteModal]);

  // Focus trap for modals
  useEffect(() => {
    if (showModal && addModalRef.current) addModalRef.current.focus();
    if (showModal && modalMode === "edit" && editModalRef.current) editModalRef.current.focus();
    if (showDeleteModal && deleteModalRef.current) deleteModalRef.current.focus();
  }, [showModal, showDeleteModal, modalMode]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Modal open helpers
  function openAddModal() {
    setModalMode("add");
    setForm({});
    setModalError("");
    setShowModal(true);
  }
  function openEditModal(r: Routine) {
    setModalMode("edit");
    const section = sections.find(s => s.id === r.section.id);
    setForm({
      id: r.id,
      courseId: r.course.id,
      teacherId: r.teacher.id,
      roomId: r.room.id,
      timeSlotId: r.timeSlot.id,
      batchId: section?.batch?.number || "",
      sectionId: r.section.id,
      dayOfWeek: r.dayOfWeek.toString(),
    });
    setModalError("");
    setShowModal(true);
  }

  // Conflict detection (now also checks section)
  function hasConflict(form: any) {
    return routines.some(r =>
      r.dayOfWeek === Number(form.dayOfWeek) &&
      r.timeSlot.id === form.timeSlotId &&
      (
        r.teacher.id === form.teacherId ||
        r.room.id === form.roomId ||
        r.section.id === form.sectionId
      ) &&
      (modalMode === "add" || r.id !== form.id)
    );
  }

  // Add/Edit submit
  async function handleModalSubmit(e: any) {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    if (hasConflict(form)) {
      setModalError("Conflict: Teacher, Room, or Section is already assigned at this time.");
      setModalLoading(false);
      return;
    }
    const method = modalMode === "add" ? "POST" : "PUT";
    const url = modalMode === "add" ? "/api/routines" : `/api/routines/${form.id}`;
    const body = {
      courseId: form.courseId,
      teacherId: form.teacherId,
      roomId: form.roomId,
      timeSlotId: form.timeSlotId,
      sectionId: form.sectionId,
      dayOfWeek: Number(form.dayOfWeek),
    };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({});
      setToast({ type: "success", message: modalMode === "add" ? "Routine added!" : "Routine updated!" });
      fetchRoutines();
    } else {
      let data = {};
      try { data = await res.json(); } catch {}
      setModalError((data as any).error || "Failed to save routine");
      setToast({ type: "error", message: (data as any).error || "Failed to save routine" });
    }
    setModalLoading(false);
  }

  // Delete
  async function handleDelete(id: string) {
    const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ type: "success", message: "Routine deleted!" });
      fetchRoutines();
    } else {
      setToast({ type: "error", message: "Failed to delete routine" });
    }
  }

  // Add this function to re-fetch sections only
  async function refreshSections() {
    const secs = await fetch("/api/sections").then(r=>r.json());
    setSections(secs);
  }

  // PDF export helpers must be inside the component
  function exportRoutinesToPDF(routines: Routine[], filename: string) {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Day', 'Time', 'Course', 'Teacher', 'Room', 'Section']],
      body: routines.map(r => [
        days[r.dayOfWeek],
        `${format(new Date(r.timeSlot.startTime), "hh:mm a")}-${format(new Date(r.timeSlot.endTime), "hh:mm a")}`,
        `${r.course.name} (${r.course.code})`,
        `${r.teacher.name} (${r.teacher.initial})`,
        r.room.number,
        `${r.section.batch?.number}-${r.section.name}`
      ]),
    });
    doc.save(filename);
  }
  function handleExportFiltered() {
    exportRoutinesToPDF(routines, 'filtered-routines.pdf');
  }
  function handleExportAllBySection() {
    const grouped: {[key: string]: Routine[]} = {};
    routines.forEach(r => {
      const key = `${r.section.batch?.number}-${r.section.name}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    const doc = new jsPDF();
    Object.keys(grouped).forEach((section, idx) => {
      if (idx > 0) doc.addPage();
      doc.text(`Section: ${section}`, 14, 14);
      autoTable(doc, {
        startY: 20,
        head: [['Day', 'Time', 'Course', 'Teacher', 'Room']],
        body: grouped[section].map(r => [
          days[r.dayOfWeek],
          `${format(new Date(r.timeSlot.startTime), "hh:mm a")}-${format(new Date(r.timeSlot.endTime), "hh:mm a")}`,
          `${r.course.name} (${r.course.code})`,
          `${r.teacher.name} (${r.teacher.initial})`,
          r.room.number,
        ]),
      });
    });
    doc.save('all-routines-by-section.pdf');
  }

  // Filtering UI
  return (
    <div>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
          <select value={departmentId} onChange={e=>setDepartmentId(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-40 text-gray-900 bg-white disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300">
            <option value="" className="text-gray-500">All Departments</option>
            {departments.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Teacher</label>
          <select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-40 text-gray-900 bg-white disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300">
            <option value="" className="text-gray-500">All Teachers</option>
            {teachers.map(t=>(<option key={t.id} value={t.id}>{t.name} ({t.initial})</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Room</label>
          <select value={roomId} onChange={e=>setRoomId(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-32 text-gray-900 bg-white disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300">
            <option value="" className="text-gray-500">All Rooms</option>
            {rooms.map(r=>(<option key={r.id} value={r.id}>{r.number}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
          <select value={sectionId} onChange={e=>setSectionId(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-32 text-gray-900 bg-white disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300">
            <option value="" className="text-gray-500">All Sections</option>
            {sections.map(s=>(<option key={s.id} value={s.id}>{s.batch?.number}-{s.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Day</label>
          <select value={dayOfWeek} onChange={e=>setDayOfWeek(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-32 text-gray-900 bg-white disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300">
            <option value="" className="text-gray-500">All Days</option>
            {days.map((d, i)=>(<option key={i} value={i}>{d}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
          <select value={courseId} onChange={e=>setCourseId(e.target.value)} className="border border-gray-300 rounded px-3 py-2 w-40 text-gray-900 bg-white disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300">
            <option value="" className="text-gray-500">All Courses</option>
            {courses.map(c=>(<option key={c.id} value={c.id}>{c.name} ({c.code})</option>))}
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <button type="button" onClick={refreshSections} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition mt-5">Refresh Sections</button>
        </div>
        {/* Export All by Section button */}
        <div className="flex flex-col justify-end">
          <button type="button" onClick={handleExportAllBySection} className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow hover:from-green-600 hover:to-emerald-700 transition mt-5">Export All by Section</button>
        </div>
      </div>
      {/* Export Filtered button (only show if routines are filtered and not empty) */}
      {(departmentId || teacherId || roomId || dayOfWeek || courseId || sectionId) && routines.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={handleExportFiltered} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition">Export Filtered</button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Day</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Time</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Course</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Teacher</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Room</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Section</th>
              <th className="px-5 py-3 border-b text-left text-gray-900 bg-gray-100 text-lg font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-6 text-gray-900 text-lg">Loading...</td></tr>
            ) : Array.isArray(routines) && routines.length > 0 ? (
              routines.map((routine, idx) => (
                <tr key={routine.id} className={
                  `transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}
                >
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{days[routine.dayOfWeek]}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{format(new Date(routine.timeSlot.startTime), "hh:mm a")} - {format(new Date(routine.timeSlot.endTime), "hh:mm a")}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{routine.course.name} ({routine.course.code})</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{routine.teacher.name} ({routine.teacher.initial})</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{routine.room.number}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base">{routine.section.batch?.number}-{routine.section.name}</td>
                  <td className="px-5 py-3 border-b text-gray-900 text-base flex gap-2">
                    <button
                      className="p-2 rounded hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 transition"
                      onClick={()=>openEditModal(routine)}
                      title="Edit Routine"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-800 transition"
                      onClick={()=>{setDeleteId(routine.id);setShowDeleteModal(true);}}
                      title="Delete Routine"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-900 text-lg">
                  {Array.isArray(routines) ? "No routines found." : "Failed to fetch routines."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
            tabIndex={-1}
            ref={addModalRef}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === "add" ? "Add Routine" : "Edit Routine"}</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Batch</label>
                <select className="border rounded px-3 py-2 w-full" required value={form.batchId||""} onChange={e=>setForm((f:any)=>({...f,batchId:e.target.value,sectionId: ""}))}>
                  <option value="">Select Batch</option>
                  {batches.map(b=>(<option key={b.id} value={b.id}>{b.number}</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Section</label>
                <select className="border rounded px-3 py-2 w-full text-gray-900" required value={form.sectionId||""} onChange={e=>setForm((f:any)=>({...f,sectionId:e.target.value}))} disabled={!form.batchId}>
                  <option value="">Select Section</option>
                  {sections.filter(s=>s.batch?.number===form.batchId).map(s=>(<option key={s.id} value={s.id}>{s.batch?.number}-{s.name}</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Course</label>
                <select className="border rounded px-3 py-2 w-full" required value={form.courseId||""} onChange={e=>setForm((f:any)=>({...f,courseId:e.target.value}))}>
                  <option value="">Select Course</option>
                  {courses.map(c=>(<option key={c.id} value={c.id}>{c.name} ({c.code})</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Teacher</label>
                <select className="border rounded px-3 py-2 w-full" required value={form.teacherId||""} onChange={e=>setForm((f:any)=>({...f,teacherId:e.target.value}))}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t=>(<option key={t.id} value={t.id}>{t.name} ({t.initial})</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Room</label>
                <select className="border rounded px-3 py-2 w-full" required value={form.roomId||""} onChange={e=>setForm((f:any)=>({...f,roomId:e.target.value}))}>
                  <option value="">Select Room</option>
                  {rooms.map(r=>(<option key={r.id} value={r.id}>{r.number}</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Time Slot</label>
                <select className="border rounded px-3 py-2 w-full" required value={form.timeSlotId||""} onChange={e=>setForm((f:any)=>({...f,timeSlotId:e.target.value}))}>
                  <option value="">Select Time Slot</option>
                  {timeSlots.map(ts=>(<option key={ts.id} value={ts.id}>{format(new Date(ts.startTime || ""), "hh:mm a")} - {format(new Date(ts.endTime || ""), "hh:mm a")}</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold text-gray-900">Day</label>
                <select className="border rounded px-3 py-2 w-full" required value={form.dayOfWeek||""} onChange={e=>setForm((f:any)=>({...f,dayOfWeek:e.target.value}))}>
                  <option value="">Select Day</option>
                  {days.map((d,i)=>(<option key={i} value={i}>{d}</option>))}
                </select>
              </div>
              {modalError && <div className="text-red-600 mb-4">{modalError}</div>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>setShowModal(false)} disabled={modalLoading}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" disabled={modalLoading}>{modalLoading ? (modalMode==="add"?"Adding...":"Saving...") : (modalMode==="add"?"Add Routine":"Save Changes")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Delete Routine</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this routine?
              {deleteId && (() => {
                const r = routines.find(r => r.id === deleteId);
                if (!r) return null;
                return (
                  <span className="block mt-2 text-sm text-gray-600">
                    <b>Course:</b> {r.course.name} <b>Section:</b> {r.section.batch?.number}-{r.section.name} <b>Day:</b> {days[r.dayOfWeek]}
                  </span>
                );
              })()}
            </p>
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={()=>setShowDeleteModal(false)} disabled={modalLoading}>Cancel</button>
              <button className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition" onClick={async()=>{if(deleteId){await handleDelete(deleteId);setShowDeleteModal(false);setDeleteId(null);}}} disabled={modalLoading}>Delete</button>
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