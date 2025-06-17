"use client";
import React, { useState, useEffect, useRef } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from 'papaparse';
import RoutineModal from '../../components/RoutineModal';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Move this function to the top-level so it is available to DraggableBlock
function handleSidebarBlockKeyDown(e: React.KeyboardEvent, block: any) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    if (block && block.id) {
      // openRoutineModal({ mode: 'edit', routine: block });
      console.log('Keyboard open modal for block:', block);
    }
  }
}

export default function RoutineBoard() {
  const [rooms, setRooms] = useState<{ id: string; number: string }[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ id: string; label: string }[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [routineModalMode, setRoutineModalMode] = useState<'add'|'edit'>('add');
  const [routineModalInitial, setRoutineModalInitial] = useState<any>({});
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [draggedRoutine, setDraggedRoutine] = useState<any>(null);
  const [showTrash, setShowTrash] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
    fetchTimeSlots();
    fetchCourses();
    fetchTeachers();
    fetchSections();
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [selectedDay]);

  async function fetchRooms() {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRooms(data.sort((a: any, b: any) => {
      const aNum = parseInt(a.number, 10);
      const bNum = parseInt(b.number, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.number.localeCompare(b.number);
    }));
  }
  async function fetchTimeSlots() {
    const res = await fetch("/api/time-slots");
    const data = await res.json();
    setTimeSlots(data.map((ts: any) => ({ id: ts.id, label: `${formatTime(ts.startTime)}-${formatTime(ts.endTime)}` })));
  }
  async function fetchRoutines() {
    setLoading(true);
    const res = await fetch(`/api/routines?dayOfWeek=${selectedDay}`);
    const data = await res.json();
    setRoutines(data);
    setLoading(false);
  }
  async function fetchCourses() {
    const res = await fetch("/api/courses");
    setCourses(await res.json());
  }
  async function fetchTeachers() {
    const res = await fetch("/api/teachers");
    setTeachers(await res.json());
  }
  async function fetchSections() {
    const res = await fetch("/api/sections");
    setSections(await res.json());
  }

  function formatTime(time: string) {
    let d;
    if (/^\d{4}-\d{2}-\d{2}T/.test(time)) {
      d = new Date(time);
    } else {
      d = new Date(`1970-01-01T${time}`);
    }
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function getRoutine(roomId: string, timeSlotId: string) {
    return routines.find(
      (r: any) => r.room?.id === roomId && r.timeSlot?.id === timeSlotId
    );
  }

  // Unified modal open function
  function openRoutineModal({ mode, roomId, timeSlotId, routine }: { mode: 'add' | 'edit', roomId?: string, timeSlotId?: string, routine?: any }) {
    setRoutineModalMode(mode);
    if (mode === 'add') {
      setRoutineModalInitial({
        roomId,
        timeSlotId,
        dayOfWeek: selectedDay,
        batchId: '',
        sectionId: '',
        courseId: '',
        teacherId: '',
      });
      setRoutineModalOpen(true);
    } else if (mode === 'edit' && routine) {
      const initial = {
        id: routine.id,
        courseId: routine.course?.id || '',
        teacherId: routine.teacher?.id || '',
        sectionId: routine.section?.id || '',
        roomId: routine.room?.id || '',
        timeSlotId: routine.timeSlot?.id || '',
        dayOfWeek: routine.dayOfWeek,
        batchId: routine.section?.batch?.id || '',
      };
      console.log('Setting modal initial values:', initial);
      setRoutineModalInitial(initial);
      setRoutineModalOpen(true);
    }
  }

  async function handleRoutineModalSubmit(form: any) {
    // Add or edit routine
    const body = {
      courseId: form.courseId,
      teacherId: form.teacherId,
      sectionId: form.sectionId,
      roomId: form.roomId,
      timeSlotId: form.timeSlotId,
      dayOfWeek: Number(form.dayOfWeek),
    };
    if (routineModalMode === 'add') {
      await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/routines/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    setRoutineModalOpen(false);
    fetchRoutines();
  }

  function handleDragStart(event: any) {
    const { active } = event;
    const routine = routines.find((r: any) => r.id === active.id);
    if (routine) {
      setDraggedRoutine(routine);
      setShowTrash(true);
    }
  }
  function handleDragEnd(event: any) {
    const { active, over } = event;
    setShowTrash(false);
    setDraggedRoutine(null);
    if (!over) return;
    if (over.id.startsWith('cell-')) {
      // Move assignment
      const [roomId, timeSlotId] = over.id.replace('cell-', '').split('_');
      if (active.id && (roomId && timeSlotId)) {
        const routine = routines.find((r: any) => r.id === active.id);
        if (routine && (routine.room.id !== roomId || routine.timeSlot.id !== timeSlotId || routine.dayOfWeek !== selectedDay)) {
          // Update routine
          fetch(`/api/routines/${routine.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: routine.course.id,
              teacherId: routine.teacher.id,
              sectionId: routine.section.id,
              roomId,
              timeSlotId,
              dayOfWeek: selectedDay
            })
          }).then(() => fetchRoutines());
        }
      }
    } else if (over.id === 'trash') {
      // Delete assignment
      if (active.id) {
        fetch(`/api/routines/${active.id}`, { method: 'DELETE' })
          .then(() => fetchRoutines());
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      {/* Day Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${selectedDay === i ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-900"}`}
          >
            {d}
          </button>
        ))}
      </div>
      {/* Board Grid */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="bg-indigo-700 text-white px-4 py-3 border text-left text-lg font-extrabold sticky left-0 z-10 shadow">Room</th>
                {timeSlots.map(ts => (
                  <th key={ts.id} className="bg-indigo-600 text-white px-4 py-3 border text-center text-lg font-bold shadow">{ts.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id}>
                  <td className="bg-indigo-100 text-indigo-900 px-4 py-3 border font-bold sticky left-0 z-10 shadow">{room.number}</td>
                  {timeSlots.map(ts => {
                    const routine = getRoutine(room.id, ts.id);
                    return (
                      <DroppableCell
                        key={ts.id}
                        id={`cell-${room.id}_${ts.id}`}
                        onClick={!routine ? () => openRoutineModal({ mode: 'add', roomId: room.id, timeSlotId: ts.id }) : undefined}
                      >
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                          {routine && (
                            <button
                              type="button"
                              className="absolute top-0 right-0 mt-2 mr-2 p-1 rounded-full bg-white shadow hover:bg-indigo-100 text-indigo-600 hover:text-indigo-900 transition z-20 ring-0 hover:ring-2 hover:ring-indigo-400"
                              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                              onClick={e => { e.stopPropagation(); console.log('Edit pencil clicked:', routine); openRoutineModal({ mode: 'edit', routine }); }}
                              title="Edit Routine"
                              tabIndex={0}
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                          )}
                          {routine ? (
                            <DraggableAssignment routine={routine}>
                              <div className="w-full bg-indigo-50 rounded-xl shadow-sm p-2 pt-6 flex flex-col items-center gap-1 transition hover:shadow-md">
                                <span className="font-bold text-indigo-800 text-sm text-center">{routine.course?.name}</span>
                                <span className="text-xs text-gray-600 text-center">{routine.teacher?.name}</span>
                                <span className="text-xs text-blue-700 font-semibold text-center whitespace-normal break-words" title={`Section: ${routine.section?.batch?.number}-${routine.section?.name}`}>{routine.section?.batch?.number}-{routine.section?.name}</span>
                              </div>
                            </DraggableAssignment>
                          ) : (
                            <div className="text-xs text-gray-400 italic">—</div>
                          )}
                        </div>
                      </DroppableCell>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-10">
              <span className="text-lg text-gray-700 font-semibold">Loading...</span>
            </div>
          )}
        </div>
        <DragOverlay>
          {draggedRoutine && (
            <div className="flex flex-col items-center gap-1 px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-lg">
              <span className="font-bold text-lg">{draggedRoutine.course?.name}</span>
              <span className="text-xs">{draggedRoutine.teacher?.name}</span>
              <span className="text-xs">Section: {draggedRoutine.section?.name}</span>
            </div>
          )}
        </DragOverlay>
        <TrashDropZone show={showTrash} />
      </DndContext>
      {/* Add/Edit Modal */}
      <RoutineModal
        open={routineModalOpen}
        mode={routineModalMode}
        initialValues={routineModalInitial}
        onSubmit={handleRoutineModalSubmit}
        onClose={() => setRoutineModalOpen(false)}
        routines={routines}
      />
    </div>
  );
}

function DraggableBlock({ block, keyboardDrag }: { block: any, keyboardDrag: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: block.id });
  const [showTooltip, setShowTooltip] = useState(false);
  const isKeyboardDragging = keyboardDrag && keyboardDrag.type === 'block' && keyboardDrag.id === block.id;
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`rounded-lg px-4 py-2 bg-indigo-500 text-white font-semibold shadow cursor-move transition relative outline-none ${isDragging ? 'opacity-50' : ''} ${isKeyboardDragging ? 'ring-4 ring-indigo-400' : ''}`}
      style={{ userSelect: 'none' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      tabIndex={0}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onKeyDown={e => handleSidebarBlockKeyDown(e, block)}
    >
      <div>{block.course}</div>
      <div className="text-xs text-indigo-100">{block.teacher}</div>
      <div className="text-xs text-indigo-100">Section: {block.section}</div>
      {showTooltip && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white border border-gray-300 shadow-lg rounded px-3 py-2 text-sm text-gray-900 z-30 whitespace-nowrap min-w-[180px]">
          <div><b>Course:</b> {block.course}</div>
          <div><b>Teacher:</b> {block.teacher}</div>
          <div><b>Section:</b> {block.section}</div>
        </div>
      )}
      {isKeyboardDragging && (
        <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow z-40">Picked up</div>
      )}
    </div>
  );
}

function DroppableCell({ id, children, onClick }: { id: string, children: React.ReactNode, onClick?: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <td
      ref={setNodeRef}
      className={`border px-4 py-2 text-center min-w-[7rem] h-20 align-top transition ${isOver ? 'bg-green-100' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </td>
  );
}

function DraggableAssignment({ routine, children }: { routine: any, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: routine.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-full h-full ${isDragging ? 'opacity-50' : ''}`}
      style={{ cursor: 'grab' }}
    >
      {children}
    </div>
  );
}

function TrashDropZone({ show }: { show: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'trash' });
  if (!show) return null;
  return (
    <div ref={setNodeRef} className={`fixed bottom-8 right-8 z-50 flex items-center justify-center w-24 h-24 rounded-full shadow-lg transition ${isOver ? 'bg-red-500' : 'bg-red-200'} border-4 border-red-400`}>
      <span className="text-4xl text-white">🗑️</span>
    </div>
  );
} 