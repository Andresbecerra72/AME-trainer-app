-- Insert sample topics for AME exam
INSERT INTO public.topics (name, code, description) VALUES
  ('Standard Practices', 'SP', 'General aircraft maintenance practices and procedures'),
  ('Regulations', 'REG', 'Aviation regulations and compliance'),
  ('Structures', 'S', 'Aircraft structural systems and components'),
  ('Powerplant', 'P', 'Engine systems and maintenance'),
  ('Electrical Systems', 'E', 'Aircraft electrical and electronic systems'),
  ('Instruments', 'I', 'Flight and engine instruments'),
  ('Propellers', 'PR', 'Propeller systems and maintenance'),
  ('Human Factors', 'HF', 'Human performance and limitations')
ON CONFLICT (code) DO NOTHING;
