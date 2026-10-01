export type TimetableSession = {
  id: number;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  time: string;
  unit: string;
  lecturer: string;
  venue: string;
  mode: "In-Person" | "Online";
};

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function getUpcomingSessions(sessions: TimetableSession[], now: Date, count: number) {
  const currentWeekday = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const results: { session: TimetableSession; dayName: string; offset: number }[] = [];

  for (let offset = 0; offset < 8 && results.length < count; offset++) {
    const checkWeekday = (currentWeekday + offset) % 7;
    const dayName = weekdayNames[checkWeekday];
    const sessionsToday = sessions
      .filter((s) => s.day === dayName)
      .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

    for (const session of sessionsToday) {
      if (results.length >= count) break;
      const startMinutes = parseTimeToMinutes(session.time);
      if (offset === 0 && startMinutes <= currentMinutes) continue;
      results.push({ session, dayName, offset });
    }
  }

  return results;
}

export function getNextSession(sessions: TimetableSession[], now: Date) {
  const upcoming = getUpcomingSessions(sessions, now, 1);
  return upcoming[0] || null;
}
