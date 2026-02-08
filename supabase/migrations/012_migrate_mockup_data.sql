-- Migration 012: Migrer les données mockup vers marketplace_products
-- Ce script insère les produits de démonstration dans marketplace_products

-- ============================================
-- 1. Insérer les produits mockup
-- ============================================
INSERT INTO marketplace_products (
  id,
  name,
  category,
  type,
  description,
  detailed_description,
  image,
  price,
  currency,
  billing_model,
  is_hero,
  display_type,
  badge,
  featured_data,
  tags,
  primary_system,
  secondary_systems,
  is_active,
  created_at,
  updated_at
) VALUES
-- Hero Product - Session TPE
(
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  'Session TPE (Therapeutic Plasma Exchange)',
  'inflammation',
  'therapy',
  'Élimination mécanique des cytokines pro-inflammatoires et facteurs de sénescence.',
  'Élimination mécanique des cytokines pro-inflammatoires et facteurs de sénescence. Recommandé pour votre score d''inflammation (48.0 ans). Systemic Reset Médecin Requis.',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
  2500,
  'EUR',
  'per-session',
  true,
  'hero',
  '{"type": "action_required", "text": "ACTION REQUISE", "priority": true}'::jsonb,
  '{"clinicalStandard": "Gold Standard Clinique", "recommendedFor": "votre score d''inflammation (48.0 ans)", "doctorRequired": true}'::jsonb,
  '[{"name": "inflammation", "visible": true, "systemTargets": ["Inflammatory Regulation"], "agingStageTargets": ["Accelerated"]}, {"name": "high-priority", "visible": false, "systemTargets": ["Inflammatory Regulation"]}]'::jsonb,
  'Inflammatory Regulation',
  NULL,
  true,
  NOW(),
  NOW()
),
-- Product - Quercetin Complex
(
  'b2c3d4e5-f6a7-4890-b123-456789012345'::uuid,
  'Quercetin Complex',
  'inflammation',
  'supplement',
  'Cible la sénescence cellulaire inflammatoire.',
  NULL,
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  45,
  'EUR',
  'one-time',
  false,
  'grid',
  '{"type": "age_delta", "text": "DELTA", "value": "+10 ANS DELTA"}'::jsonb,
  '{"ageDelta": 10}'::jsonb,
  '[{"name": "inflammation", "visible": true, "systemTargets": ["Inflammatory Regulation"]}, {"name": "senescence", "visible": false, "systemTargets": ["Inflammatory Regulation", "Tissue Regeneration"]}]'::jsonb,
  'Inflammatory Regulation',
  ARRAY['Reproductive System', 'Metabolism'],
  true,
  NOW(),
  NOW()
),
-- Product - Resveratrol Pure
(
  'c3d4e5f6-a7b8-4901-c234-567890123456'::uuid,
  'Resveratrol Pure',
  'metabolism',
  'supplement',
  'Activation des sirtuines & santé digestive.',
  NULL,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
  62,
  'EUR',
  'one-time',
  false,
  'grid',
  NULL,
  NULL,
  '[{"name": "metabolism", "visible": true, "systemTargets": ["Metabolism", "Digestive System"]}, {"name": "sirtuins", "visible": false, "systemTargets": ["Metabolism"]}]'::jsonb,
  NULL,
  NULL,
  true,
  NOW(),
  NOW()
),
-- Product - NAD+ Complex
(
  'd4e5f6a7-b8c9-4012-d345-678901234567'::uuid,
  'NAD+ Complex',
  'metabolism',
  'supplement',
  'Support mitochondrial et énergie cellulaire.',
  NULL,
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400&h=400&fit=crop',
  89,
  'EUR',
  'one-time',
  false,
  'grid',
  '{"type": "age_delta", "text": "DELTA", "value": "+5 ANS DELTA"}'::jsonb,
  '{"ageDelta": 5}'::jsonb,
  '[{"name": "metabolism", "visible": true, "systemTargets": ["Metabolism"]}, {"name": "mitochondrial", "visible": false, "systemTargets": ["Metabolism", "Cardiac System"]}]'::jsonb,
  NULL,
  NULL,
  true,
  NOW(),
  NOW()
),
-- Product - Omega-3 Premium
(
  'e5f6a7b8-c9d0-4123-e456-789012345678'::uuid,
  'Omega-3 Premium',
  'cardiovascular',
  'supplement',
  'Support cardiovasculaire et anti-inflammatoire.',
  NULL,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
  55,
  'EUR',
  'one-time',
  false,
  'grid',
  NULL,
  NULL,
  '[{"name": "cardiovascular", "visible": true, "systemTargets": ["Cardiac System", "Blood and Vascular System"]}]'::jsonb,
  NULL,
  NULL,
  true,
  NOW(),
  NOW()
),
-- Product - Curcumin Advanced
(
  'f6a7b8c9-d0e1-4234-f567-890123456789'::uuid,
  'Curcumin Advanced',
  'inflammation',
  'supplement',
  'Réduction de l''inflammation systémique.',
  NULL,
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
  48,
  'EUR',
  'one-time',
  false,
  'grid',
  '{"type": "priority", "text": "Priorité", "priority": true}'::jsonb,
  NULL,
  '[{"name": "inflammation", "visible": true, "systemTargets": ["Inflammatory Regulation"]}]'::jsonb,
  'Inflammatory Regulation',
  ARRAY['Reproductive System', 'Metabolism'],
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. Vérification
-- ============================================
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_active = true) as active_products,
  COUNT(*) FILTER (WHERE display_type = 'hero') as hero_products
FROM marketplace_products;
