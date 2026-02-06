-- =====================================================
-- E RATING — SPE (Standard Practices Avionics)
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
('Standard Practices', '1.1 Safety practices; 1.2 Chemical and physical nature of matter - Theory and application; 1.3 Gas laws and fluid mechanics - Theory and application; 1.4 Properties of the atmosphere - Pressure, humidity, density characteristics; 1.5 Properties of solids and liquids - Theory and application; 1.6 Velocity, acceleration, mass and force - Theory and calculation; 1.7 Heat, temperature, heat transfer and measurement - Calculation; 1.8 Work, energy and power - Theory and calculation; 1.9 Sound production, reproduction, propagation, speed and quality - Calculation; 1.10 Light propagation, reflection and refraction - Theory; 1.11 Aircraft electrical wiring - Lacing, clamping, crimping, splicing and routing, including safety precautions; 1.12 Aircraft electrical wiring - Grounding, bonding and shielding; 1.13 Soldering and desoldering techniques; 1.14 Instrument panel layout and instrument mounting; 1.15 Measurement systems and conversion – Calculation; 1.16 Shop mathematics, graphs and charts - Theory and application; 1.17 Aircraft electrical load analysis - Theory and calculation; 1.18 ATA Specification 100 - Chapters relevant to maintenance of aircraft systems; 1.19 Safety wiring (lock wiring) procedures', 'wrench', 0, 'E-SPE-01'),

-- 2.0 AERODYNAMICS
('Aerodynamics', '2.1 Theory of flight - Fixed wing aircraft; 2.2 Theory of flight - Rotary wing aircraft', 'wind', 0, 'E-SPE-02'),

-- 3.0 AIRCRAFT HARDWARE
('Aircraft Hardware', '3.1 Specifications and standards - Basic theory and application; 3.2 Electrical hardware - Terminals, splices, connectors, switches, protective devices; 3.3 Aircraft electrical wiring - Types, characteristics, wire sizes; 3.4 Special fasteners - Theory and application; 3.5 Rivets - Identification and use; 3.6 Threaded fasteners - Identification and use; 3.7 Control cables, terminals and turnbuckles - Identification and use', 'package', 0, 'E-SPE-03'),

-- 4.0 AIRCRAFT DRAWING
('Aircraft Drawing', '4.1 Types of drawings - Application; 4.2 Interpretation of drawings, diagrams and charts - Theory and application; 4.3 Station diagrams - Theory and application', 'drafting-compass', 0, 'E-SPE-04'),

-- 5.0 WEIGHT AND BALANCE
('Weight and Balance', '5.1 C of G design limits and range - Knowledge and application; 5.2 Weighing procedures and calculations - Knowledge and application', 'scale', 0, 'E-SPE-05'),

-- 6.0 PITOT STATIC SYSTEMS
('Pitot Static Systems', '6.1 Types - Identification; 6.2 Inspection processes - Theory and application', 'gauge', 0, 'E-SPE-06'),

-- 7.0 METALURGY AND CORROSION PREVENTION
('Metalurgy and Corrosion Prevention', '7.1 Types of corrosion - Identification; 7.2 Inspection processes - Theory and application; 7.3 Removal and treatment of corrosion - Theory and application', 'shield', 0, 'E-SPE-07'),

-- 8.0 STRUCTURES
('Structures', '8.1 Aircraft structures - Fixed wing aircraft; 8.2 Aircraft structures - Rotary wing aircraft', 'box', 0, 'E-SPE-08'),

-- 9.0 FLIGHT CONTROLS AND RIGGING
('Flight Controls and Rigging', '9.1 Flight control systems - Theory, types and application', 'move', 0, 'E-SPE-09'),

-- 10.0 NONDESTRUCTIVE TESTING
('Nondestructive Testing', '10.1 Inspection techniques - Theory, types and application', 'scan-line', 0, 'E-SPE-10'),

-- 11.0 GENERAL HANDLING AND SERVICING
('General Handling and Servicing', '11.1 Shop safety - Theory and application; 11.2 Fire protection - Types, prevention and extinguishing; 11.3 Safety on the flight line – Foreign Object Damage (FOD) and hazardous areas; 11.4 Jacking, hoisting and leveling - Theory and application; 11.5 Ground servicing equipment - Theory and application', 'tool', 0, 'E-SPE-11'),

-- 12.0 TOOLS AND MEASURING DEVICES
('Tools and Measuring Devices', '12.1 Hand tools - Identification and use; 12.2 Power tools - Identification and use; 12.3 Measuring devices - Identification and use; 12.4 Test equipment - Identification and application', 'ruler', 0, 'E-SPE-12'),

-- 13.0 SHEET METAL
('Sheet Metal', '13.1 Structural and non-structural repairs - Identification and modification requirements; 13.2 Special fasteners - Theory and application; 13.3 Scratch inspection - Theory and application; 13.4 Sealant - Theory and application', 'layout', 0, 'E-SPE-13'),

-- 14.0 POWERPLANT
('Powerplant', '14.1 Piston Engines – Theory and application; 14.2 Turbine Engines – Theory and application', 'fan', 0, 'E-SPE-14'),

-- 15.0 FUEL SYSTEMS
('Fuel Systems', '15.1 Storage and Distribution - Theory and application', 'fuel', 0, 'E-SPE-15'),

-- 16.0 HYDRAULIC AND PNEUMATIC SYSTEMS
('Hydraulic and Pneumatic Systems', '16.1 Sources and common application - Theory and application; 16.2 Operation and components - Theory and application; 16.3 Maintenance and service - Theory and application; 16.4 Storage and distribution – Theory and application', 'droplet', 0, 'E-SPE-16'),

-- 17.0 FIRE PROTECTION
('Fire Protection', '17.1 Detection, and suppression – Theory and application', 'flame', 0, 'E-SPE-17'),

-- 18.0 IGNITION SYSTEMS
('Ignition Systems', '18.1 Low, high tension - Theory and application', 'sparkles', 0, 'E-SPE-18'),

-- 19.0 ENVIRONMENTAL CONTROL SYSTEMS
('Environmental Control Systems', '19.1 Pressurization – Theory, application and function testing; 19.2 Air conditioning - Theory, application and function testing; 19.3 Ventilation - Theory, application and function testing; 19.4 Oxygen - Theory, application and function testing', 'cloud', 0, 'E-SPE-19'),

-- 20.0 LANDING GEAR SYSTEMS
('Landing Gear Systems', '20.1 Assemblies - Theory and application; 20.2 Retraction systems - Theory and application; 20.3 Indication systems - Theory and application; 20.4 Wheels and brakes - Theory and application; 20.5 Steering systems - Theory and application', 'circle-dot', 0, 'E-SPE-20'),

-- 21.0 STARTING SYSTEMS
('Starting Systems', '21.1 Turbine engine starters – Theory, application, inspection and servicing; 21.2 Electrical starters - Theory, application, inspection and servicing; 21.3 Starter-generators - Theory, application, inspection and servicing', 'power', 0, 'E-SPE-21'),

-- 22.0 ICE AND RAIN SYSTEMS
('Ice and Rain Systems', '22.1 Ice detection - Theory and application; 22.2 Anti-ice - Theory and application; 22.3 De-ice - Theory and application; 22.4 Rain repellant - Theory and application', 'snowflake', 0, 'E-SPE-22'),

-- 23.0 ELECTRICITY AND ELECTRONICS
('Electricity and Electronics', '23.1 Safety procedures around electrical equipment - Theory and application; 23.2 Sources of electrical energy - Basic theory; 23.3 Batteries, primary cells and secondary cells - Theory and application; 23.4 Magnetism/electromagnetism- Theory and application; 23.5 DC theory - Application; 23.6 AC theory - Application; 23.7 Power distribution - Theory and application; 23.8 Wiring practices - Theory and application; 23.9 Digital integrated circuits - Theory and application; 23.10 Solid-state devices - Theory and application; 23.11 Basic semiconductor circuits - Theory and application; 23.12 AC and DC Motors- Theory and application; 23.13 Switches and relays - Theory and application; 23.14 Fuses and circuit breakers - Theory and application; 23.15 Synchros - Theory and application; 23.16 Decimal, binary, hexadecimal and octal number systems - Computation and conversion; 23.17 Digital data display - Theory and application; 23.18 Boolean expressions, logic gates and truth tables - Theory and application; 23.19 Electrical load analysis – Theory and application', 'cpu', 0, 'E-SPE-23')

on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;

commit;
