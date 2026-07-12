import { NextResponse } from 'next/server';
import { readDB, writeDB, Product } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.products);
}

export async function POST(request: Request) {
  try {
    const db = readDB();
    const body = await request.json();
    
    const newProduct: Product = {
      id: 'p_' + Date.now(),
      name: body.name,
      slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      description: body.description || '',
      collections: body.collections || [],
      sizes: body.sizes || [],
      colors: body.colors || [],
      images: body.images || ['/images/zeen-low-heel.jpg'],
      inStock: body.inStock !== undefined ? body.inStock : true,
      isBestSelling: body.isBestSelling || false,
      createdAt: new Date().toISOString(),
    };

    db.products.push(newProduct);
    writeDB(db);

    return NextResponse.json(newProduct);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const db = readDB();
    const body = await request.json();
    const { id } = body;

    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Generate new slug if name changed
    const originalName = db.products[index].name;
    const nameChanged = body.name && body.name !== originalName;
    const newSlug = nameChanged
      ? body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : db.products[index].slug;

    db.products[index] = {
      ...db.products[index],
      name: body.name ?? db.products[index].name,
      slug: newSlug,
      price: body.price !== undefined ? Number(body.price) : db.products[index].price,
      originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? Number(body.originalPrice) : undefined) : db.products[index].originalPrice,
      description: body.description ?? db.products[index].description,
      collections: body.collections ?? db.products[index].collections,
      sizes: body.sizes ?? db.products[index].sizes,
      colors: body.colors ?? db.products[index].colors,
      images: body.images ?? db.products[index].images,
      inStock: body.inStock !== undefined ? body.inStock : db.products[index].inStock,
      isBestSelling: body.isBestSelling !== undefined ? body.isBestSelling : db.products[index].isBestSelling,
    };

    writeDB(db);
    return NextResponse.json(db.products[index]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const db = readDB();
    const initialLength = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);

    if (db.products.length === initialLength) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    writeDB(db);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
