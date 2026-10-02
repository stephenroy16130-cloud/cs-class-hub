import webpush from "web-push";
import { sql } from "@vercel/postgres";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return;
  webpush.setVapidDetails("mailto:admin@example.com", publicKey, privateKey);
  configured = true;
}

export async function sendPushToUser(userId: number, title: string, body: string, url = "/") {
  ensureConfigured();
  if (!configured) return;

  const subs = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ${userId}`;

  for (const sub of subs.rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({ title, body, url })
      );
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`;
      }
    }
  }
}

export async function sendPushToAllStudents(title: string, body: string, url = "/") {
  ensureConfigured();
  if (!configured) return;

  const students = await sql`SELECT id FROM users WHERE role = 'student'`;
  for (const s of students.rows) {
    await sendPushToUser(s.id, title, body, url);
  }
}
