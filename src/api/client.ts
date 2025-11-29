export const API_BASE = 'https://otoplans.net';

export async function getFeatured(limit = 15) {
  const url = `${API_BASE}/api/featured?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch featured');
  return res.json() as Promise<{
    items: {
      marka: string;
      model: string;
      motor_tip: string;
      yil: number | null;
      bakimlar: { text: string; not?: string | null }[];
    }[];
  }>;
}
