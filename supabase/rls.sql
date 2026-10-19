-- =====================================================================
-- RLS (Row Level Security) para Lab_Supabase
-- Ejecutar en Supabase > SQL Editor DESPUÉS de roles.sql
--   · Cualquiera (anon) puede LEER clientes y LISTAR la galería
--   · Solo un usuario autenticado con rol 'admin' puede escribir en clientes
-- =====================================================================

-- 1. CLIENTES ----------------------------------------------------------
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Lectura pública (la app muestra la lista sin login)
CREATE POLICY "Lectura publica de clientes"
ON public.clientes FOR SELECT
TO anon, authenticated
USING (true);

-- Insertar, actualizar y borrar: solo usuarios logueados con rol admin
CREATE POLICY "Escritura solo para admins"
ON public.clientes FOR ALL
TO authenticated
USING      (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. PROFILES ----------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede leer su propio perfil (la app lee su rol al hacer login)
CREATE POLICY "Leer perfil propio"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3. STORAGE: bucket "galeria" ----------------------------------------
-- Aunque el bucket sea público, LISTAR sus archivos (storage.list) exige
-- una política SELECT sobre storage.objects. Sin ella la galería sale vacía.
CREATE POLICY "Listar imagenes de galeria"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'galeria');
