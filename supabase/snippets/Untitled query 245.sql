-- 1. Crear tabla question_imports
CREATE TABLE IF NOT EXISTS question_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_mime TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  raw_text TEXT,
  result JSONB,
  stats JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_question_imports_user_id ON question_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_question_imports_status ON question_imports(status);
CREATE INDEX IF NOT EXISTS idx_question_imports_created_at ON question_imports(created_at DESC);

-- 3. RLS policies para question_imports
ALTER TABLE question_imports ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propios imports
CREATE POLICY "Users can view own imports"
  ON question_imports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios imports
CREATE POLICY "Users can create own imports"
  ON question_imports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios imports
CREATE POLICY "Users can update own imports"
  ON question_imports
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios imports
CREATE POLICY "Users can delete own imports"
  ON question_imports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Los admins pueden ver todos los imports
CREATE POLICY "Admins can view all imports"
  ON question_imports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
