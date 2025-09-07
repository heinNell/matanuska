// src/components/layout/Navigation.tsx
import React, { useContext, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Search, Settings, User, Menu } from "lucide-react";

/** Optional external context; falls back to mock if not provided */
interface SyncState { isOnline: boolean }
export const SyncContext = React.createContext<SyncState>({ isOnline: true });
const useSyncContext = () => useContext(SyncContext);

interface NavigationProps {
  /** Show a mobile hamburger that calls this when clicked */
  onToggleSidebar?: () => void;
  /** Optional unread notifications badge */
  unreadCount?: number;
  /** Called when the search form submits */
  onSearch?: (q: string) => void;
  /** Optional current user display name */
  userName?: string;
}

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  trips: "Trips",
  fleet: "Fleet",
  inventory: "Inventory",
  maintenance: "Maintenance",
  reports: "Reports",
  analytics: "Analytics",
  clients: "Clients",
  drivers: "Drivers",
  invoices: "Invoices",
  tyres: "Tyres",
  maps: "Maps",
  workshop: "Workshop",
};

const toTitle = (slug: string) =>
  labelMap[slug] ?? slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Navigation: React.FC<NavigationProps> = ({
  onToggleSidebar,
  unreadCount = 0,
  onSearch,
  userName = "Admin",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline } = useSyncContext();
  const [q, setQ] = useState("");

  // Build breadcrumb from URL
  const crumbs = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const acc: { path: string; label: string }[] = [];
    parts.forEach((p, idx) => {
      const path = "/" + parts.slice(0, idx + 1).join("/");
      acc.push({ path, label: toTitle(p) });
    });
    return acc;
  }, [location.pathname]);

  const activeSection = crumbs[0]?.label ?? "";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    onSearch?.(query);
    // Default behavior if no handler supplied: navigate to a search route
    if (!onSearch) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200 dark:bg-gray-900/70 dark:border-gray-800">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: Brand + Breadcrumb + Mobile menu */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile burger (hidden on lg; delegate to Sidebar if provided) */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <Link to="/" className="shrink-0 text-base font-bold text-blue-600 dark:text-blue-400">
            Matanuska
          </Link>

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="hidden md:flex items-center text-xs text-gray-500 dark:text-gray-400 ml-2 truncate"
          >
            {activeSection && <span className="truncate">/ {activeSection}</span>}
            {crumbs.slice(1).map((c) => (
              <span key={c.path} className="truncate">
                {" "}
                / {c.label}
              </span>
            ))}
          </nav>
        </div>

        {/* Middle: Search */}
        <div className="hidden md:flex flex-1 mx-4 max-w-xl">
          <form onSubmit={submitSearch} className="relative w-full">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-300" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search trips, units, drivers..."
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-2 py-2 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900"
              aria-label="Global search"
            />
          </form>
        </div>

        {/* Right: Status + Actions */}
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isOnline
                ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            }`}
            aria-label={isOnline ? "Online" : "Offline"}
            title={isOnline ? "Online" : "Offline"}
          >
            {isOnline ? "Online" : "Offline"}
          </span>

          <button
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-red-500 text-white text-[10px] leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <button
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="User menu"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
              <User className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-200">
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
