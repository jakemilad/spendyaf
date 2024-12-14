'use client'
import { cn } from "@/lib/utils"
import { DbStatement } from "@/app/types/types"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Settings, User, Pencil } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {format} from "date-fns"
import { deleteStatement, updateStatement } from "@/app/actions"
import { toast } from "sonner"


interface DashboardSidebarProps {
    statements: DbStatement[]
    selectedStatement: DbStatement | null
    onStatementSelect: (statement: DbStatement | null) => void
    userName: string
}

export function DashboardSidebar({ statements, selectedStatement, onStatementSelect, userName }: DashboardSidebarProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingFileName, setEditingFileName] = useState("")
    const pathname = usePathname()
    const firstName = userName.split(' ')[0]

    const navigation = [
        { name: 'Statements', href: '/dashboard', icon: FileText },
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Profile', href: '/profile', icon: User },
    ]

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true)
            const success = await deleteStatement(id)
            if(success) {
                if(selectedStatement?.id === id) {
                    const nextStatement = statements.find(s => s.id !== id) || null;
                    onStatementSelect(nextStatement)
                }
                toast.success('Statement deleted')
            } else {
                toast.error('Failed to delete statement')
            }
        } catch (error) {
            toast.error('An error occurred while deleting the statement')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleUpdate = async (id: string, newFileName: string) => {
        try {
            const statement = statements.find((s) => s.id === id)
            if(!statement) return

            const updatedData = {
                ...statement,
                file_name: newFileName,
                data: {
                    ...statement.data,
                    fileName: newFileName
                }
            }
            const success = await updateStatement(id, updatedData)

            if(success) {
                if(selectedStatement?.id === id) {
                    onStatementSelect({
                        ...selectedStatement,
                        file_name: newFileName,
                        data: {
                            ...selectedStatement.data,
                            fileName: newFileName
                        }
                    })
                }
                toast.success('Statement updated')
            } else {
                toast.error('Failed to update statement')
            }
        } catch (error) {
            toast.error('An error occurred while updating the statement')
        } finally {
            setIsEditing(false)
        }
    }

    return (
        <div className="h-full flex flex-col overflow-y-auto bg-background/50">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-4 px-4 text-lg font-semibold tracking-tight">
                        Hi, {firstName}
                    </h2>
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="px-3">
                    <div className="space-y-1">
                        <h2 className="px-4 text-lg font-semibold tracking-tight">Statements</h2>
                        <div className="mt-4 space-y-2">
                            {statements.map((statement) => (
                                <Card 
                                    key={statement.id}
                                    className={cn(
                                        "transition-colors hover:bg-accent cursor-pointer border-border/40",
                                        selectedStatement?.id === statement.id ? "bg-accent" : "bg-background"
                                    )}
                                    onClick={() => onStatementSelect(statement)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-base">{statement.file_name}</CardTitle>
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Sheet>
                                                    <SheetTrigger>
                                                        <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                                    </SheetTrigger>
                                                    <SheetContent side="left">
                                                        <SheetHeader>
                                                            <SheetTitle>Edit Statement</SheetTitle>
                                                            <SheetDescription>
                                                                Update your statement details or delete it.
                                                            </SheetDescription>
                                                        </SheetHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid gap-2">
                                                                <Label htmlFor="fileName">Statement Name</Label>
                                                                <Input
                                                                    id="fileName"
                                                                    defaultValue={statement.file_name}
                                                                    onChange={(e) => setEditingFileName(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-4 mt-4">
                                                            <SheetClose asChild>
                                                                <Button 
                                                                    variant="outline" 
                                                                    onClick={() => handleUpdate(
                                                                        statement.id, 
                                                                        editingFileName || statement.file_name
                                                                    )}
                                                                >
                                                                    Save Changes
                                                                </Button>
                                                            </SheetClose>
                                                            <Separator orientation="horizontal" />
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => {
                                                                    if(window.confirm('Are you sure you want to delete this statement?')) {
                                                                        handleDelete(statement.id)
                                                                    }
                                                                }}
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? 'Deleting...' : 'Delete Statement'}
                                                            </Button>
                                                        </div>
                                                    </SheetContent>
                                                </Sheet>
                                            </div>
                                        </div>
                                        <CardDescription>
                                            {format(new Date(statement.created_at), 'MMM d, yyyy')}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t p-2">
                    <Button asChild className="w-full">
                        <Link href="/upload-statement">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Statement
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}