import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const KEY = "euro-summer:trip";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const data = await redis.get(KEY);
      return res.status(200).json({ state: data });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = req.body || {};
      const incoming = body.state;
      if (typeof incoming !== "object" || incoming === null) {
        return res.status(400).json({ error: "state must be an object" });
      }
      await redis.set(KEY, incoming);
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      await redis.del(KEY);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ error: "method not allowed" });
  } catch (err) {
    console.error("api/state error:", err);
    return res.status(500).json({ error: err?.message || "server error" });
  }
}
