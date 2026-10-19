// Refleja la tabla public.clientes creada en Supabase (Table Editor)
export interface Cliente {
  id?: number;            // int8, clave primaria (identity)
  created_at?: string;    // timestamptz, default now()
  nombre: string;         // varchar
  ciudad: string;         // varchar
  fecha_de_alta: string;  // date (YYYY-MM-DD)
}

export type UserRole = 'admin' | 'user';
