import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, roles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

export async function GET() {
    try {
        const session = await getSession();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const user = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                roleName: roles.name,
            })
            .from(users)
            .leftJoin(roles, eq(users.roleId, roles.id))
            .where(eq(users.id, userId))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id, name, email, roleName } = user[0];

        return NextResponse.json({
            id,
            name,
            email,
            role: roleName,
        });
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
