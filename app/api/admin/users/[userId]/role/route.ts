import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/utils/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Route API pour mettre à jour le rôle d'un utilisateur
 * PUT /api/admin/users/[userId]/role
 * Body: { role: 'user' | 'admin' | 'moderator' }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Vérifier l'authentification de l'utilisateur actuel
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore les erreurs de cookies
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'utilisateur actuel est admin
    const userIsAdmin = await isAdmin(user);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Récupérer le nouveau rôle depuis le body
    const body = await request.json();
    const { role } = body;

    if (!role || !['user', 'admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be: user, admin, or moderator' },
        { status: 400 }
      );
    }

    const userId = params.userId;

    // Mettre à jour le rôle dans profiles
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
      },
    });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
