"use client";

export interface SelectedItem {
  id: string;
  label: string;
  type: "flower" | "prop";
  quantity: number;
}

interface SelectedTrayProps {
  items: SelectedItem[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export function SelectedTray({
  items,
  onIncrement,
  onDecrement,
  onRemove,
}: SelectedTrayProps) {
  const total = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-purple-700">
        {total} selected
      </p>
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-white/60 p-2">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-purple-500">
            Add flowers or props from the picker
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-white/80 px-2 py-1"
            >
              <span className="truncate text-sm text-purple-800">
                {item.label} x{item.quantity}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDecrement(item.id)}
                  className="h-6 w-6 rounded-full bg-pink-200 text-purple-700 hover:bg-pink-300"
                >
                  −
                </button>
                <span className="min-w-[1.5rem] text-center text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onIncrement(item.id)}
                  className="h-6 w-6 rounded-full bg-pink-200 text-purple-700 hover:bg-pink-300"
                >
                  +
                </button>
                <button
                  onClick={() => onRemove(item.id)}
                  className="ml-1 text-xs text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
