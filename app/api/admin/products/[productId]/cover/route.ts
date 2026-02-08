import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/utils/admin';
import { uploadProductCover, validateImageFile } from '@/lib/utils/storage';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Route API pour uploader l'image de couverture d'un produit (admin uniquement)
 * POST /api/admin/products/[productId]/cover
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;

    // Vérifier l'authentification
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

    // Vérifier que l'utilisateur est admin
    // Utiliser supabaseAdmin pour bypass RLS et vérifier le rôle
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      console.error('Admin check failed:', profileError);
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Récupérer le fichier depuis FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Valider le fichier
    const validation = validateImageFile(file, 10); // 10MB max pour produits
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Uploader l'image vers Supabase Storage
    const coverUrl = await uploadProductCover(productId, file);

    // Retourner l'URL de l'image sans mettre à jour le produit dans la DB
    // Le produit sera mis à jour lors de la sauvegarde manuelle du formulaire
    // Cela évite de déclencher des refreshes qui rouvrent la popin
    return NextResponse.json({
      success: true,
      coverUrl,
      message: 'Product cover uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading product cover:', error);
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
