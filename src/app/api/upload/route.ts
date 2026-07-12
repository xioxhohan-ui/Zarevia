import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate safe unique filename
    const sanitizedFilename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filepath = path.join(uploadDir, sanitizedFilename);

    // Write file to filesystem
    fs.writeFileSync(filepath, buffer);

    // Return the public URL path
    return NextResponse.json({ url: `/uploads/${sanitizedFilename}` });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
