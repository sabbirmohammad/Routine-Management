import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function RoutineModal({
  open,
  mode = "add",
  initialValues = {},
  onSubmit,
  onClose,
  routines = [],
}: {
  open: boolean;
  mode: "add" | "edit";
  initialValues?: any;
  onSubmit: (form: any) => Promise<void>;
  onClose: () => void;
  routines?: any[];
}) {
  const [form, setForm] = useState<any>(initialValues || {});
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const addModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchOptions();
      setForm(initialValues || {});
      setModalError("");
    }
    // eslint-disable-next-line
  }, [open, initialValues]);

  async function fetchOptions() {
    const [bts, secs, crs, tchs, rms, slots] = await Promise.all([
      fetch("/api/batches").then(r=>r.json()),
      fetch("/api/sections?includeBatch=1").then(r=>r.json()),
      fetch("/api/courses").then(r=>r.json()),
      fetch("/api/teachers").then(r=>r.json()),
      fetch("/api/rooms").then(r=>r.json()),
      fetch("/api/time-slots").then(r=>r.json()),
    ]);
    setBatches(bts);
    setSections(secs);
    setCourses(crs);
    setTeachers(tchs);
    setRooms(rms);
    setTimeSlots(slots);
  }

  function hasConflict(form: any) {
    return routines.some(r =>
      r.dayOfWeek === Number(form.dayOfWeek) &&
      r.timeSlotId === form.timeSlotId &&
      (
        r.teacherId === form.teacherId ||
        r.roomId === form.roomId ||
        r.sectionId === form.sectionId
      ) &&
      (mode === "add" || r.id !== form.id)
    );
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    if (hasConflict(form)) {
      setModalError("Conflict: Teacher, Room, or Section is already assigned at this time.");
      setModalLoading(false);
      return;
    }
    try {
      await onSubmit(form);
    } catch (err: any) {
      setModalError(err.message || "Failed to save routine");
    }
    setModalLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 animate-fade-in"
        tabIndex={-1}
        ref={addModalRef}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{mode === "add" ? "Add Routine" : "Edit Routine"}</h2>
        <form onSubmit={handleSubmit}>
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
              {sections.filter(s=>s.batch?.id===form.batchId).map(s=>(<option key={s.id} value={s.id}>{s.batch?.number}-{s.name}</option>))}
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
              {timeSlots.map(ts=>(<option key={ts.id} value={ts.id}>{format(new Date(ts.startTime), "hh:mm a")} - {format(new Date(ts.endTime), "hh:mm a")}</option>))}
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
            <button type="button" className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition" onClick={onClose} disabled={modalLoading}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" disabled={modalLoading}>{modalLoading ? (mode==="add"?"Adding...":"Saving...") : (mode==="add"?"Add Routine":"Save Changes")}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 