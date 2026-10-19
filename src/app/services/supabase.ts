import { Injectable, computed, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Cliente, UserRole } from '../models/cliente';
import { Imagen } from '../models/imagen';

const BUCKET = 'galeria';
const EXTENSIONES_IMAGEN = /\.(png|jpe?g|gif|webp|svg|avif)$/i;

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Señales reactivas para el estado global
  readonly currentUser = signal<User | null>(null);
  readonly userRole = signal<UserRole | null>(null);
  readonly isAdmin = computed(() => this.userRole() === 'admin');

  // Promesa que se resuelve cuando se ha recuperado la sesión guardada (la usa el guard)
  readonly ready: Promise<void>;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.ready = this.initSession();

    // Mantiene las señales sincronizadas con login / logout / refresco de token
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
      if (!session) this.userRole.set(null);
    });
  }

  // --- AUTENTICACIÓN Y ROLES ---
  private async initSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.currentUser.set(session.user);
      await this.loadRole(session.user.id);
    }
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.currentUser.set(data.user);
    await this.loadRole(data.user.id);
  }

  async logout() {
    // Primero se limpia la interfaz y luego se cierra la sesión en Supabase
    this.currentUser.set(null);
    this.userRole.set(null);
    await this.supabase.auth.signOut();
  }

  // Lee el rol de la tabla profiles. Si no hay fila, el usuario es 'user' (solo lectura)
  private async loadRole(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    this.userRole.set(!error && data?.role === 'admin' ? 'admin' : 'user');
  }

  // --- CRUD CLIENTES ---
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await this.supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async createCliente(cliente: Cliente): Promise<void> {
    const { error } = await this.supabase.from('clientes').insert([{
      nombre: cliente.nombre,
      ciudad: cliente.ciudad,
      fecha_de_alta: cliente.fecha_de_alta,
    }]);
    if (error) throw error;
  }

  async updateCliente(id: number, cliente: Partial<Cliente>): Promise<void> {
    const { data, error } = await this.supabase.from('clientes').update(cliente).eq('id', id).select();
    if (error) throw error;
    if (!data?.length) throw new Error('Sin permisos para actualizar (RLS)');
  }

  async deleteCliente(id: number): Promise<void> {
    // Con RLS, un DELETE bloqueado no da error: simplemente no borra filas.
    // Pedimos la fila borrada para detectar ese caso.
    const { data, error } = await this.supabase.from('clientes').delete().eq('id', id).select();
    if (error) throw error;
    if (!data?.length) throw new Error('Sin permisos para borrar (RLS)');
  }

  // --- STORAGE: GALERÍA ---
  // Listar requiere una política SELECT en storage.objects aunque el bucket sea público
  async getImagenes(): Promise<Imagen[]> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET)
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;

    return (data ?? [])
      .filter((f) => EXTENSIONES_IMAGEN.test(f.name))
      .map((f) => ({
        nombre: f.name,
        url: this.supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
        tamano: f.metadata?.['size'] ?? 0,
        created_at: f.created_at ?? '',
      }));
  }
}
