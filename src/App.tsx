/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import AboutView from "./components/AboutView";
import PriceView from "./components/PriceView";
import ContactView from "./components/ContactView";

// Import Workspace layout and views
import WorkspaceLayout from "./components/WorkspaceLayout";
import WorkspaceDashboard from "./components/WorkspaceDashboard";
import WorkspaceAIAssistant from "./components/WorkspaceAIAssistant";
import WorkspaceCalendar from "./components/WorkspaceCalendar";
import WorkspaceKanban from "./components/WorkspaceKanban";
import WorkspaceNotes from "./components/WorkspaceNotes";
import WorkspaceWhiteboard from "./components/WorkspaceWhiteboard";
import WorkspaceSpaces from "./components/WorkspaceSpaces";
import WorkspaceTemplateBuilder from "./components/WorkspaceTemplateBuilder";
import WorkspaceSettings from "./components/WorkspaceSettings";
import WorkspaceApps from "./components/WorkspaceApps";

import { RouterProvider, Route, useRouter } from "./components/Router";

function AppContent() {
  const { currentPath } = useRouter();

  // List of paths that belong to the premium Workspace app
  const workspacePaths = [
    "/dashboard",
    "/ai-assistant",
    "/calendar",
    "/kanban",
    "/notes",
    "/whiteboard",
    "/spaces",
    "/template-builder",
    "/settings",
    "/apps"
  ];

  const isWorkspace = workspacePaths.includes(currentPath);

  if (isWorkspace) {
    return (
      <WorkspaceLayout>
        <Route path="/dashboard" element={<WorkspaceDashboard />} />
        <Route path="/ai-assistant" element={<WorkspaceAIAssistant />} />
        <Route path="/calendar" element={<WorkspaceCalendar />} />
        <Route path="/kanban" element={<WorkspaceKanban />} />
        <Route path="/notes" element={<WorkspaceNotes />} />
        <Route path="/whiteboard" element={<WorkspaceWhiteboard />} />
        <Route path="/spaces" element={<WorkspaceSpaces />} />
        <Route path="/template-builder" element={<WorkspaceTemplateBuilder />} />
        <Route path="/settings" element={<WorkspaceSettings />} />
        <Route path="/apps" element={<WorkspaceApps />} />
      </WorkspaceLayout>
    );
  }

  // Render Marketing Site Layout by default for marketing paths
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221C18] flex flex-col antialiased selection:bg-[#FAF2EC] selection:text-[#c67f43]">
      <Header />
      <main className="flex-grow">
        {/* Home Route */}
        <Route
          path="/home"
          element={
            <>
              <Hero />
              <Features />
              <Pricing />
              <CTA />
            </>
          }
        />

        {/* About Route */}
        <Route path="/about" element={<AboutView />} />

        {/* Dedicated Pricing Route */}
        <Route path="/price" element={<PriceView />} />

        {/* Contact Route */}
        <Route path="/contact" element={<ContactView />} />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
