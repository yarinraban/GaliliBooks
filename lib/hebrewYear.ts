const HEBREW_YEARS: Record<number, string> = {
  2025: 'תשפ״ה',
  2026: 'תשפ״ו',
  2027: 'תשפ״ז',
  2028: 'תשפ״ח',
  2029: 'תשפ״ט',
  2030: 'תש״צ',
};

export function toHebrewYear(year: number): string {
  return HEBREW_YEARS[year] ?? String(year);
}

export async function getActiveYear(prisma: { setting: { findUnique: (args: unknown) => Promise<{ value: string } | null> } }): Promise<number> {
  const s = await prisma.setting.findUnique({ where: { key: "activeYear" } });
  return s ? parseInt(s.value) : new Date().getFullYear();
}
