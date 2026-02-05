-- =====================================================
-- S RATING — SPS (Standard Practices Structures)
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

-- 1.0 STANDARD PRACTICES
('Standard Practices', '1.1 Safety practices; 1.2 Gas laws and fluid mechanics - Theory and application; 1.3 Properties of the atmosphere - Pressure, humidity, density characteristics; 1.4 Properties of solids and liquids - Theory and application; 1.5 Velocity, acceleration, mass and force - Theory and calculation; 1.6 Heat, temperature, heat transfer and measurement - Calculation; 1.7 Work, energy and power - Theory and calculation; 1.8 Aircraft electrical wiring - Types, characteristics, wire sizes; 1.9 Aircraft grounding and bonding - Theory and calculation; 1.10 Instrument panel layout and instrument mounting - Theory and application; 1.11 Flight control systems - Theory and application; 1.12 Propulsion systems - Theory and application; 1.13 Hydraulic systems - Theory and application; 1.14 Pneumatic systems - Theory and application; 1.15 Landing gear systems - Theory and application; 1.16 Environmental systems - Theory and application; 1.17 Fire protection systems - Theory and application; 1.18 Safety wiring (lockwiring) procedures; 1.19 Welding techniques - Theory and application; 1.20 ATA Specification 100 - Chapters relevant to maintenance aviation maintenance', 'wrench', 0, 'S-SPS-01'),

-- 2.0 AERODYNAMICS
('Aerodynamics', '2.1 Aircraft structures and theory of flight - Fixed wing aircraft; 2.2 Aircraft structures and theory of flight - Rotary wing aircraft', 'wind', 0, 'S-SPS-02'),

-- 3.0 MATHEMATICS / PHYSICS
('Mathematics / Physics', '3.1 Shop mathematics, graphs and charts - Theory and application; 3.2 Measurement systems and conversion - Calculation and application; 3.3 Chemical and physical nature of matter - Theory and application; 3.4 Stress and strain - Theory and application', 'calculator', 0, 'S-SPS-03'),

-- 4.0 AIRCRAFT HARDWARE
('Aircraft Hardware', '4.1 Specifications and standards - Basic theory and application; 4.2 Rivets - Identification and use; 4.3 Threaded fasteners - Identification and use; 4.4 Special fasteners - Theory and application; 4.5 Control cables, terminals and turnbuckles - Identification and use; 4.6 Rigid lines, flexible lines and fittings - characteristics, fabrication, material and size designation; 4.7 Sealant - Theory and application', 'package', 0, 'S-SPS-04'),

-- 5.0 AIRCRAFT DRAWING
('Aircraft Drawing', '5.1 Types of drawings - Application; 5.2 Interpretation of drawings, diagrams and charts - Theory and application; 5.3 Station diagrams - Theory and application', 'drafting-compass', 0, 'S-SPS-05'),

-- 6.0 WEIGHT AND BALANCE
('Weight and Balance', '6.1 C of G design limits and range - knowledge and application; 6.2 Weighing procedures and calculations - knowledge and application', 'scale', 0, 'S-SPS-06'),

-- 7.0 METALURGY AND CORROSION PREVENTION
('Metalurgy and Corrosion Prevention', '7.1 Types of corrosion - Identification; 7.2 Inspection processes - Theory and application; 7.3 Removal and treatment of corrosion - Theory and application; 7.4 Heat treatment, annealing and temper designation - Theory and application; 7.5 Ferrous and non ferrous metals – Types and properties', 'shield', 0, 'S-SPS-07'),

-- 8.0 NONDESTRUCTIVE TESTING
('Nondestructive Testing', '8.1 Inspection techniques - Theory, types and application', 'scan-line', 0, 'S-SPS-08'),

-- 9.0 GENERAL HANDLING AND SERVICING
('General Handling and Servicing', '9.1 Shop safety - Theory and application; 9.2 Fire protection - Types, prevention and extinguishing; 9.3 Safety on the flight line - FOD and hazardous areas; 9.4 Ground servicing equipment - Theory and application', 'tool', 0, 'S-SPS-09'),

-- 10.0 TOOLS AND MEASURING DEVICES
('Tools and Measuring Devices', '10.1 Hand tools – Identification and use; 12.5 Power tools - Identification and use; 10.2 Measuring devices - Identification and use; 10.3 Test equipment - Identification and application', 'ruler', 0, 'S-SPS-10'),

-- 11.0 AIRCRAFT SHEET METAL, TUBULAR, WOOD AND COMPOSITE STRUCTURES
('Aircraft Sheet Metal, Tubular, Wood and Composite Structures', '11.1 Sheet metal materials; 11.2 Aircraft fabrics; 11.3 Wood; 11.4 Plastics, fiberglass and composite materials', 'layers', 0, 'S-SPS-11'),

-- 12.0 MAINTENANCE PROCEDURES
('Maintenance Procedures', '12.1 Inspection and maintenance requirements - Theory and application; 12.2 Inspections (periodic, annual, progressive, approved maintenance schedules); 12.3 Jacking, hoisting and leveling - Theory and application; 12.4 Basic welding - Theory and application; 12.5 Rivet layout pattern designs and installation - Theory and application', 'clipboard-check', 0, 'S-SPS-12')

on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;

commit;
