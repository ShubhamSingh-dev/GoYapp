import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/utils/helpers";
import {
  Home,
  Users,
  Calendar,
  Settings,
  Plus,
  Search,
  Clock,
  Star,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "rooms", label: "My Rooms", icon: Users, href: "/rooms" },
    { id: "scheduled", label: "Scheduled", icon: Calendar, href: "/scheduled" },
    { id: "recent", label: "Recent", icon: Clock, href: "/recent" },
    { id: "favorites", label: "Favorites", icon: Star, href: "/favorites" },
  ];

  const handleItemClick = (item: any) => {
    setActiveItem(item.id);
    router.push(item.href);
    onClose?.();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50",
          "lg:translate-x-0 lg:static lg:z-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <Button className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Search className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors",
                    activeItem === item.id
                      ? "bg-primary-50 text-primary-600 border-r-2 border-primary-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
