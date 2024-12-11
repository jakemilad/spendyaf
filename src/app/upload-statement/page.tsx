"use client"
import { FileUpload } from "@/components/file-upload";
import { getUserStatements } from "../actions";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UploadStatement() {
    const { data: session } = useSession();
    const router = useRouter();
    const [statements, setStatements] = useState<any[]>([]);

    useEffect(() => {
        const fetchStatements = async () => {
            const newData = await getUserStatements();
            setStatements(newData || []);
        };
        fetchStatements();
    }, [session]);

    return (
        <div className="container mx-auto flex flex-col items-center justify-center max-w-7xl px-4 sm:px-6 lg:px-8">
            <FileUpload onUploadSuccess={async () => {
                router.push('/dashboard');
            }} />
            {statements.length > 0 && (
                <div className="mt-4">
                    <p>You have {statements.length} statements uploaded</p>
                </div>
            )}
        </div>
    )
}