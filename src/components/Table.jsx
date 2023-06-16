import React from "react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

const columns_qualified = [
  columnHelper.accessor("fullname", {
    header: (indicator) => `${indicator.toUpperCase()} Qualified Applicants`,
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
];

const columns_waitlisted = [
  columnHelper.accessor("priority", {
    header: (indicator) => "Priority #",
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("fullname", {
    header: (indicator) => `${indicator.toUpperCase()} Waitlisted Applicants`,
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
];

const columns_recommended = [
  columnHelper.accessor("fullname", {
    header: (indicator) => `${indicator.toUpperCase()} Recommended Applicants`,
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
];

export default function App({ dataset, course, status }) {
  const [data, setData] = React.useState(() => [...dataset]);
  const rerender = React.useReducer(() => ({}), {})[1];
  var course_name = "";
  var table = useReactTable({
    data,
    columns: {},
    getCoreRowModel: getCoreRowModel(),
  });

  switch (status) {
    case "qualified":
      table = useReactTable({
        data,
        columns: columns_qualified,
        getCoreRowModel: getCoreRowModel(),
      });
      break;
    case "waitlisted":
      table = useReactTable({
        data,
        columns: columns_waitlisted,
        getCoreRowModel: getCoreRowModel(),
      });
      break;
    case "recommended":
      table = useReactTable({
        data,
        columns: columns_recommended,
        getCoreRowModel: getCoreRowModel(),
      });
      break;
    default:
      table = useReactTable({
        data,
        columns: {},
        getCoreRowModel: getCoreRowModel(),
      });
      break;
  }

  switch (course) {
    case "bsit":
      course_name = "Bachelor of Science in Information Technology";
      break;
    case "bscs":
      course_name = "Bachelor of Science in Computer Science";
      break;
    case "bsis":
      course_name = "Bachelor of Science in Information Systems";
      break;
    case "bsemc":
      course_name =
        "Bachelor of Science in Entertainment and Multimedia Computing";
      break;
    case "blis":
      course_name = "Bachelor of Library and Information Science";
      break;
    default:
      var course_name = "";
      break;
  }

  return (
    <div className="p-2 text-sm max-w-md mx-auto">
      {/* <h2 className="text-lg font-bold mb-2">{course_name}</h2> */}
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className="p-2 border text-left" key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header(course),
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="border" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td className="border p-2" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
