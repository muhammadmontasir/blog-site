import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { roles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { name, description } = await request.json();
        const updatedRole = await db
            .update(roles)
            .set({ name, description })
            .where(eq(roles.id, parseInt(params.id)))
            .returning();

        if (updatedRole.length === 0) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        return NextResponse.json(updatedRole[0]);
    } catch (error) {
        console.error('Failed to update role:', error);
        return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const deletedRole = await db
            .delete(roles)
            .where(eq(roles.id, parseInt(params.id)))
            .returning();

        if (deletedRole.length === 0) {
            return NextResponse.json({ error: 'Role not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Failed to delete role:', error);
        return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
    }
}