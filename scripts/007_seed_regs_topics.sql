-- =====================================================
-- REGS (Regulatory Requirements)
-- Applicable to M, E and S licence ratings
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

-- =====================================================
-- CARs (Canadian Aviation Regulations)
-- =====================================================

-- 1.0 General Provisions - Interpretation
('General Provisions - Interpretation', '1.0 General Provisions - Interpretation', 'book-open', 0, 'REGS-CARs-01'),

-- 2.0 Aircraft Identification and Registration and Operation of a Leased Aircraft by a Non-registered Owner
('Aircraft Identification and Registration and Operation of a Leased Aircraft by a Non-registered Owner', '2.0 Aircraft Identification and Registration and Operation of a Leased Aircraft by a Non-registered Owner – Aircraft marking and Registration', 'plane', 0, 'REGS-CARs-02'),

-- 3.0 Personnel Licensing and Training
('Personnel Licensing and Training', '3.0 Personnel Licensing and Training – Aircraft Maintenance Engineering Licenses and Ratings', 'user-check', 0, 'REGS-CARs-03'),

-- 4.0 Airworthiness
('Airworthiness', '4.0 Airworthiness', 'shield-check', 0, 'REGS-CARs-04'),

-- 5.0 General Operating and Flight Rules
('General Operating and Flight Rules', '5.0 General Operating and Flight Rules – Aircraft Requirements', 'file-text', 0, 'REGS-CARs-05'),

-- 6.0 Commercial Air Services
('Commercial Air Services', '6.0 Commercial Air Services – Aircraft Maintenance Requirements for Air Operators', 'briefcase', 0, 'REGS-CARs-06'),

-- =====================================================
-- Standards
-- =====================================================

-- 7.0 Aircraft Registration
('Aircraft Registration', '7.0 Aircraft Registration', 'clipboard-list', 0, 'REGS-STDs-07'),

-- 8.0 Airworthiness Directives
('Airworthiness Directives', '8.0 Airworthiness Directives', 'alert-circle', 0, 'REGS-STDs-08'),

-- 9.0 AME Licensing
('AME Licensing', '9.0 AME Licensing', 'badge', 0, 'REGS-STDs-09'),

-- 10.0 Approved Maintenance Organizations (AMO)
('Approved Maintenance Organizations (AMO)', '10.0 Approved Maintenance Organizations (AMO)', 'building', 0, 'REGS-STDs-10'),

-- 11.0 Borrowed Parts
('Borrowed Parts', '11.0 Borrowed Parts', 'package-open', 0, 'REGS-STDs-11'),

-- 12.0 Defects
('Defects', '12.0 Defects', 'alert-triangle', 0, 'REGS-STDs-12'),

-- 13.0 Definitions
('Definitions', '13.0 Definitions', 'book', 0, 'REGS-STDs-13'),

-- 14.0 Elementary Work
('Elementary Work', '14.0 Elementary Work', 'hammer', 0, 'REGS-STDs-14'),

-- 15.0 Flight Permits; Flight Authorities
('Flight Permits; Flight Authorities', '15.0 Flight Permits; Flight Authorities', 'file-badge', 0, 'REGS-STDs-15'),

-- 16.0 Inspection
('Inspection', '16.0 Inspection', 'search', 0, 'REGS-STDs-16'),

-- 17.0 Life Limited Parts
('Life Limited Parts', '17.0 Life Limited Parts', 'clock', 0, 'REGS-STDs-17'),

-- 18.0 Maintenance Activities
('Maintenance Activities', '18.0 Maintenance Activities', 'wrench', 0, 'REGS-STDs-18'),

-- 19.0 Maintenance Control Systems
('Maintenance Control Systems', '19.0 Maintenance Control Systems', 'settings', 0, 'REGS-STDs-19'),

-- 20.0 Maintenance Release / Release Certification
('Maintenance Release / Release Certification', '20.0 Maintenance Release / Release Certification', 'file-check', 0, 'REGS-STDs-20'),

-- 21.0 Maintenance Schedules
('Maintenance Schedules', '21.0 Maintenance Schedules', 'calendar', 0, 'REGS-STDs-21'),

-- 22.0 Modification / Repair
('Modification / Repair', '22.0 Modification / Repair', 'tool', 0, 'REGS-STDs-22'),

-- 23.0 Non-Destructive Testing (NDT)
('Non-Destructive Testing (NDT)', '23.0 Non-Destructive Testing (NDT)', 'scan-line', 0, 'REGS-STDs-23'),

-- 24.0 Out-of-Phase items
('Out-of-Phase Items', '24.0 Out-of-Phase items', 'alert-octagon', 0, 'REGS-STDs-24'),

-- 25.0 Parts Identification
('Parts Identification', '25.0 Parts Identification', 'tag', 0, 'REGS-STDs-25'),

-- 26.0 Performance of Work
('Performance of Work', '26.0 Performance of Work', 'check-circle', 0, 'REGS-STDs-26'),

-- 27.0 Person Responsible for Maintenance (PRM)
('Person Responsible for Maintenance (PRM)', '27.0 Person Responsible for Maintenance (PRM)', 'user-cog', 0, 'REGS-STDs-27'),

-- 28.0 Restricted Certification Authority (RCA)
('Restricted Certification Authority (RCA)', '28.0 Restricted Certification Authority (RCA)', 'shield', 0, 'REGS-STDs-28'),

-- 29.0 Specialized Maintenance
('Specialized Maintenance', '29.0 Specialized Maintenance', 'sparkles', 0, 'REGS-STDs-29'),

-- 30.0 Technical Records
('Technical Records', '30.0 Technical Records', 'file-archive', 0, 'REGS-STDs-30'),

-- 31.0 Type/Supplemental Type Certificates
('Type/Supplemental Type Certificates', '31.0 Type/Supplemental Type Certificates', 'award', 0, 'REGS-STDs-31'),

-- 32.0 Used Parts
('Used Parts', '32.0 Used Parts', 'recycle', 0, 'REGS-STDs-32'),

-- 33.0 Weight and Balance
('Weight and Balance', '33.0 Weight and Balance', 'scale', 0, 'REGS-STDs-33'),

-- 34.0 (N/A)
--('N/A', '34.0 (N/A)', 'minus-circle', 0, 'REGS-STDs-34'),

-- 35.0 General knowledge on CARs/STDs
('General Knowledge on CARs/STDs', '35.0 General knowledge on CARs/STDs', 'library', 0, 'REGS-STDs-35')

on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;

commit;
