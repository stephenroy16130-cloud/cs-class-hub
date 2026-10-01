import { sql } from "@vercel/postgres";

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function getInPersonSessionForDate(date: Date): Promise<{ unit: string; time: string } | null> {
  const dayName = weekdayNames[date.getDay()];
  const result = await sql`
    SELECT unit, time FROM timetable_sessions
    WHERE day = ${dayName} AND mode = 'In-Person'
    ORDER BY time
    LIMIT 1
  `;
  return result.rows[0] ? { unit: result.rows[0].unit, time: result.rows[0].time } : null;
}
