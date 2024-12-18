'use client'

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import {format} from "date-fns"
import { FileInput, Plus } from "lucide-react"
import { DbStatement } from "@/app/types/types"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteStatement, updateStatement } from "@/app/actions"
import { Pencil } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SummaryTable } from "@/components/summary-table"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider
} from '@/components/ui/sidebar'

interface DashboardContentProps {
  initialStatements: DbStatement[]
  userName: string
}

export function DashboardContent({ initialStatements, userName }: DashboardContentProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedStatement, setSelectedStatement] = useState<DbStatement | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingFileName, setEditingFileName] = useState("");
    const [statements, setStatements] = useState(initialStatements);
    const router = useRouter();


    const firstName = userName.split(' ')[0]


    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            const success = await deleteStatement(id);
            if(success) {
                setStatements(prev => prev.filter(statement => statement.id !== id));
                toast.success('Statement deleted');
            } else {
                toast.error('Failed to delete statement');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the statement');
        } finally {
            setIsDeleting(false);
        }
    }

    const handleUpdate = async (id: string, newFileName: string) => {
        try {
            const statement = statements.find((statement) => statement.id === id);
            if(!statement) return;

            const updatedData = {...statement, file_name: newFileName};
            const success = await updateStatement(id, updatedData);

            if(success) {
                setStatements(prev => prev.map(s => s.id === id ? {...s, file_name: newFileName} : s));
                toast.success('Statement updated');
            } else {
                toast.error('Failed to update statement');
            }
        } catch (error) {
            toast.error('An error occurred while updating the statement');
        } finally {
            setIsEditing(false);
        }
    };

  if (initialStatements.length === 0) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">Hi, {userName}</h1>
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
    <div className="mx-auto flex gap-6 max-w-7xl px-1 sm:px-1 lg:px-1">
      <div className="w-80 shrink-0">
        <div className="sticky top-4">
          <h1 className="text-2xl font-semibold mb-4">{firstName}'s Statements</h1>
          <div className="space-y-3">
            <ScrollArea className="w-full rounded-md border p-4">
              {statements.map((statement) => (
                <Card 
                  key={statement.id} 
                  className={`cursor-pointer hover:bg-gray-800 ${selectedStatement?.id === statement.id ? 'bg-gray-800' : ''}`}
                  onClick={() => setSelectedStatement(statement)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{statement.file_name}</CardTitle>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Sheet>
                          <SheetTrigger>
                            <Pencil className="h-3 w-3 text-muted-foreground hover:text-muted-foreground/80" />
                          </SheetTrigger>
                          <SheetContent side={"left"}>
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
                                  <Button variant="outline" onClick={() => handleUpdate(statement.id.toString(), editingFileName || statement.file_name)}>
                                      Save Changes
                                  </Button>
                              </SheetClose>
                              <Separator orientation="horizontal" />
                              <Button
                                  variant="destructive"
                                  onClick={() => {
                                      if(window.confirm('Are you sure you want to delete this statement?')) {
                                          handleDelete(statement.id.toString());
                                      }
                                  }}
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
            </ScrollArea>
          </div>
          <Button asChild className="w-full mt-4">
            <Link href="/upload-statement">
              <Plus className="h-4 w-4 mr-2" />
              Add Statement
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex-1">
        {selectedStatement ? (
          <SummaryTable statement={selectedStatement} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a statement to view its summary</p>
          </div>
        )}
      </div>
    </div>
  )
}
