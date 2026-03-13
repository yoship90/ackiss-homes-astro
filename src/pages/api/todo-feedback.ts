import type { APIRoute } from "astro";
import { put, list, del } from "@vercel/blob";

export const prerender = false;

const BLOB_PATHNAME = "todo-feedback.json";

export const GET: APIRoute = async () => {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    if (!blobs[0]) return new Response(JSON.stringify({ feedback: {}, order: [] }), { status: 200 });
    const res = await fetch(blobs[0].url, {
      headers: { Authorization: `Bearer ${import.meta.env.BLOB_READ_WRITE_TOKEN}` },
      cache: "no-store",
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("[todo-feedback GET]", err);
    return new Response(JSON.stringify({ feedback: {}, order: [] }), { status: 200 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { blobs } = await list({ prefix: BLOB_PATHNAME });
    await Promise.all(blobs.map((b) => del(b.url)));
    await put(BLOB_PATHNAME, JSON.stringify(body), {
      access: "private",
      addRandomSuffix: false,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("[todo-feedback POST]", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
};
