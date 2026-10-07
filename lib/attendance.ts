import { toLocalDateKey } from "@/lib/date";
import { sql } from "@vercel/postgres";
import { withRetry } from "@/lib/db";

export const toDateKey = toLocalDateKey;

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type InPersonSession = { id: number; unit: string; time: string };

export async function getInPersonSessionsForDate(date: Date): Promise<InPersonSession[]> {
  const dayName = weekdayNames[date.getDay()];
  const result = await withRetry(() => sql`
    SELECT id, unit, time FROM timetable_sessions
    WHERE day = ${dayName} AND mode = 'In-Person'
    ORDER BY time
  `);
  return result.rows.map((r) => ({ id: r.id, unit: r.unit, time: r.time }));
}

export async function getInPersonSessionForDate(date: Date): Promise<{ unit: string; time: string } | null> {
  const sessions = await getInPersonSessionsForDate(date);
  return sessions[0] || null;
}
