import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/utils/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Route API pour lister les utilisateurs avec leurs profils (admin uniquement)
 */
export async function GET() {
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

    // Récupérer tous les utilisateurs
    const { data: usersData, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error listing users:', usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    // Récupérer les profils avec les rôles
    const userIds = usersData.users.map((u) => u.id);
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, first_name, last_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      // Continuer même si les profils ne peuvent pas être chargés
    }

    // Combiner les utilisateurs avec leurs profils
    const usersWithProfiles = usersData.users.map((user) => {
      const profile = profilesData?.find((p) => p.id === user.id);
      return {
        ...user,
        profile: profile
          ? {
              role: profile.role || 'user',
              first_name: profile.first_name,
              last_name: profile.last_name,
            }
          : undefined,
      };
    });

    return NextResponse.json({ users: usersWithProfiles });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
