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
import { LoadingOverlay } from "@/components/loading-overlay";

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
            <Card className="w-full max-w-md mx-auto mt-10">
                <CardHeader className="text-center">
                    <CardTitle>Upload your transactions</CardTitle>
                    <CardDescription>
                        Choose a file to upload your transaction data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-full max-w-xs">
                            <input
                                type="file"
                                id="file"
                                onChange={handleFileChange}
                                accept=".csv"
                                className="hidden"
                            />
                            <label
                                htmlFor="file"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        {file ? file.name : 'Drop your file here or click to upload'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        CSV files only
                                    </p>
                                </div>
                            </label>
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm mt-2">
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