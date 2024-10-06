import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('image');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `${Date.now()}-${file.name}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

        await writeFile(filepath, buffer);

        const imagePath = `/uploads/${filename}`;
        return NextResponse.json({ imagePath });
    } catch (error) {
        console.error('Failed to upload image:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}
