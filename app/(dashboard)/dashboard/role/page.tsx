'use client'

import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    getCoreRowModel,
    ColumnDef,
    flexRender,
    useReactTable,
} from "@tanstack/react-table";
import { Pencil, Copy, Trash, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoleFormModal } from './component/RoleFormModal'
import { DeleteConfirmationModal } from './component/DeleteConfirmationModal'
import { useUser } from '@/lib/hooks/useUser';

interface Role {
    id: number
    name: string
    description: string
    userCount: number
}

export default function RolesPage() {
    const { user, isLoading: userLoading } = useUser();
    const [roles, setRoles] = useState<Role[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null)
    const [isViewOnly, setIsViewOnly] = useState(false)

    const fetchRoles = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/roles')
            if (!response.ok) {
                throw new Error('Failed to fetch roles')
            }
            const data = await response.json()
            setRoles(data)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRoles()
    }, [])

    const handleOpenModal = (role?: Role, viewOnly: boolean = false) => {
        setEditingRole(role || null)
        setIsViewOnly(viewOnly)
        setIsFormModalOpen(true)
    }

    const handleDelete = (roleId: number) => {
        setDeletingRoleId(roleId)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (deletingRoleId) {
            try {
                const response = await fetch(`/api/roles/${deletingRoleId}`, {
                    method: 'DELETE',
                })
                if (!response.ok) {
                    throw new Error('Failed to delete role')
                }
                await fetchRoles()
            } catch (error: any) {
                setError(error.message)
            } finally {
                setIsDeleteModalOpen(false)
                setDeletingRoleId(null)
            }
        }
    }

    const columns: ColumnDef<Role>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'description',
            header: 'Description',
        },
        {
            accessorKey: 'userCount',
            header: '# Users',
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const role = row.original
                return (
                    <div className="flex justify-between w-24">
                        {(user?.role?.toLowerCase() === 'author' || user?.role?.toLowerCase() === 'admin') && (
                            <Pencil
                                className="h-4 w-4 cursor-pointer"
                                onClick={() => handleOpenModal(role)}
                            />
                        )}
                        <Copy
                            className="h-4 w-4 cursor-pointer"
                            onClick={() => handleOpenModal(role, true)}
                        />
                        {user?.role?.toLowerCase() === 'admin' && (
                            <Trash
                                className="h-4 w-4 cursor-pointer"
                                onClick={() => handleDelete(role.id)}
                            />
                        )}
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: roles,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div className="container mx-auto py-10 w-full">
            {user?.role?.toLowerCase() === 'admin' && (
                <div className="flex justify-end mb-4">
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="h-4 mr-2 w-4 cursor-pointer" />
                        Add New Role
                    </Button>
                </div>
            )}

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

            <RoleFormModal
                isOpen={isFormModalOpen}
                onOpenChange={setIsFormModalOpen}
                role={editingRole}
                onSuccess={fetchRoles}
                isViewOnly={isViewOnly}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={confirmDelete}
            />
        </div>
    )
}