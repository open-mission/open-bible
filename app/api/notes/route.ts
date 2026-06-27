import { turso } from "@/lib/turso";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const { rows } = await turso.execute(
    "SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, userId, verseIds, content, createdAt, updatedAt } = body;

  if (!id || !userId || !verseIds || !content || !createdAt || !updatedAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await turso.execute(
    `INSERT OR REPLACE INTO notes (id, user_id, verse_ids, content, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, JSON.stringify(verseIds), content, createdAt, updatedAt]
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
    "DELETE FROM notes WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  return NextResponse.json({ success: true });
}
