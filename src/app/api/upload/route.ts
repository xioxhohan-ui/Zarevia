import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // ⚠️ Vercel serverless functions run on a read-only filesystem.
    // File uploads from this Next.js app are not persisted across requests.
    // For production file uploads, use the /backend Express API which
    // routes uploads through Firebase Cloud Storage.
    // This endpoint returns a data URL so existing flows don't break.
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      filename: file.name,
      size: file.size,
      note: 'File stored as data URL. For persistent storage, use the backend Firebase upload endpoint.',
    });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
