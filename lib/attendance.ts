import { timetable } from "@/lib/data";

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getInPersonSessionForDate(date: Date): { unit: string; time: string } | null {
  const dayName = weekdayNames[date.getDay()];
  const session = timetable.find((s) => s.day === dayName && s.mode === "In-Person");
  return session ? { unit: session.unit, time: session.time } : null;
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
