import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { roles, users } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

export async function GET() {
    try {
        const rolesWithUserCount = await db
            .select({
                id: roles.id,
                name: roles.name,
                description: roles.description,
                userCount: count(users.id),
            })
            .from(roles)
            .leftJoin(users, eq(users.roleId, roles.id))
            .groupBy(roles.id);

        return NextResponse.json(rolesWithUserCount);
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, description } = await request.json();
        const newRole = await db.insert(roles).values({ name, description }).returning();
        return NextResponse.json(newRole[0]);
    } catch (error) {
        console.error('Failed to create role:', error);
        return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }
}