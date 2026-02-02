-- Crear bucket para question imports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-imports',
  'question-imports',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'text/plain', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

-- Configurar politicas de acceso
CREATE POLICY "Users can upload their own imports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'question-imports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own imports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'question-imports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own imports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'question-imports' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir al service role acceso completo
CREATE POLICY "Service role has full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'question-imports')
WITH CHECK (bucket_id = 'question-imports');
