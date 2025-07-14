import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout = ({ children, showSidebar = true }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setSidebarOpen(true)} />

      <div className="flex">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          className={`flex-1 ${
            showSidebar ? "lg:ml-64" : ""
          } transition-all duration-300`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
