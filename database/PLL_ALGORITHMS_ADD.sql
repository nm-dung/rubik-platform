-- ADD ALL PLL ALGORITHMS
-- Run this in your Supabase SQL Editor to add all PLL algorithms

INSERT INTO algorithms (id, name_en, name_vi, category, notation, difficulty) VALUES
-- Y-Perm
('550e8400-e29b-41d4-a716-446655440002', 'Y Perm', 'Y Perm', 'PLL', 'F R U'' R'' U'' R U R'' F'' R U R'' U'' R'' F R F''', 5),

-- Ua-Perm
('550e8400-e29b-41d4-a716-446655440003', 'Ua Perm', 'Ua Perm', 'PLL', 'R U R'' U R U2 R'' U'' R U R'' U'' R U2 R''', 4),

-- Ub-Perm
('550e8400-e29b-41d4-a716-446655440004', 'Ub Perm', 'Ub Perm', 'PLL', 'R2 U R U R'' U'' R'' U'' R'' U R'' U'' R2', 4),

-- H-Perm
('550e8400-e29b-41d4-a716-446655440005', 'H Perm', 'H Perm', 'PLL', 'R2 U2 R U2 R2 U2 R2 U2 R U2 R2', 6),

-- Z-Perm
('550e8400-e29b-41d4-a716-446655440006', 'Z Perm', 'Z Perm', 'PLL', 'M2 U M2 U2 M2 U M2', 5),

-- Aa-Perm (left)
('550e8400-e29b-41d4-a716-446655440007', 'Aa Perm', 'Aa Perm', 'PLL', 'R'' U'' R'' U R'' U'' R'' U R U R2', 3),

-- Ab-Perm (right)
('550e8400-e29b-41d4-a716-446655440008', 'Ab Perm', 'Ab Perm', 'PLL', 'R U R'' U R U2 R'' U'' R U'' R'' U2 R', 3),

-- Jb-Perm (left)
('550e8400-e29b-41d4-a716-446655440009', 'Jb Perm', 'Jb Perm', 'PLL', 'R'' U L'' U2 R U'' R'' U2 R U L', 4),

-- Ja-Perm (right)
('550e8400-e29b-41d4-a716-446655440010', 'Ja Perm', 'Ja Perm', 'PLL', 'R U R'' F'' R U R'' U'' R'' F R2 U'' R'' U2', 4),

-- Ra-Perm (left)
('550e8400-e29b-41d4-a716-446655440011', 'Ra Perm', 'Ra Perm', 'PLL', 'R'' U R'' U'' R'' U R'' U R U2 R''', 5),

-- Rb-Perm (right)
('550e8400-e29b-41d4-a716-446655440012', 'Rb Perm', 'Rb Perm', 'PLL', 'R U R'' U R U2 R'' U'' R U R'' U'' R2', 5),

-- F-Perm
('550e8400-e29b-41d4-a716-446655440013', 'F Perm', 'F Perm', 'PLL', 'R'' U'' R'' U'' R'' U R U R'' F'' R U R U R'' F''', 6),

-- V-Perm
('550e8400-e29b-41d4-a716-446655440014', 'V Perm', 'V Perm', 'PLL', 'R'' U R'' U'' R'' F R2 U'' R'' U'' R U R'' F''', 7),

-- E-Perm
('550e8400-e29b-41d4-a716-446655440015', 'E Perm', 'E Perm', 'PLL', 'x R'' U'' R'' D'' R U R'' D'' R U R'' x', 7),

-- Na-Perm
('550e8400-e29b-41d4-a716-446655440016', 'Na Perm', 'Na Perm', 'PLL', 'R U R'' U R U R'' F'' R U R'' U'' R'' F R2 U'' R'' U2', 8),

-- Nb-Perm
('550e8400-e29b-41d4-a716-446655440017', 'Nb Perm', 'Nb Perm', 'PLL', 'R U'' R U R U R'' F'' R U R'' U'' R'' F R2 U'' R U2', 8),

-- Ga-Perm
('550e8400-e29b-41d4-a716-446655440018', 'Ga Perm', 'Ga Perm', 'PLL', 'R2 U R'' U R'' U R U2 R2 U R U R'' U R'' U2', 9),

-- Gb-Perm
('550e8400-e29b-41d4-a716-446655440019', 'Gb Perm', 'Gb Perm', 'PLL', 'R U R'' U R U R'' U R U R'' U R U2 R''', 9),

-- Gc-Perm
('550e8400-e29b-41d4-a716-446655440020', 'Gc Perm', 'Gc Perm', 'PLL', 'R U'' R U R U R'' U R U2 R'' U R U'' R', 9),

-- Gd-Perm
('550e8400-e29b-41d4-a716-446655440021', 'Gd Perm', 'Gd Perm', 'PLL', 'R U R'' U R U2 R'' U R U'' R'' U R U'' R''', 9)
ON CONFLICT (id) DO NOTHING;