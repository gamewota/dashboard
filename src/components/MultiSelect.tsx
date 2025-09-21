import { useState } from "react";

export type MultiSelectOption<T extends string | number> = {
  id: T;
  name: string;
  description?: string;
};

interface MultiSelectProps<T extends string | number> {
  options: MultiSelectOption<T>[];
  initialSelected?: T[];
  onAdd?: (id: T) => void | Promise<void>;
  onRemove?: (id: T) => void | Promise<void>;
  onSuccess?: (msg: string) => void;
  onFailure?: (err: unknown) => void;
  placeholder?: string;
  addButtonLabel?: string;
  emptyLabel?: string;
  formatAddMessage?: (option: MultiSelectOption<T>) => string;
  formatRemoveMessage?: (option: MultiSelectOption<T>) => string;
}



function MultiSelect<T extends string | number>({
  options,
  initialSelected = [],
  onAdd,
  onRemove,
  placeholder = "No items selected",
  addButtonLabel = "Add Item",
  emptyLabel = "All items added",
  formatAddMessage,
  formatRemoveMessage,
  onFailure,
  onSuccess
}: MultiSelectProps<T>) {
  const [selected, setSelected] = useState<T[]>(initialSelected);

const handleAdd = async (id: T) => {
  if (selected.includes(id)) return;
  setSelected((prev) => [...prev, id]);

  if (onAdd) {
    try {
      await onAdd(id);
      const option = options.find((o) => o.id === id);
      if (option) {
        const msg = formatAddMessage
          ? formatAddMessage(option)
          : `${option.name} added successfully`;
        onSuccess?.(msg);
      }
    } catch (err) {
      onFailure?.(err);
    }
  }
};

const handleRemove = async (id: T) => {
  setSelected((prev) => prev.filter((s) => s !== id));

  if (onRemove) {
    try {
      await onRemove(id);
      const option = options.find((o) => o.id === id);
      if (option) {
        const msg = formatRemoveMessage
          ? formatRemoveMessage(option)
          : `${option.name} removed successfully`;
        onSuccess?.(msg);
      }
    } catch (err) {
      onFailure?.(err);
    }
  }
};


  return (
    <div className="form-control w-full">
      {/* Selected items */}
      <div className="flex flex-wrap gap-2 border rounded-lg p-2 min-h-[44px]">
        {selected.length > 0 ? (
          selected.map((id) => {
            const option = options.find((o) => o.id === id);
            if (!option) return null;
            return (
              <div
                key={String(option.id)}
                className="badge badge-outline gap-2 px-3 py-2 flex items-center"
              >
                {option.name}
                <button
                  type="button"
                  onClick={() => handleRemove(option.id)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            );
          })
        ) : (
          <span className="text-sm text-gray-400">{placeholder}</span>
        )}
      </div>

      {/* Dropdown */}
      <div className="dropdown mt-2">
        <label tabIndex={0} className="btn btn-sm">
          {addButtonLabel}
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-60 z-10"
        >
          {options
            .filter((o) => !selected.includes(o.id))
            .map((o) => (
              <li key={String(o.id)}>
                <button
                  type="button"
                  onClick={() => handleAdd(o.id)}
                  title={o.description}
                >
                  {o.name}
                </button>
              </li>
            ))}
          {options.filter((o) => !selected.includes(o.id)).length === 0 && (
            <li className="text-gray-400 text-sm px-2 py-1">{emptyLabel}</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default MultiSelect