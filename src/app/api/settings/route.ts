import { NextResponse } from 'next/server';
import { readDB, writeDB } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.settings);
}

export async function POST(request: Request) {
  try {
    const db = readDB();
    const body = await request.json();

    db.settings = {
      shopName: body.shopName ?? db.settings.shopName,
      announcement: body.announcement ?? db.settings.announcement,
      shippingFeeDhaka: body.shippingFeeDhaka !== undefined ? Number(body.shippingFeeDhaka) : db.settings.shippingFeeDhaka,
      shippingFeeOutside: body.shippingFeeOutside !== undefined ? Number(body.shippingFeeOutside) : db.settings.shippingFeeOutside,
    };

    writeDB(db);
    return NextResponse.json(db.settings);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
