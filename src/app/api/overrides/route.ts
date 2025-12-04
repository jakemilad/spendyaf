import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth.config";
import { applyAllOverrides, reprocessStatementsAfterOverride } from "@/app/overrides/actions";

type OverridesPayload = { overrides?: Record<string, string> };

function validateOverrides(payload: OverridesPayload): Record<string, string> | null {
    if (!payload || typeof payload !== "object") return null;
    if (!payload.overrides || Array.isArray(payload.overrides)) return null;

    const entries = Object.entries(payload.overrides);
    if (entries.length === 0) return null;

    const validated: Record<string, string> = {};
    for (const [merchant, category] of entries) {
        if (typeof merchant !== "string" || merchant.trim() === "") return null;
        if (typeof category !== "string" || category.trim() === "") return null;
        validated[merchant.trim()] = category.trim();
    }

    return validated;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email;
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let overrides: Record<string, string> | null = null;
    try {
        const body = (await request.json()) as OverridesPayload;
        overrides = validateOverrides(body);
    } catch {
        return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    if (!overrides) {
        return NextResponse.json({ success: false, message: "Invalid overrides payload" }, { status: 400 });
    }

    const overrideResult = await applyAllOverrides(userId,overrides);
    if (!overrideResult?.success) {
        return NextResponse.json(overrideResult ?? { success: false, message: "Failed to apply overrides" }, { status: 500 });
    }

    const reprocessResult = await reprocessStatementsAfterOverride(userId, overrides);

    return NextResponse.json({
        success: true,
        overridesApplied: overrideResult.overridesApplied,
        reprocess: reprocessResult,
    });
}
