import { NextResponse } from "next/server";
import { Test } from "../utils/openai_api";

export async function GET(request: Request) {
  const response = await Test("What is the capital of France?");
  return NextResponse.json({ response });
}

