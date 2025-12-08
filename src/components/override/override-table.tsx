'use client'

import * as React from "react"
import { useState, useTransition, useEffect } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowData,
} from "@tanstack/react-table"
import { format, formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TooltipTrigger, TooltipProvider, Tooltip, TooltipContent } from "@/components/ui/tooltip"
import { ArrowUpDown, Save, Search } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Extend TableMeta to include our update function
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateOverride: (merchant: string, category: string) => void
    pendingChanges: Record<string, string>
    userCategories: string[]
  }
}

export type Override = {
  id: string | number
  merchant: string
  category: string
  created_at: string
  updated_at: string
}

// Editable Cell Component
const EditableCategoryCell = ({
  getValue,
  row,
  table,
}: {
  getValue: () => any
  row: any
  table: any
}) => {
  const initialValue = getValue()
  const merchant = row.original.merchant
  const pendingValue = table.options.meta?.pendingChanges?.[merchant]
  const [value, setValue] = useState(pendingValue ?? initialValue)
  const userCategories = table.options.meta?.userCategories || []

  useEffect(() => {
    setValue(pendingValue ?? initialValue)
  }, [pendingValue, initialValue])

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    if (newValue !== initialValue) {
        table.options.meta?.updateOverride(merchant, newValue)
    } else {
        table.options.meta?.updateOverride(merchant, initialValue)
    }
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger
        className={`h-10 min-w-[100px]${
          value !== initialValue ? "bg-orange-400/50 border-orange-800 dark:bg-yellow-50/50 dark:border-yellow-200" : ""
        }`}
      >
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        {userCategories.map((cat: string) => (
          <SelectItem key={cat} value={cat}>
            {cat}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const columns: ColumnDef<Override>[] = [
  {
    accessorKey: "merchant",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Merchant
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium ml-4">{row.getValue("merchant")}</div>,
    size: 400,
  },
  {
    accessorKey: "category",
    header: () => <div className="pl-2">Category</div>,
    cell: (props) => <div className="pl-2"><EditableCategoryCell {...props} /></div>,
    size: 300,
    maxSize: 400,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 hover:bg-transparent"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="text-right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground">
                {formatDistanceToNow(date, { addSuffix: true })}
              </span>
            </TooltipTrigger>
            <TooltipContent>{format(date, "PPP p")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </div>
      )
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"))
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground ml-4">
                {formatDistanceToNow(date, { addSuffix: true })}
              </span>
            </TooltipTrigger>
            <TooltipContent>{format(date, "PPP p")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    maxSize: 300,
  },
]

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  userCategories: string[]
}

export function OverrideDataTable<TData, TValue>({
  data,
  columns,
  userCategories,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({})
  const [isSaving, startTransition] = useTransition()
  const router = useRouter()

  const updateOverride = (merchant: string, category: string) => {
    setPendingChanges((prev) => {
      const originalRow = (data as any[]).find((row) => row.merchant === merchant)
      if (originalRow && originalRow.category === category) {
        const { [merchant]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [merchant]: category }
    })
  }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      updateOverride,
      pendingChanges,
      userCategories,
    },
  })

  const handleSaveChanges = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/overrides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ overrides: pendingChanges }),
        })

        const resData = await res.json()
        if (!res.ok || !resData?.success) {
          throw new Error(resData?.message || "Failed to apply overrides")
        }

        toast.success(`Successfully applied ${Object.keys(pendingChanges).length} overrides`)
        setPendingChanges({})
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unexpected error")
      }
    })
  }

  const hasChanges = Object.keys(pendingChanges).length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-center py-2">
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            placeholder="Filter merchants..."
            value={(table.getColumn("merchant")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("merchant")?.setFilterValue(event.target.value)
            }
            className="pl-9"
            />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="w-auto" style={{ width: header.getSize() }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
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
                    <TableCell key={cell.id} className="w-auto" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No overrides found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in">
          <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
            <span className="font-medium text-sm">
              {Object.keys(pendingChanges).length} unsaved changes
            </span>
            <div className="h-4 w-[1px] bg-background/20" />
            <Button
                size="sm"
                variant="secondary"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="h-8"
            >
                {isSaving ? "Saving..." : "Save Changes"}
                {!isSaving && <Save className="ml-2 h-3.5 w-3.5" />}
            </Button>
             <Button
                size="sm"
                variant="ghost"
                onClick={() => setPendingChanges({})}
                disabled={isSaving}
                className="h-8 hover:bg-background/20 hover:text-background"
            >
                Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
