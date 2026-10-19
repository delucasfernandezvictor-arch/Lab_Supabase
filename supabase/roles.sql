-- La tabla public.clientes ya está creada desde el Table Editor (sin RLS, según indicación de clase).
-- Este script solo añade el control de roles (RBAC) que pide el laboratorio.
-- Ejecútalo en Supabase > SQL Editor.

-- 1. Enumeración de roles
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- 2. Tabla de perfiles vinculada a Supabase Auth
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role public.user_role DEFAULT 'user' NOT NULL
);

-- 3. Dar rol admin al usuario creado en Authentication (juan@gmail.com)
INSERT INTO public.profiles (id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'juan@gmail.com';

-- (Opcional) Usuario de solo lectura para probar la interfaz por roles:
-- crea otro usuario en Authentication y ejecuta:
-- INSERT INTO public.profiles (id, role)
-- SELECT id, 'user' FROM auth.users WHERE email = 'ana@gmail.com';
