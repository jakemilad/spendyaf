'use client'

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner"
import { LoadingOverlay } from "@/components/loading/loading-overlay";

interface FileUploadProps {
    onUploadSuccess: () => Promise<void>;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
                alert('Please upload a CSV file');
                return;
            }
            
            setFile(selectedFile);
            setFileName(selectedFile.name.toLowerCase().replace(/\.csv$/i, '').trim());
            setShowDialog(true);
        }
    };

    const handleUpload = async () => {
        if (!file || !fileName.trim()) {
            setError('Please provide both a file and a name');
            return;
        }

        setShowDialog(false);
        try {
            setIsLoading(true);
            setError(null);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', fileName);

            const response = await fetch('/api/amex', {
                method: 'POST',
                credentials: 'include', 
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const data = await response.json();
            console.log(data);
            await onUploadSuccess();
            toast.success('Statement successfully uploaded')
            setFile(null);
            setFileName("");
            setShowDialog(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Upload failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <LoadingOverlay 
                isOpen={isLoading} 
                message="Uploading your statement..."
            />
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-full">
                            <input
                                type="file"
                                id="file"
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            <label
                                htmlFor="file"
                                className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-background hover:bg-accent/50 transition-colors duration-200 ease-in-out"
                            >
                                <div className="flex flex-col items-center justify-center space-y-4 p-6 text-center">
                                    <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                                        <Upload className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-medium text-base">
                                            {file ? file.name : 'Drop your CSV file here'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            or click to browse from your computer
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>
                        {error && (
                            <div className="text-destructive text-sm bg-destructive/10 px-4 py-2 rounded-md w-full text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Name your statement</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpload}>
                            Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}