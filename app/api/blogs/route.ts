import { db } from '@/lib/db/drizzle';
import { eq, like, sql } from 'drizzle-orm';
import { posts } from '@/lib/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { search, tags, sortBy, order, page, limit } = Object.fromEntries(new URL(req.url).searchParams);

  const pageSize = parseInt(limit || '10');
  const pageOffset = (parseInt(page || '0')) * pageSize;

  // Base query
  let baseQuery = db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    tags: posts.tags,
    author: posts.author,
    createdAt: posts.createdAt,
    featureImage: posts.featureImage
  }).from(posts);

  // Search by title
  if (search) {
    baseQuery = baseQuery.where(like(posts.title, `%${search}%`));
  }

  // Tag filtering
  if (tags) {
    const tagsArray = tags.split(',');
    baseQuery = baseQuery.where(sql`${posts.tags} && ${sql.array(tagsArray)}`);
  }

  // Sorting
  if (sortBy && order) {
    baseQuery = baseQuery.orderBy(
      posts[sortBy as keyof typeof posts],
      order.toUpperCase() === 'DESC' ? 'desc' : 'asc'
    );
  } else {
    baseQuery = baseQuery.orderBy(posts.createdAt, 'desc');
  }

  // Pagination
  baseQuery = baseQuery.limit(pageSize).offset(pageOffset);

  // Get the blogs
  const blogs = await baseQuery;

  // Get total count for pagination
  const totalQuery = await db.select({ count: sql`count(*)` }).from(posts);
  const total = totalQuery[0]?.count;

  return NextResponse.json({ blogs, total });
}
