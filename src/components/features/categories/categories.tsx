'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/loading/loading-overlay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { updateUserCategories, reprocessStatement } from "../../../app/actions";
import { MotionWrapper } from "../../animations/motion-wrapper";
import { useRouter } from "next/navigation";
import { CategoryBudgetMap, DbStatement } from "@/app/types/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CategoryBudgetManager } from "./category-budget-manager";

interface CategoriesProps {
    initialCategories: string[]
    statements: DbStatement[]
    initialBudgets: CategoryBudgetMap
}

export default function Categories({ initialCategories, statements, initialBudgets }: CategoriesProps) {
    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [newCategory, setNewCategory] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [tempCategories, setTempCategories] = useState<string[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [allowManualCategories, setAllowManualCategories] = useState(false);
    const [showWarningDialog, setShowWarningDialog] = useState(false);

    const router = useRouter();

    const handleAddCategory = () => {
        if(!newCategory.trim()) return;
        const trimmedCategory = newCategory.trim();
        
        if (categories.some(cat => cat.toLowerCase() === trimmedCategory.toLowerCase())) {
            toast.error('This category already exists');
            return;
        }
        
        setCategories([...categories, trimmedCategory]);
        setNewCategory('');
    }

    const handleRemoveCategory = (index: number) => {
        setCategories(categories.filter((_, i) => i !== index));
    }

    const handleSaveClick = () => {
        setTempCategories(categories);;
        setShowConfirmDialog(true);
    }

    const handleSave = async () => {
        setIsProcessing(true);
        try {
            const success = await updateUserCategories(categories);
            if(!success) {
                throw new Error('Failed to update categories');
            }
            
            if(statements && statements.length > 0) {
                toast.info('Reprocessing all statements with new categories');
                for (const statement of statements) {
                    await reprocessStatement(statement.id);
                }
                toast.success('Categories updated and statements reprocessed');
            } else {
                toast.success('Categories updated successfully');
            }
        } catch (error) {
            toast.error('Failed to update categories');
            setCategories(tempCategories);
        } finally {
            setIsProcessing(false);
            setShowConfirmDialog(false);
            router.push('/dashboard');
        }
    }

    const handleManualToggle = (checked: boolean) => {
        if (checked) {
            setShowWarningDialog(true);
        } else {
            setAllowManualCategories(false);
        }
    }

    return (
        <>
        <LoadingOverlay 
            isOpen={isProcessing}
            message="Updating categories and reprocessing statements..."
        />
        <MotionWrapper animation="fadeInUp" delay={0.1}> 
            <Card className="w-full max-w-2xl mx-auto mt-6">
                <CardHeader>
                    <CardTitle>Manage Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={allowManualCategories}
                                onCheckedChange={handleManualToggle}
                            />
                            <Label>Enable manual category management</Label>
                        </div>

                        {allowManualCategories ? (
                            <>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add New Category"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleAddCategory}>Add Category</Button>
                                </div>

                                <div className="space-y-2">
                                    {categories.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            No categories added yet. Uploading your statement will generate categories.
                                        </p>
                                    ) : (
                                        categories.map((category) => (
                                            <div
                                                key={category}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <span className="font-medium">{category}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveCategory(categories.indexOf(category))}
                                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground text-center py-4">
                                Upload your statement to automatically generate AI-powered categories. Enable manual management above to add your own categories.
                            </p>
                        )}

                        <div className="pt-4">
                            <Button 
                                onClick={handleSaveClick} 
                                className="w-full"
                                variant="default"
                                size="lg"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </MotionWrapper>
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>

                <AlertDialogTitle>
                    You sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {statements && statements.length > 0 
                        ? "This will update your categories and reprocess your statements. This process may take a few minutes depending on the number of statements."
                        : "This will update your categories for future statement uploads."
                    }
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Manual Category Management
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        By enabling manual category management, the AI will no longer automatically generate categories for your statements. You will be responsible for creating and managing all categories. Are you sure you want to proceed?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowWarningDialog(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        setAllowManualCategories(true);
                        setShowWarningDialog(false);
                    }}>
                        Enable Manual Management
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <MotionWrapper animation="fadeInUp" delay={0.2}>
            <CategoryBudgetManager categories={categories} initialBudgets={initialBudgets} />
        </MotionWrapper>
        </>
    )
}
