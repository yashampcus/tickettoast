"use client";

import { DocumentUpload } from "@/components/DocumentUpload";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconHistory, IconUpload } from "@tabler/icons-react";
import { Ticket, FileText, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface HistoryItem {
  id: string;
  timestamp: number;
  result?: any;
  aiAppeal?: any;
  formFill?: any;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<"home" | "history">("home");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const loadHistory = () => {
      const items: HistoryItem[] = [];

      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("tickettoast-history-")) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || "{}");
            items.push(item);
          } catch (e) {
            console.error("Failed to parse history item:", e);
          }
        }
      }

      // Sort by timestamp descending (newest first)
      items.sort((a, b) => b.timestamp - a.timestamp);
      setHistoryItems(items);
    };

    loadHistory();

    // Listen for storage events to update history
    window.addEventListener("storage", loadHistory);
    return () => window.removeEventListener("storage", loadHistory);
  }, []);

  const navItems = [
    {
      name: "Home",
      link: "#",
      icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
      onClick: () => setCurrentView("home"),
    },
    {
      name: "History",
      link: "#",
      icon: (
        <IconHistory className="h-4 w-4 text-neutral-500 dark:text-white" />
      ),
      onClick: () => setCurrentView("history"),
    },
  ];

  const deleteHistoryItem = (id: string) => {
    localStorage.removeItem(`tickettoast-history-${id}`);
    setHistoryItems((items) => items.filter((item) => item.id !== id));
  };

  const clearAllHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      historyItems.forEach((item) => {
        localStorage.removeItem(`tickettoast-history-${item.id}`);
      });
      setHistoryItems([]);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    // Save to current session
    if (item.result) {
      localStorage.setItem("tickettoast-result", JSON.stringify(item.result));
    }
    if (item.aiAppeal) {
      localStorage.setItem(
        "tickettoast-ai-appeal",
        JSON.stringify(item.aiAppeal),
      );
    }
    if (item.formFill) {
      localStorage.setItem(
        "tickettoast-form-fill",
        JSON.stringify(item.formFill),
      );
    }

    // Switch to home view
    setCurrentView("home");

    // Trigger custom event to notify DocumentUpload to reload
    window.dispatchEvent(new Event("historyLoaded"));
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-orange-300 to-red-300">
      <FloatingNav navItems={navItems} />

      <div className="container mx-auto px-4 py-8 pt-32">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ticket className="w-10 h-10 text-gray-900" />
            <h1 className="text-5xl font-bold text-gray-900">Ticket Toast</h1>
          </div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
            {currentView === "home"
              ? "Upload parking citations to extract information and generate AI appeals"
              : "View your previously processed documents and appeals"}
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          {currentView === "home" ? (
            <DocumentUpload />
          ) : (
            <div className="space-y-6">
              {/* History Header */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-gray-900" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Processing History
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {historyItems.length}{" "}
                        {historyItems.length === 1 ? "item" : "items"} saved
                      </p>
                    </div>
                  </div>
                  {historyItems.length > 0 && (
                    <button
                      onClick={clearAllHistory}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Clear All History
                    </button>
                  )}
                </div>
              </div>

              {/* History Items */}
              {historyItems.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
                  <IconHistory className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No History Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Process a document to see it appear here
                  </p>
                  <button
                    onClick={() => setCurrentView("home")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {new Date(item.timestamp).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(item.timestamp).toLocaleTimeString(
                              "en-US",
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadHistoryItem(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteHistoryItem(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="grid grid-cols-3 gap-4">
                        {item.result && (
                          <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-500">
                            <p className="text-xs text-gray-600 font-medium mb-1">
                              Document Processed
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.result.extractedFields?.length || 0} fields
                              extracted
                            </p>
                          </div>
                        )}
                        {item.aiAppeal && (
                          <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-500">
                            <p className="text-xs text-gray-600 font-medium mb-1">
                              AI Appeal Generated
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              Score: {item.aiAppeal.review?.score || "N/A"}
                            </p>
                          </div>
                        )}
                        {item.formFill && (
                          <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                            <p className="text-xs text-gray-600 font-medium mb-1">
                              Form Filled
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.formFill.filledFields?.length || 0} fields
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
