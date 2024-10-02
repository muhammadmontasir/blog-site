import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { posts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { title, slug, featureImage, content, state } = await request.json();

        const { id: currentUserId = 0, name: currentUserName = '', role: currentUserRole = '' } = await getUser() ?? {};
        const updatedBlog = await db.update(posts)
            .set({
                title,
                slug,
                featureImage,
                content,
                state,
                updatedAt: new Date(),
                updatedBy: currentUserId,
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

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const deletedBlog = await db.delete(posts)
            .where(eq(posts.id, parseInt(params.id)))
            .returning();
        return NextResponse.json({ message: 'Blog post deleted successfully', blog: deletedBlog[0] });
    } catch (error) {
        console.error('Failed to delete blog:', error);
        return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
}
