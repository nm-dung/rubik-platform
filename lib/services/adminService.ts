/**
 * Admin Service Layer
 * Centralized CRUD operations for admin content management
 * Includes RBAC utilities
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import { Algorithm, Lesson } from '@/lib/types';

export type ContentStatus = 'draft' | 'published';

// ============================================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================================

/**
 * Verify user role from profiles table
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data.role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Check if user has admin or coach access
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'coach';
}

/**
 * Create user profile when user signs up
 */
export async function createUserProfile(
  userId: string,
  email: string,
  role: 'student' | 'coach' | 'admin' = 'student'
) {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .insert({ id: userId, email, role });

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Profile creation failed:', error);
    throw error;
  }
}

// ============================================================================
// ALGORITHMS CRUD
// ============================================================================

export async function getAdminAlgorithms(includeUnpublished = true) {
  try {
    let query = supabaseAdmin
      .from('algorithms')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching algorithms:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get algorithms:', error);
    throw error;
  }
}

export async function createAlgorithm(
  payload: Omit<Algorithm, 'created_at'> & { status?: ContentStatus }
) {
  try {
    const normalized = {
      id: payload.id?.trim() || `algorithm-${Date.now()}`,
      name_en: payload.name_en ?? '',
      name_vi: payload.name_vi ?? '',
      category: payload.category ?? 'PLL',
      notation: payload.notation ?? '',
      difficulty: Number(payload.difficulty ?? 1),
      image_url: payload.image_url ?? null,
      alternate_notations: payload.alternate_notations ?? '',
      status: (payload.status ?? 'draft') as ContentStatus,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('algorithms')
      .insert(normalized)
      .select()
      .single();

    if (error) {
      console.error('Error creating algorithm:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create algorithm:', error);
    throw error;
  }
}

export async function updateAlgorithm(
  id: string,
  payload: Partial<Algorithm> & { status?: ContentStatus }
) {
  try {
    const normalized = {
      name_en: payload.name_en ?? undefined,
      name_vi: payload.name_vi ?? undefined,
      category: payload.category ?? undefined,
      notation: payload.notation ?? undefined,
      difficulty: payload.difficulty !== undefined ? Number(payload.difficulty) : undefined,
      image_url: payload.image_url ?? undefined,
      alternate_notations: payload.alternate_notations ?? undefined,
      status: payload.status ?? undefined,
    };

    // Remove undefined keys
    Object.keys(normalized).forEach(
      (key) => normalized[key as keyof typeof normalized] === undefined && delete normalized[key as keyof typeof normalized]
    );

    const { data, error } = await supabaseAdmin
      .from('algorithms')
      .update(normalized)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating algorithm:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update algorithm:', error);
    throw error;
  }
}

export async function deleteAlgorithm(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('algorithms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting algorithm:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete algorithm:', error);
    throw error;
  }
}

export async function getAlgorithmById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('algorithms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching algorithm:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get algorithm:', error);
    throw error;
  }
}

// ============================================================================
// LESSONS CRUD
// ============================================================================

export async function getAdminLessons(includeUnpublished = true, learningPath?: 'beginner' | 'advanced' | 'both') {
  try {
    let query = supabaseAdmin
      .from('lessons')
      .select('*')
      .order('difficulty')
      .order('order');

    if (!includeUnpublished) {
      query = query.eq('status', 'published');
    }

    if (learningPath) {
      query = query.eq('learning_path', learningPath);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get lessons:', error);
    throw error;
  }
}

export async function createLesson(
  payload: Omit<Lesson, 'created_at' | 'updated_at'> & { status?: ContentStatus }
) {
  try {
    const relatedAlgorithmIds = Array.isArray(payload.related_algorithm_ids)
      ? payload.related_algorithm_ids
      : typeof payload.related_algorithm_ids === 'string'
        ? (payload.related_algorithm_ids as string)
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
        : [];

    const normalized = {
      id: payload.id?.trim() || `lesson-${Date.now()}`,
      title_en: payload.title_en ?? '',
      title_vi: payload.title_vi ?? '',
      description_en: payload.description_en ?? '',
      description_vi: payload.description_vi ?? '',
      content_en: payload.content_en ?? '',
      content_vi: payload.content_vi ?? '',
      difficulty: payload.difficulty ?? 'beginner',
      order: Number(payload.order ?? 0),
      duration_minutes: payload.duration_minutes ? Number(payload.duration_minutes) : null,
      related_algorithm_ids: relatedAlgorithmIds,
      image_url: payload.image_url ?? null,
      learning_path: payload.learning_path ?? 'advanced',
      status: (payload.status ?? 'draft') as ContentStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .insert(normalized)
      .select()
      .single();

    if (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create lesson:', error);
    throw error;
  }
}

export async function updateLesson(
  id: string,
  payload: Partial<Lesson> & { status?: ContentStatus }
) {
  try {
    const relatedAlgorithmIds = Array.isArray(payload.related_algorithm_ids)
      ? payload.related_algorithm_ids
      : typeof payload.related_algorithm_ids === 'string'
        ? (payload.related_algorithm_ids as string)
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean)
        : undefined;

    const normalized = {
      title_en: payload.title_en ?? undefined,
      title_vi: payload.title_vi ?? undefined,
      description_en: payload.description_en ?? undefined,
      description_vi: payload.description_vi ?? undefined,
      content_en: payload.content_en ?? undefined,
      content_vi: payload.content_vi ?? undefined,
      difficulty: payload.difficulty ?? undefined,
      order: payload.order !== undefined ? Number(payload.order) : undefined,
      duration_minutes: payload.duration_minutes !== undefined ? Number(payload.duration_minutes) : undefined,
      related_algorithm_ids: relatedAlgorithmIds,
      image_url: payload.image_url ?? undefined,
      learning_path: payload.learning_path ?? undefined,
      status: payload.status ?? undefined,
      updated_at: new Date().toISOString(),
    };

    Object.keys(normalized).forEach(
      (key) => normalized[key as keyof typeof normalized] === undefined && delete normalized[key as keyof typeof normalized]
    );

    const { data, error } = await supabaseAdmin
      .from('lessons')
      .update(normalized)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update lesson:', error);
    throw error;
  }
}

export async function deleteLesson(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete lesson:', error);
    throw error;
  }
}

export async function getLessonById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get lesson:', error);
    throw error;
  }
}
