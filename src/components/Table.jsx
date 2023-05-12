import React from "react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('name', {
    header: ()=> 'Qualified Applicant',
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('time', {
    header: () => 'Time',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('room', {
    header: () => 'Room Assignment',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('day', {
    header: () => 'Date',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
]

export default function App({dataset}) {
  const [data, setData] = React.useState(() => [...dataset])
  const rerender = React.useReducer(() => ({}), {})[1]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-2 text-sm">
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th className="p-2 border text-left" key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr className="border" key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td className="border p-2" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}