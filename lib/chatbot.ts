export type ChatIntent = {
  patterns: RegExp[];
  key: string;
};

export const intents: ChatIntent[] = [
  { key: "greeting", patterns: [/^(hi|hello|hey|habari|mambo)\b/i] },
  { key: "next_class", patterns: [/next class/i, /when.*class/i, /what.*class.*(today|next|now)/i, /upcoming class/i] },
  { key: "my_group", patterns: [/my group/i, /which group/i, /what group/i] },
  { key: "join_group", patterns: [/join.*group/i, /how.*join/i, /request.*group/i] },
  { key: "announcements", patterns: [/announcement/i, /urgent/i, /any news/i, /what's new/i] },
  { key: "my_attendance", patterns: [/my attendance/i, /how.*attendance/i, /present|absent/i] },
  { key: "reset_password", patterns: [/forgot.*password/i, /reset.*password/i, /can't log in/i, /cannot log in/i] },
  { key: "resources", patterns: [/resource/i, /notes/i, /past paper/i, /slides/i] },
  { key: "contact", patterns: [/contact/i, /class rep/i, /class president/i, /whatsapp/i] },
  { key: "timetable", patterns: [/timetable/i, /schedule/i, /full.*class/i] },
  { key: "thanks", patterns: [/^(thanks|thank you|asante)\b/i] },
];

export function matchIntent(text: string): string {
  for (const intent of intents) {
    if (intent.patterns.some((p) => p.test(text))) {
      return intent.key;
    }
  }
  return "fallback";
}
