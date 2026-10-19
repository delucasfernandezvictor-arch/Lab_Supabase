// Archivo del bucket "galeria" de Supabase Storage
export interface Imagen {
  nombre: string;
  url: string;          // URL pública (el bucket es público)
  tamano: number;       // bytes
  created_at: string;
}
