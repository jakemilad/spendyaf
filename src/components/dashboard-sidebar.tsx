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
                // If the deleted statement was selected, clear the selection
                if(selectedStatement?.id === id) {
                    onStatementSelect(statements[0] || null)
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

            const updatedData = {...statement, file_name: newFileName}
            const success = await updateStatement(id, updatedData)

            if(success) {
                // Update the selected statement if it was the one that was edited
                if(selectedStatement?.id === id) {
                    onStatementSelect({...selectedStatement, file_name: newFileName})
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

    if (statements.length === 0) {
        return (
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold mb-8">Hi, {firstName}</h1>
                <div className="text-center py-12">
                    <h2 className="text-lg font-medium mb-2">No statements yet</h2>
                    <p className="text-gray-500 mb-4">Upload your first bank statement to get started</p>
                    <Button asChild variant="outline">
                        <Link href="/upload-statement">
                            <span className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Upload Statement
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <aside className="fixed left-0 min-h-[calc(100vh-3.5rem)] w-72 border-r bg-gray-150 dark:bg-[hsl(225,50%,2%)]">
            <div className="flex h-full flex-col">
                <div className="border-b p-4">
                    <h1 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {firstName}'s Statements
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {statements.map((statement) => (
                        <Card 
                            key={statement.id} 
                            className={cn(
                                "cursor-pointer mb-2 transition-colors hover:bg-accent",
                                selectedStatement?.id === statement.id && "bg-accent"
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

                <div className="border-t p-2">
                    <Button asChild className="w-full">
                        <Link href="/upload-statement">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Statement
                        </Link>
                    </Button>
                </div>
            </div>
        </aside>
    )
}