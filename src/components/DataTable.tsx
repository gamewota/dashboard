import React from "react";

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  error,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-infinity loading-xl text-warning"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="font-bold text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <td key={i}>{col.header}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const key =
              typeof rowKey === "function"
                ? rowKey(row, i)
                : rowKey
                ? String(row[rowKey])
                : i;

            return (
              <tr key={key}>
                {columns.map((col, j) => {
                  const value =
                    typeof col.accessor === "function"
                      ? col.accessor(row, i)
                      : (row[col.accessor] as React.ReactNode);
                  return <td key={j}>{value}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}