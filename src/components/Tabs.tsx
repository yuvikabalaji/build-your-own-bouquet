"use client";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div className="flex gap-2 rounded-xl bg-white/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeId === tab.id
              ? "bg-gradient-to-r from-pink-300 to-purple-300 text-white shadow"
              : "text-purple-700 hover:bg-white/60"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
