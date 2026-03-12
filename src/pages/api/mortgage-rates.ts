import type { APIRoute } from "astro";

export const prerender = false;

const WEEKS_TO_SHOW = 12;

interface FredObservation {
  date: string;
  value: string;
}

export const GET: APIRoute = async () => {
  const apiKey = import.meta.env.FRED_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing FRED_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url =
    `https://api.stlouisfed.org/fred/series/observations` +
    `?series_id=MORTGAGE30US` +
    `&api_key=${apiKey}` +
    `&observation_start=2019-01-01` +
    `&sort_order=asc` +
    `&file_type=json`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    return new Response(JSON.stringify({ error: "FRED fetch failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "FRED fetch failed" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const json = await res.json();
  const observations: FredObservation[] = (json.observations ?? []).filter(
    (o: FredObservation) => o.value !== "."
  );

  if (observations.length === 0) {
    return new Response(JSON.stringify({ error: "No data" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ── Last 12 observations = weekly section ─────────────────────────
  const weeklyObs = observations.slice(-WEEKS_TO_SHOW);
  const weeklyStartDate = weeklyObs[0]?.date ?? "";
  const latestDate = observations[observations.length - 1]?.date ?? "";

  // ── Everything before weekly section → quarterly averages ─────────
  const histObs = observations.filter((o) => o.date < weeklyStartDate);

  const buckets: Record<string, number[]> = {};
  for (const obs of histObs) {
    const parts = obs.date.split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const q = Math.ceil(month / 3);
    const key = `Q${q} '${String(year).slice(-2)}`;
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(parseFloat(obs.value));
  }

  const quarterly = Object.entries(buckets).map(([label, values]) => ({
    label,
    rate: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    weekly: false,
  }));

  // ── Weekly section — labeled "Mon D" ──────────────────────────────
  const weeklyPoints = weeklyObs.map((obs) => {
    const date = new Date(obs.date + "T12:00:00");
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label, rate: parseFloat(obs.value), weekly: true };
  });

  const data = [...quarterly, ...weeklyPoints];

  return new Response(JSON.stringify({ data, ratesAsOf: latestDate }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
