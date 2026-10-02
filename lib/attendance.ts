import { toLocalDateKey } from "@/lib/date";
import { sql } from "@vercel/postgres";
import { withRetry } from "@/lib/db";

export const toDateKey = toLocalDateKey;

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function getInPersonSessionForDate(date: Date): Promise<{ unit: string; time: string } | null> {
  const dayName = weekdayNames[date.getDay()];
  const result = await withRetry(() => sql`
    SELECT unit, time FROM timetable_sessions
    WHERE day = ${dayName} AND mode = 'In-Person'
    ORDER BY time
    LIMIT 1
  `);
  return result.rows[0] ? { unit: result.rows[0].unit, time: result.rows[0].time } : null;
}
