export async function takeDailySlot(db,now=new Date()) {
  const day=now.toISOString().slice(0,10);
  // The conditional increment is atomic, including simultaneous requests.
  return Boolean(await db.prepare(`INSERT INTO ai_usage (day,requests) VALUES (?,1)
    ON CONFLICT(day) DO UPDATE SET requests=requests+1 WHERE requests<100
    RETURNING requests`).bind(day).first());
}
