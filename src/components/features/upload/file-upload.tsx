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
import { retryFetch } from "@/lib/retry";

interface FileUploadProps {
    onUploadSuccess: () => Promise<void>;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [fileName, setFileName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [retryAttempt, setRetryAttempt] = useState(0);

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
        setIsLoading(true);
        setError(null);
        setRetryAttempt(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);

        const result = await retryFetch('/api/amex', {
            method: 'POST',
            credentials: 'include', 
            body: formData,
        }, {
            maxRetries: 2, 
            baseDelay: 2000,
            backoffFactor: 1.5, 
            onRetry: (attempt, error) => {
                setRetryAttempt(attempt);
                toast.warning(`Processing failed, retrying... (Attempt ${attempt}/3)`);
                console.log(`Retry attempt ${attempt}:`, error.message);
            }
        });

        if (result.success) {
            try {
                const data = await result.data!.json();
                console.log(data);
                
                toast.success('Statement successfully uploaded');
                setFile(null);
                setFileName("");
                setRetryAttempt(0);
                
                await onUploadSuccess();
            } catch (error) {
                console.error('Error processing response:', error);
                const errorMessage = error instanceof Error ? error.message : 'Failed to process response';
                setError(`Upload succeeded but failed to process response: ${errorMessage}`);
                toast.error('Upload succeeded but failed to process response');
            }
        } else {
            const errorMessage = result.error?.message || 'Upload failed';
            setError(`Upload failed after ${result.attempts} attempts: ${errorMessage}`);
            toast.error(`Upload failed. ${result.attempts > 1 ? 'Tried multiple times.' : ''} Please try again.`);
        }

        setIsLoading(false);
    };

    return (
        <>
            <LoadingOverlay 
                isOpen={isLoading} 
                message={retryAttempt > 0 
                    ? `Processing your statement... (Attempt ${retryAttempt + 1}/3)` 
                    : "Processing your statement..."
                }
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