"use client"

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Copy, Trash, Filter, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect, useCallback } from "react"
import { BlogFormModal } from './component/BlogFormModal';
import { DeleteConfirmationModal } from './component/DeleteConfirmationModal';
import { ShowContentModal } from './component/ShowContentModal';
import { useUser } from '@/lib/hooks/useUser';

type Blog = {
  id: string
  title: string
  slug: string
  content: string
  featureImage: string
  state: 'Unpublished' | 'Published'
}

export default function DataTableDemo() {
  const { user, isLoading: userLoading } = useUser();
  const [data, setData] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [filterColumn, setFilterColumn] = React.useState<string | null>('title');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyingBlogContent, setCopyingBlogContent] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/blogs');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch data');
        }

        setData(result.blogs);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const refreshData = async () => {
    try {
      const response = await fetch('/api/blogs');
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      setData(result.blogs);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleOpenModal = (blog: Blog | null = null) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleDelete = async (blogId: string) => {
    setDeletingBlogId(blogId);
    setIsDeleteModalOpen(true);
  };

  const handleCopy = (blog: Blog) => {
    setCopyingBlogContent(blog.content);
    setIsCopyModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingBlogId) {
      try {
        const response = await fetch(`/api/blogs/${deletingBlogId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete blog');
        }

        await refreshData();
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsDeleteModalOpen(false);
        setDeletingBlogId(null);
      }
    }
  };

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/blogs/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.imagePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }, []);

  const columns: ColumnDef<Blog>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="truncate max-w-[200px]" title={row.getValue("title")}>
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="truncate max-w-[200px]" title={row.getValue("slug")}>
          {row.getValue("slug")}
        </div>
      ),
    },
    {
      accessorKey: "featureImage",
      header: "Feature Image",
      cell: ({ row }) => (
        <div className="w-16 h-16">
          {row.getValue("featureImage") ? (
            <img
              src={row.getValue("featureImage")}
              alt="Feature"
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
              No image
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("state")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const blog = row.original;
        return (
          <div className="flex justify-between w-24">
            {(user?.role?.toLowerCase() === 'author' || user?.role?.toLowerCase() === 'admin') && (
              <Pencil
                className="h-4 w-4 cursor-pointer"
                onClick={() => handleOpenModal(blog)}
              />
            )}
            <Copy
              className="h-4 w-4 cursor-pointer"
              onClick={() => handleCopy(blog)}
            />
            {user?.role?.toLowerCase() === 'admin' && (
              <Trash
                className="h-4 w-4 cursor-pointer"
                onClick={() => handleDelete(blog.id)}
              />
            )}
          </div>
        );
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <BlogFormModal
        blog={editingBlog ? { ...editingBlog, content: editingBlog.content || '' } : null}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onBlogSubmitted={() => {
          refreshData();
          setEditingBlog(null);
        }}
        onImageUpload={handleImageUpload}
      />
      {(user?.role?.toLowerCase() === 'author' || user?.role?.toLowerCase() === 'admin') && (
        <div className="flex justify-end">
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 mr-2 w-4 cursor-pointer" />
            Create New Entry
          </Button>
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={confirmDelete}
      />

      <ShowContentModal
        isOpen={isCopyModalOpen}
        onOpenChange={setIsCopyModalOpen}
        content={copyingBlogContent}
      />

      <div className="flex items-center py-4">
        {filterColumn && (
          <Input
            placeholder={`Search by ${filterColumn}...`}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filterColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm ml-4"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-4">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {["title", "slug", "id", "state"].map((column) => (
              <DropdownMenuItem key={column} onClick={() => setFilterColumn(column)}>
                {column.charAt(0).toUpperCase() + column.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
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
      </div>
    </div>
  )
}