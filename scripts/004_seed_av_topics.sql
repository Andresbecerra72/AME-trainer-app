-- =====================================================
-- E RATING — AV (Avionics)
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

-- 24.0 NAVIGATION AND COMMUNICATION SYSTEMS
('Navigation and Communication Systems', '24.1 Radio waves and radio signals - Theory and application; 24.2 Antennas - Theory, construction, installation and inspection; 24.3 Communication - FM, VHF, HF systems - Theory, components and inspection; 24.4 Radio-Navigation systems - Theory, components and inspection; 24.5 Radio altimeter systems - Theory, components and inspection; 24.6 Weather radar – Theory, components and inspection; 24.7 RMI - Theory, components and inspection; 24.8 Ground Proximity Warning System - Theory, components and inspection/calibration; 24.9 Compass systems - Theory, components and inspection; 24.10 TCAS - Theory, construction and inspection', 'radio', 0, 'E-AV-24'),

-- 25.0 AUTOFLIGHT SYSTEMS
('Autoflight Systems', '25.1 Autopilot systems - Theory, components and inspection; 25.2 Flight Management Computer System - Theory, components and inspection; 25.3 Autothrottle and thrust management systems - Theory, components and operation; 25.4 Automatic landing system - Theory, components and operation; 25.5 Mach trim system - Theory, components and inspection', 'cpu', 0, 'E-AV-25'),

-- 26.0 ELECTRICAL SYSTEMS
('Electrical Systems', '26.1 Safety procedures around electrical equipment - Theory and application; 26.2 DC generation – Theory and application; 26.3 AC generation – Theory and application; 26.4 Batteries, nicad and lead acid – Theory, application and maintenance; 26.5 Power distribution - Theory and application; 26.6 Digital integrated circuits - Theory and application; 26.7 Aircraft electrical systems – Troubleshooting and repair; 26.8 Aircraft electrical systems - Wiring diagram interpretation; 26.9 Starter generator - Theory and application', 'battery', 0, 'E-AV-26'),

-- 27.0 RECORDING AND EMERGENCY SYSTEMS
('Recording and Emergency Systems', '27.1 Cockpit Voice Recorder (CVR) - Theory, components and inspection/test; 27.2 Flight Data Recorder (FDR) - Theory, components and inspection/test; 27.3 Emergency Locator Transmitter - Theory, components and inspection/test; 27.4 Underwater Location Device (ULD) - Theory, components and inspection/test', 'alert-triangle', 0, 'E-AV-27'),

-- 28.0 INSTRUMENT SYSTEMS
('Instrument Systems', '28.0 Flight instruments - Theory, construction and inspection; 28.1 Air Data Computer - Theory, construction and inspection', 'gauge', 0, 'E-AV-28')

on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;

commit;
