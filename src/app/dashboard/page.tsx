import { prisma } from "@/lib/prisma";
import { BookOpenIcon, UserGroupIcon, BuildingLibraryIcon, TableCellsIcon, PlusIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

async function getStats() {
  const [courses, teachers, rooms, routines] = await Promise.all([
    prisma.course.count(),
    prisma.teacher.count(),
    prisma.room.count(),
    prisma.routine.count(),
  ]);

  return {
    courses,
    teachers,
    rooms,
    routines,
  };
}

const cards = [
  {
    label: "Courses",
    icon: BookOpenIcon,
    color: "from-indigo-500 to-blue-600",
    href: "/courses",
    statKey: "courses",
    action: "Add Course",
    actionHref: "/courses",
  },
  {
    label: "Teachers",
    icon: UserGroupIcon,
    color: "from-pink-500 to-rose-500",
    href: "/teachers",
    statKey: "teachers",
    action: "Add Teacher",
    actionHref: "/teachers",
  },
  {
    label: "Rooms",
    icon: BuildingLibraryIcon,
    color: "from-green-500 to-emerald-500",
    href: "/rooms",
    statKey: "rooms",
    action: "Add Room",
    actionHref: "/rooms",
  },
  {
    label: "Routines",
    icon: TableCellsIcon,
    color: "from-yellow-500 to-orange-500",
    href: "/routines",
    statKey: "routines",
    action: "View Routines",
    actionHref: "/routines",
  },
];

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm border">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome to UniRoutine</h1>
          <p className="text-lg text-gray-700 max-w-2xl">Easily manage your university's class schedules, teachers, rooms, and more. Get started by exploring the sections below or adding new data.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/routines" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:from-indigo-600 hover:to-blue-700 transition">
            Go to Routines <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link href="/courses" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-semibold shadow hover:bg-indigo-50 transition">
            Add Course <PlusIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} shadow-lg p-1 transition-transform hover:-translate-y-1 focus-within:-translate-y-1`}>
              <div className="flex flex-col h-full bg-white/80 backdrop-blur p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center justify-center rounded-full bg-white shadow w-12 h-12`}>
                    <Icon className="w-7 h-7 text-indigo-500 group-hover:scale-110 transition-transform" />
                  </span>
                  <span className="text-lg font-bold text-gray-900">{card.label}</span>
                </div>
                <div className="flex-1 flex items-end">
                  <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{stats[card.statKey as keyof typeof stats]}</span>
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <Link href={card.href} className="text-indigo-600 font-medium hover:underline">View All</Link>
                  <Link href={card.actionHref} className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition">
                    <PlusIcon className="w-4 h-4" /> {card.action}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 