begin;

insert into public.topics (
  name,
  description,
  icon,
  question_count,
  code
) values

-- =====================================================
-- M RATING — SPM (Standard Practices)
-- =====================================================
('Mathematics and Physics', 'Basic mathematics and physics applied to aircraft maintenance', 'calculator', 0, 'M-SPM-01'),
('Electricity and Electronics', 'Fundamentals of electricity and basic electronics', 'zap', 0, 'M-SPM-02'),
('Aircraft Hardware', 'Standard aircraft hardware and fasteners', 'wrench', 0, 'M-SPM-03'),
('Aircraft Drawings', 'Reading and interpreting aircraft drawings', 'drafting-compass', 0, 'M-SPM-04'),
('Weight and Balance', 'Aircraft weight and balance principles', 'scale', 0, 'M-SPM-05'),
('Metallurgy and Corrosion', 'Metals, alloys, and corrosion prevention', 'layers', 0, 'M-SPM-06'),
('Non-Destructive Testing', 'NDT methods and applications', 'scan-line', 0, 'M-SPM-07'),
('General Servicing', 'Standard servicing practices', 'tool', 0, 'M-SPM-08'),
('Tools and Measuring Devices', 'Use of tools and precision measuring equipment', 'ruler', 0, 'M-SPM-09'),

-- =====================================================
-- M RATING — AF (Airframe)
-- =====================================================
('Aircraft Structures', 'Primary and secondary aircraft structures', 'box', 0, 'M-AF-10'),
('Aircraft Assembly and Rigging', 'Assembly and rigging of aircraft components', 'settings', 0, 'M-AF-11'),
('Hydraulic Systems', 'Aircraft hydraulic systems', 'droplet', 0, 'M-AF-12'),
('Pneumatic Systems', 'Aircraft pneumatic systems', 'wind', 0, 'M-AF-13'),
('Flight Control Systems', 'Primary and secondary flight controls', 'move', 0, 'M-AF-14'),
('Aircraft Instruments', 'Mechanical and electrical aircraft instruments', 'gauge', 0, 'M-AF-15'),
('Aircraft Electrical Systems', 'Electrical generation and distribution', 'battery', 0, 'M-AF-16'),
('Aircraft Fuel Systems', 'Fuel storage, distribution and indication', 'fuel', 0, 'M-AF-17'),
('Environmental Control Systems', 'Cabin pressurization and air conditioning', 'cloud', 0, 'M-AF-18'),
('Ice and Rain Protection', 'Anti-ice and de-ice systems', 'snowflake', 0, 'M-AF-19'),
('Fire Protection Systems', 'Fire detection and extinguishing systems', 'flame', 0, 'M-AF-20'),
('Landing Gear Systems', 'Landing gear and braking systems', 'circle-dot', 0, 'M-AF-21'),
('Communication and Navigation Systems', 'Basic communication and navigation systems', 'radio', 0, 'M-AF-29'),
('Autopilot Systems', 'Automatic flight control systems', 'cpu', 0, 'M-AF-30'),

-- =====================================================
-- M RATING — PP (Powerplant)
-- =====================================================
('Reciprocating Engines', 'Piston engine theory and operation', 'rotate-cw', 0, 'M-PP-31'),
('Engine Fuel and Control', 'Fuel metering and engine control systems', 'settings-2', 0, 'M-PP-32'),
('Ignition and Starting Systems', 'Ignition and starting components', 'sparkles', 0, 'M-PP-33'),
('Lubrication and Cooling Systems', 'Oil and cooling systems', 'thermometer', 0, 'M-PP-34'),
('Engine Fire Protection', 'Powerplant fire protection systems', 'flame', 0, 'M-PP-35'),
('Turbine Engines', 'Gas turbine engine theory', 'fan', 0, 'M-PP-36'),
('Propellers', 'Propeller theory and systems', 'loader', 0, 'M-PP-42'),

-- =====================================================
-- E RATING — SPE (Standard Practices Avionics)
-- =====================================================
('Electrical Theory', 'Electrical fundamentals for avionics', 'zap', 0, 'E-SPE-02'),
('Electronics Theory', 'Analog and digital electronics', 'cpu', 0, 'E-SPE-03'),
('Wiring Practices', 'Aircraft wiring standards and practices', 'git-branch', 0, 'E-SPE-08'),
('Aircraft Electrical Systems', 'Avionic electrical systems', 'battery', 0, 'E-SPE-09'),
('Communication Systems', 'Aircraft communication systems', 'radio', 0, 'E-SPE-11'),
('Navigation Systems', 'Aircraft navigation systems', 'compass', 0, 'E-SPE-12'),

-- =====================================================
-- S RATING — ST (Structures)
-- =====================================================
('Aircraft Structures', 'Structural components and design', 'box', 0, 'S-ST-10'),
('Sheet Metal Structures', 'Sheet metal repair techniques', 'layout', 0, 'S-ST-12'),
('Composite Materials', 'Composite structure repair', 'layers', 0, 'S-ST-21'),
('Corrosion Control', 'Corrosion identification and treatment', 'shield', 0, 'S-ST-05')

on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;

commit;
