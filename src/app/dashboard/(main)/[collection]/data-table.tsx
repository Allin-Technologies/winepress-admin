"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Registration, Testimony, NewConvert } from "@/schema/entities";
import { regColumns, new_convertColumns, testimonyColumns } from "./columns";
import { Portal } from "@/components/ui/portal";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { getCollectionList } from "@/actions/admin/collection";
import { filterTimeline } from "@/lib/tabel-timeline";
import { Loader } from "lucide-react";

interface RegistrationsTableProps {
  collection: "registration" | "testimony" | "new-convert";
  defaultData: Array<Registration | Testimony | NewConvert>;
  defaultPagination: PaginationState;
}

export function CollectionTable({
  collection,
  defaultData: _defaultData,
  defaultPagination,
}: RegistrationsTableProps) {
  const columns: any =
    collection === "registration"
      ? regColumns
      : collection === "testimony"
      ? testimonyColumns
      : new_convertColumns;

  const searchParams = useSearchParams();

  const search = searchParams.get("search");
  const country = searchParams.get("country");
  const state = searchParams.get("state");

  const [pagination, setPagination] =
    React.useState<PaginationState>(defaultPagination);

  const dataQuery = useQuery({
    queryKey: [collection, pagination, search, country, state],
    queryFn: () =>
      getCollectionList({
        collection,
        pagination,
      }),
    placeholderData: keepPreviousData, // don't have 0 rows flash while changing pages/loading next page
  });

  const defaultData = React.useMemo(() => _defaultData, [_defaultData]);

  const table = useReactTable({
    data: dataQuery.data?.data?.items ?? defaultData,
    // pageCount: dataQuery.data?.data. ?? -1,
    rowCount: dataQuery.data?.data?.total ?? 0,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  return (
    <div className='space-y-5 flex flex-col flex-1'>
      <Portal targetId='table___timeline__' className='flex gap-3 item-center'>
        {dataQuery?.isFetching && (
          <Loader className='size-4 text-gray-400 animate-spin' />
        )}
        <span className='leading-none'>
          {filterTimeline(dataQuery?.data?.data?.items ?? [])}
        </span>
      </Portal>
      <div className='rounded-xl overflow-clip flex-1'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-56 text-center'
                >
                  {dataQuery?.isFetching ? (
                    <Loader className='size-4 mx-auto text-gray-100 animate-spin' />
                  ) : (
                    "No results."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div className='flex justify-between items-center'>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium text-gray-50'>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className='flex items-center justify-end space-x-3 py-4'>
          <Button
            variant='outline'
            className='text-[#344054] rounded-xl disabled:opacity-40'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='size-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18'
              />
            </svg>

            <span>Previous</span>
          </Button>
          <Button
            variant='outline'
            className='text-[#344054] rounded-xl disabled:opacity-40'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span>Next</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='size-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3'
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
