'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { FileText } from "lucide-react"

interface DashSidebarProps {
    statements: Record<string, any>[]
    onStatementSelect: (statement: Record<string, any>) => void
}

export function DashSidebar({statements, onStatementSelect}: DashSidebarProps) {
    return(
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Statements</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        {statements.map((statement) => (
                            <SidebarMenuItem key={statement.id}>
                                <SidebarMenuButton 
                                    onClick={() => onStatementSelect(statement)}
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>{statement.file_name}</span>
                                    <span>{new Date(statement.created_at).toLocaleDateString()}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}