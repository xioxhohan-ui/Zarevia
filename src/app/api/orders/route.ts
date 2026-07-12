import { NextResponse } from 'next/server';
import { readDB, writeDB, Order } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = readDB();
  // Return orders sorted by newest first
  const orders = [...(db.orders || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const db = readDB();
    const body = await request.json();

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress,
      district: body.district,
      shippingFee: Number(body.shippingFee),
      totalAmount: Number(body.totalAmount),
      items: body.items,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    db.orders.push(newOrder);
    writeDB(db);

    return NextResponse.json(newOrder);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const db = readDB();
    const body = await request.json();
    const { id, status } = body;

    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    db.orders[index].status = status;
    writeDB(db);

    return NextResponse.json(db.orders[index]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
