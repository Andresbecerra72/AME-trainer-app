-- =====================================================
-- S RATING — ST (Structures)
-- Topics based on TC Study Reference Guide
-- =====================================================

begin;

insert into public.topics (
  name,
  description,
  icon,
  question_count,
  code
) values

-- 13.0 SHEET METAL
('Sheet Metal', '13.1 Repairs and fabrication; 13.2 Assessment methods, techniques and practices - Theory, application and inspection; 13.3 Repair materials - identification and application', 'layout', 0, 'S-ST-13'),

-- 14.0 TUBULAR
('Tubular', '14.1 Repairs and fabrication; 14.2 Assessment methods, techniques and practices - Theory, application and inspection; 14.3 Repair materials - Identification and application', 'pipe', 0, 'S-ST-14'),

-- 15.0 WOOD AND FABRIC
('Wood and Fabric', '15.1 Repairs and fabrication; 15.2 Assessment methods, techniques and practices - Theory, application and inspection; 15.3 Repair materials - Identification and application', 'trees', 0, 'S-ST-15'),

-- 16.0 COMPOSITE
('Composite', '16.1 Repairs and fabrication; 16.2 Assessment methods, techniques and practices - Theory, application and inspection; 16.3 Repair materials - Identification and application', 'layers', 0, 'S-ST-16'),

-- 17.0 METALURGY AND CORROSION PREVENTION
('Metalurgy and Corrosion Prevention', '17.1 Types of corrosion - Identification; 17.2 Inspection processes - Theory and application; 17.3 Removal and treatment of corrosion - Theory and application; 17.4 Heat treatment, annealing and temper designation - Theory and application; 17.5 Ferrous and non ferrous metals – Types and properties', 'shield', 0, 'S-ST-17'),

-- 18.0 NONDESTRUCTIVE TESTING
('Nondestructive Testing', '18.1 Inspection techniques - Theory, types and application', 'scan-line', 0, 'S-ST-18'),

-- 19.0 FLUID LINES AND CONDUITS
('Fluid Lines and Conduits', '19.1 Rigid lines, flexible lines and fittings - Characteristics, fabrication, material and size designation', 'git-branch', 0, 'S-ST-19'),

-- 20.0 THERMOPLASTICS
('Thermoplastics', '20.1 Material – Inspection and installation; 20.2 Storage and surface protection – Theory and application', 'package-2', 0, 'S-ST-20')

on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;

commit;
