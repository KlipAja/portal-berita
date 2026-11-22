import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Portal Berita Indonesia";
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      title,
      slug,
      excerpt,
      published_at,
      category:categories(name),
      author:profiles!posts_author_id_fkey(full_name)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const itemsXml = (posts || [])
    .map(
      (post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/berita/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/berita/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || post.title}]]></description>
      <category>${post.category?.name || "Nasional"}</category>
      <author>${post.author?.full_name || "Redaksi"}</author>
      <pubDate>${new Date(post.published_at || new Date()).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${siteName}</title>
      <link>${siteUrl}</link>
      <description>Sindikasi Berita Terkini, Akurat, dan Terpercaya</description>
      <language>id-ID</language>
      <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
      ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
