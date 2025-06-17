// @ts-nocheck
import React from "react";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function RoutineCalendar({ routines, timeSlots }) {
  // Map: { [dayOfWeek]: { [timeSlotId]: routine } }
  const routineMap = {};
  routines.forEach(r => {
    if (!routineMap[r.dayOfWeek]) routineMap[r.dayOfWeek] = {};
    routineMap[r.dayOfWeek][r.timeSlot.id] = r;
  });

  return (
    <div className="w-full">
      <div className="w-full">
        <table className="w-full border rounded-lg bg-white table-fixed">
          <thead>
            <tr>
              <th className="border-b bg-gray-100 px-2 py-2 text-left text-gray-900 w-24 min-w-[80px]">Time Slot</th>
              {days.map((d, i) => (
                <th key={i} className="border-b bg-gray-100 px-2 py-2 text-center text-gray-900 w-1/7 min-w-[100px]">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(ts => (
              <tr key={ts.id}>
                <td className="border-b px-2 py-2 text-gray-900 text-sm font-semibold">
                  {new Date(ts.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ts.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                {days.map((_, dayIdx) => {
                  const routine = routineMap[dayIdx]?.[ts.id];
                  return (
                    <td key={dayIdx} className="border-b px-1 py-1 text-center align-top">
                      {routine ? (
                        <div className="rounded-lg px-2 py-1 bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-900 shadow text-xs flex flex-col items-center gap-0.5 border border-indigo-200 hover:shadow-lg transition cursor-pointer relative group w-full">
                          <span className="font-bold text-sm text-indigo-700 tracking-wide">{routine.course.code}</span>
                          <span className="text-xs text-gray-700 font-semibold">{routine.teacher.initial}</span>
                          <span className="text-xs text-blue-700 font-semibold">{routine.room.number}</span>
                          {/* Tooltip on hover */}
                          <div className="absolute z-30 left-1/2 top-full mt-2 -translate-x-1/2 w-64 max-w-xs bg-white border border-indigo-300 rounded-xl shadow-2xl p-4 text-sm text-left opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 drop-shadow-lg">
                            <div className="h-1 w-full rounded-t-xl bg-gradient-to-r from-indigo-500 to-blue-500 mb-2"></div>
                            <div className="mb-1"><span className="font-bold text-indigo-700">{routine.course.name}</span> <span className="text-xs text-gray-500">({routine.course.code})</span></div>
                            <div className="mb-1"><b>Teacher:</b> <span className="text-gray-800">{routine.teacher.name}</span> <span className="text-xs text-gray-500">({routine.teacher.initial})</span></div>
                            <div className="mb-1"><b>Section:</b> <span className="text-gray-800">{routine.section.batch?.number}-{routine.section.name}</span></div>
                            <div className="mb-1"><b>Room:</b> <span className="text-blue-700 font-semibold">{routine.room.number}</span></div>
                            <div><b>Time:</b> {new Date(routine.timeSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(routine.timeSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 