import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { title, slug, featureImage, content, state } = await request.json();

        const updatedBlog = await db.update(posts)
            .set({
                title,
                slug,
                featureImage,
                content,
                state,
                updatedAt: new Date(),
            })
            .where(eq(posts.id, parseInt(id)))
            .returning();

        if (updatedBlog.length === 0) {
            return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        return NextResponse.json({ blog: updatedBlog[0] });
    } catch (error) {
        console.error('Failed to update blog:', error);
        return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
}