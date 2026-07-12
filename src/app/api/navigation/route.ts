import { NextResponse } from 'next/server';
import { readDB, writeDB, NavbarItem } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.navbar);
}

export async function POST(request: Request) {
  try {
    const db = readDB();
    const body = await request.json();

    const newItem: NavbarItem = {
      id: 'nav_' + Date.now(),
      label: body.label,
      url: body.url,
      order: body.order !== undefined ? Number(body.order) : db.navbar.length + 1,
    };

    db.navbar.push(newItem);
    writeDB(db);

    return NextResponse.json(newItem);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create navigation item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const db = readDB();
    const body = await request.json();
    const { id } = body;

    const index = db.navbar.findIndex((item) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Navigation item not found' }, { status: 404 });
    }

    db.navbar[index] = {
      ...db.navbar[index],
      label: body.label ?? db.navbar[index].label,
      url: body.url ?? db.navbar[index].url,
      order: body.order !== undefined ? Number(body.order) : db.navbar[index].order,
    };

    writeDB(db);
    return NextResponse.json(db.navbar[index]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update navigation item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Navigation ID required' }, { status: 400 });
    }

    const db = readDB();
    db.navbar = db.navbar.filter((item) => item.id !== id);
    writeDB(db);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete navigation item' }, { status: 500 });
  }
}
