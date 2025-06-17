"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { HomeIcon, BookOpenIcon, UserGroupIcon, BuildingLibraryIcon, ClockIcon, TableCellsIcon, ChartBarIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/courses", label: "Courses", icon: BookOpenIcon },
  { href: "/sections", label: "Sections", icon: TableCellsIcon },
  { href: "/teachers", label: "Teachers", icon: UserGroupIcon },
  { href: "/rooms", label: "Rooms", icon: BuildingLibraryIcon },
  { href: "/time-slots", label: "Time Slots", icon: ClockIcon },
  { href: "/routines", label: "Routines", icon: TableCellsIcon },
  { href: "/routines/board", label: "Routine Board", icon: TableCellsIcon },
  { href: "/reports", label: "Reports", icon: ChartBarIcon },
];

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { status } = useSession();

  // Only show navbar/sidebar if authenticated
  if (status !== "authenticated") {
    return <main className="flex-1 w-full px-0 py-8 transition-all duration-200"><div className="w-full">{children}</div></main>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed z-30 inset-y-0 left-0 w-64 bg-white shadow-lg border-r transition-transform duration-200 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0 md:static md:inset-0`}>
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">Routine</span>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-2">
          {navLinks.map(link => {
            const active = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-base transition ${active ? "bg-indigo-100 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        {/* Sign out button at the bottom */}
        <div className="absolute bottom-0 left-0 w-full px-6 py-5 border-t bg-white">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 justify-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
          >
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      {/* Mobile sidebar toggle */}
      <button className="fixed top-4 left-4 z-40 md:hidden bg-white border shadow rounded-full p-2" onClick={() => setSidebarOpen(v => !v)}>
        {sidebarOpen ? <XMarkIcon className="w-6 h-6 text-gray-700" /> : <Bars3Icon className="w-6 h-6 text-gray-700" />}
      </button>
      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 px-0 py-8 transition-all duration-200">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
} 