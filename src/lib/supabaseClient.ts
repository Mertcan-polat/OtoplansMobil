import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL) {
  console.warn('EXPO_PUBLIC_SUPABASE_URL tanımlı değil (.env dosyasını kontrol et)');
}

if (!SUPABASE_KEY) {
  console.warn('EXPO_PUBLIC_SUPABASE_KEY tanımlı değil (.env dosyasını kontrol et)');
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Supabase env değişkenleri eksik. EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_KEY gerekli.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});