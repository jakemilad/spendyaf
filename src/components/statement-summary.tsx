'use client'

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Trash2Icon, X } from "lucide-react"
import { useState } from "react"
import { deleteStatement, updateStatement } from "@/app/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Statement {
    id: string;
    file_name: string;
    created_at: string;
    data: any;
}

interface StatementSummaryProps {
    statements: Statement[]
}

export function StatementSummary({ statements }: StatementSummaryProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const router = useRouter();


    const handleDelete = async (e: React.MouseEvent, statement: Statement) => {
        e.stopPropagation();
        setIsDeleting(true);

        try {
            const success = await deleteStatement(statement.id);
            if (success) {
                toast.success('Statement deleted');
                router.refresh();
            } else {
                toast.error('Failed to delete statement');
            }
        } catch (error) {
            toast.error('An error occurred while deleting the statement');
        } finally {
            setIsDeleting(false);
        }
    }


    const handleEdit = async (updatedData: any) => {
        if (!selectedStatement) return;

        try {
            const success = await updateStatement(selectedStatement.id, updatedData);
            if (success) {
                toast.success('Statement updated');
                router.refresh();
                setSelectedStatement(null);
            } else {
                toast.error('Failed to update statement');
            }
        } catch (error) {
            toast.error('An error occurred while updating the statement');
        }
    }

    return (
        <>
            <Card className="w-80">
                <CardHeader>
                    <CardTitle>Your Statements</CardTitle>
                    <CardDescription>
                        {statements.length} statements uploaded
                    </CardDescription>
                </CardHeader>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                        {statements.map((statement, i) => (
                            <div key={i} className="flex items-center justify-between space-x-4 rounded-md border p-4"
                                onClick={() => setSelectedStatement(statement)}
                            >
                                <div>
                                    <p className="text-sm font-medium leading-none">{statement.file_name || `Statement ${i + 1}`}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(statement.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <Pencil className="h-4 w-4 text-muted-foreground" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStatement(statement);
                                    setIsEditing(true);
                                }}
                                />
                                <Trash2
                                className="h-4 w-4 text-muted-foreground"
                                onClick={(e) => handleDelete(e, statement)}
                                />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </Card>
            <Sheet open={!!selectedStatement} onOpenChange={() => {
                setSelectedStatement(null);
                setIsEditing(false);
            }}>
               <SheetContent className='w-[400px] sm:w-[500px]'>
                <SheetHeader>
                    <SheetTitle>
                        {selectedStatement?.file_name || 'Statement Details'}
                    </SheetTitle>
                    <SheetDescription>
                        Uploaded on {selectedStatement?.created_at && new Date(selectedStatement.created_at).toLocaleDateString()}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6">
                    {isEditing ? (
                        <div className="space-y-4">
                        <textarea
                          className="w-full h-[300px] p-2 text-sm font-mono bg-muted rounded-md"
                          value={JSON.stringify(selectedStatement?.data, null, 2)}
                          onChange={(e) => {
                            try {
                              const newData = JSON.parse(e.target.value)
                              setSelectedStatement(prev => prev ? {...prev, data: newData} : null)
                            } catch (error) {
                                toast.error('Invalid JSON');
                            }
                          }}
                        />
                    </div>
                    ) : (
                        <pre className="text-sm font-mono bg-muted rounded-md p-4">
                            {JSON.stringify(selectedStatement?.data, null, 2)}
                        </pre>
                    )}
                </div>
                <SheetFooter className="mt-4">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleEdit(selectedStatement?.data)
                    setIsEditing(false)
                  }}
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit Statement
              </Button>
            )}
          </SheetFooter>
               </SheetContent>
            </Sheet>
        </>
    )
}