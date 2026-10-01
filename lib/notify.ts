import { sql } from "@vercel/postgres";

export async function notifyUser(userId: number, type: string, title: string, body?: string) {
  await sql`
    INSERT INTO notifications (user_id, type, title, body)
    VALUES (${userId}, ${type}, ${title}, ${body || null})
  `;
}

export async function notifyAllStudents(type: string, title: string, body?: string) {
  const students = await sql`SELECT id FROM users WHERE role = 'student'`;
  for (const s of students.rows) {
    await sql`
      INSERT INTO notifications (user_id, type, title, body)
      VALUES (${s.id}, ${type}, ${title}, ${body || null})
    `;
  }
}
