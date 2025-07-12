import { useState } from "react"
import { useNavigate, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/ui/Sidebar"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/utils"

export default function Dashboard() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const onLogout = () => {
    logout()
    navigate("/")
  }

  const sidebarItems = [
    { name: "Review", href: "/dashboard", icon: "FileText" },
    { name: "History", href: "/dashboard/history", icon: "Clock" },
    { name: "Settings", href: "/dashboard/settings", icon: "User" },
    { name: "Upgrade", href: "/dashboard/upgrade", icon: "CreditCard" },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        items={sidebarItems}
        onLogout={onLogout} // ✅ Added to match the Sidebar API
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>

          <Button
            variant="ghost"
            className="flex gap-2 text-red-500 hover:text-red-700"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
