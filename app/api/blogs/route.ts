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
    featureImage: posts.featureImage,
    slug: posts.slug,
    state: posts.state
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

export async function POST(request: Request) {
  try {
    const { title, slug, featureImage, content, state } = await request.json();

    const newBlog = await db.insert(posts).values({
      title,
      slug,
      content,
      userId: 1,
      author: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ blog: newBlog[0] });
  } catch (error) {
    console.error('Failed to create blog:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}