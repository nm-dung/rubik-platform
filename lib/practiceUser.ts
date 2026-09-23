import { supabase } from '@/lib/supabase';

const GUEST_USER_ID_KEY = 'rubik-platform-guest-user-id';

function createGuestUserId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.random() * 16 | 0;
    const value = character === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
}

export async function getPracticeUserId(): Promise<string> {
  if (typeof window === 'undefined') {
    return createGuestUserId();
  }

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user.id) {
      return data.session.user.id;
    }
  }

  const storedGuestId = window.localStorage.getItem(GUEST_USER_ID_KEY);
  if (storedGuestId) {
    return storedGuestId;
  }

  const guestId = createGuestUserId();
  window.localStorage.setItem(GUEST_USER_ID_KEY, guestId);
  return guestId;
}
