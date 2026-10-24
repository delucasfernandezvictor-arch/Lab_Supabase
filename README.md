# Lab_Supabase · Gestión de clientes con roles

Aplicación multiplataforma (web y Android) para gestionar clientes con autenticación y control de acceso por roles sobre Supabase.

**Demo:** https://lab-supabase.vercel.app

## Funcionalidades
- Listado público de clientes (solo lectura) con refresco por gesto.
- Alta, edición y borrado de clientes reservados al rol **admin**.
- Inicio de sesión bajo demanda: el login se abre solo cuando intentas escribir.
- Galería de imágenes servida desde Supabase Storage.
- Navegación por pestañas (Clientes / Galería) y versión Android con Capacitor.

## Seguridad
- **Autenticación** con Supabase Auth (email y contraseña).
- **Roles (RBAC):** tabla `profiles` con un enum `admin` / `user` vinculada a `auth.users` ([`supabase/roles.sql`](supabase/roles.sql)).
- **Row Level Security:** la base de datos solo permite escribir a usuarios autenticados con rol admin, aunque alguien se salte la interfaz ([`supabase/rls.sql`](supabase/rls.sql)).
- La app detecta cuando RLS bloquea una operación y avisa al usuario.
- En el cliente solo se usa la clave publicable de Supabase, nunca la `service_role`.

## Tecnologías
Ionic 9 · Angular 22 (Standalone, Signals) · TypeScript · Supabase (PostgreSQL, Auth, Storage, RLS) · Capacitor (Android) · Vercel

## Instalación
```bash
git clone https://github.com/delucasfernandezvictor-arch/Lab_Supabase.git
cd Lab_Supabase
npm install
ionic serve
```
Para usar tu propio proyecto de Supabase, cambia `supabaseUrl` y `supabaseKey` en `src/environments/` y ejecuta `supabase/roles.sql` y después `supabase/rls.sql` en el SQL Editor.

Android: `npx cap sync android` y abrir la carpeta `android/` en Android Studio.

## Qué he aprendido
- Que la seguridad real está en la base de datos (RLS), no en ocultar botones en el frontend.
- Gestionar el estado de sesión y rol con Signals de Angular.

## Autor
Víctor de Lucas Fernández · [LinkedIn](https://www.linkedin.com/in/victor-de-lucas-fernandez-37b709294/)
