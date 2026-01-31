import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { PictureInPicture } from "@/components/PictureInPicture";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import { useEffect } from "react";

/* ✅ IMPORTANT: SINGLE WS SERVICE */
import { wsService } from "@/services/ws";

const queryClient = new QueryClient();

/* ===============================
   PiP MODE DETECTION
   =============================== */
const isPip =
  new URLSearchParams(window.location.search).get("pip") === "true";

const WS_URL = "ws://127.0.0.1:8000/ws/live";

function AppContent() {
  const { shortcuts, isModalOpen, closeModal } = useKeyboardShortcuts();

  /* ===============================
     🔥 SINGLE WS INIT (ALL WINDOWS)
     =============================== */
  useEffect(() => {
    // Safe to call multiple times
    wsService.connect(WS_URL);

    // ❌ disconnect mat karo
    // Electron PiP renderer ko WS chahiye
  }, []);

  /* ===============================
     PiP WINDOW → SAME FRONTEND PiP
     =============================== */
  if (isPip) {
    return (
      <>
        <PictureInPicture />

        <Toaster />
        <Sonner
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(222, 47%, 8%)",
              border: "1px solid hsl(217, 33%, 18%)",
              color: "hsl(210, 40%, 96%)",
            },
          }}
        />
      </>
    );
  }

  /* ===============================
     NORMAL WINDOW → FULL DASHBOARD
     =============================== */
  return (
    <>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>

      {/* SAME PiP COMPONENT */}
      <PictureInPicture />

      <KeyboardShortcutsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        shortcuts={shortcuts}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
