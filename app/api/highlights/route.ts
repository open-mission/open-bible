import { turso } from "@/lib/turso";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const { rows } = await turso.execute(
    "SELECT * FROM highlights WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, userId, versionId, verseId, color, customHex, createdAt } = body;

  if (!id || !userId || !verseId || !color || !createdAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await turso.execute(
    `INSERT OR REPLACE INTO highlights (id, user_id, version_id, verse_id, color, custom_hex, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, versionId || null, verseId, color, customHex || null, createdAt]
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const userId = request.nextUrl.searchParams.get("userId");

  if (!id || !userId) {
    return NextResponse.json({ error: "id and userId required" }, { status: 400 });
  }

  await turso.execute(
    "DELETE FROM highlights WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  return NextResponse.json({ success: true });
}
