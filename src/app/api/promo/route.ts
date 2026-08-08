import { NextResponse } from "next/server";
import { findDiscountByCode } from "@/lib/discounts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = body?.code;

  if (typeof code !== "string" || code.length === 0) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const discount = findDiscountByCode(code.toUpperCase());

  if (!discount) {
    return NextResponse.json({ error: "invalid_code" }, { status: 404 });
  }

  return NextResponse.json(discount);
}
