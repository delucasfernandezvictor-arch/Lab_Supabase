import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonButton, IonButtons,
  IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonToast,
  IonGrid, IonRow, IonCol, IonBadge, IonListHeader, IonNote, IonRefresher,
  IonRefresherContent, AlertController, ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  createOutline, trashOutline, logOutOutline, logInOutline, locationOutline, calendarOutline,
} from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';
import { Cliente } from '../models/cliente';
import { LoginPage } from '../login/login.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    DatePipe, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonButton,
    IonButtons, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonToast, IonGrid, IonRow, IonCol, IonBadge, IonListHeader, IonNote, IonRefresher,
    IonRefresherContent,
  ],
})
export class HomePage implements OnInit {
  private supabase = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController);

  clientes = signal<Cliente[]>([]);
  editingId = signal<number | null>(null);
  toastMessage = signal('');
  isToastOpen = signal(false);

  // Señales del servicio expuestas a la vista
  isAdmin = this.supabase.isAdmin;
  userRole = this.supabase.userRole;
  user = this.supabase.currentUser;

  // Sin sesión se muestran las acciones (al usarlas se pide login);
  // con sesión solo si el usuario es admin
  canWrite = computed(() => !this.user() || this.isAdmin());

  clienteForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    ciudad: ['', Validators.required],
    fecha_de_alta: ['', Validators.required],
  });

  constructor() {
    addIcons({ createOutline, trashOutline, logOutOutline, logInOutline, locationOutline, calendarOutline });
  }

  async ngOnInit() {
    await this.supabase.ready;
    await this.loadClientes();
  }

  async loadClientes() {
    try {
      this.clientes.set(await this.supabase.getClientes());
    } catch (e: any) {
      this.showToast('Error cargando clientes: ' + e.message);
    }
  }

  async refresh(event: CustomEvent) {
    await this.loadClientes();
    (event.target as HTMLIonRefresherElement).complete();
  }

  // --- LOGIN BAJO DEMANDA ---
  async openLogin(motivo = 'Inicia sesión con tu usuario de Supabase'): Promise<boolean> {
    const modal = await this.modalCtrl.create({ component: LoginPage, componentProps: { motivo } });
    await modal.present();
    const { role } = await modal.onWillDismiss();
    if (role === 'login') this.showToast(`Sesión iniciada como ${this.userRole()}`);
    return role === 'login';
  }

  // Antes de insertar, editar o borrar: exige sesión y rol admin
  private async requireLogin(motivo: string): Promise<boolean> {
    if (!this.user() && !(await this.openLogin(motivo))) return false;
    if (!this.isAdmin()) {
      this.showToast('Tu usuario no tiene rol admin: solo puedes consultar');
      return false;
    }
    return true;
  }

  // --- CRUD ---
  async saveCliente() {
    if (this.clienteForm.invalid) return;
    const id = this.editingId();
    if (!(await this.requireLogin(id !== null ? 'Inicia sesión para actualizar el cliente' : 'Inicia sesión para insertar el cliente'))) return;

    try {
      const value = this.clienteForm.getRawValue();
      if (id !== null) {
        await this.supabase.updateCliente(id, value);
        this.showToast('Cliente actualizado');
      } else {
        await this.supabase.createCliente(value);
        this.showToast('Cliente insertado');
      }
      this.resetForm();
      await this.loadClientes();
    } catch (e: any) {
      this.showToast('Error de guardado: ' + e.message);
    }
  }

  async editCliente(cliente: Cliente, sliding?: IonItemSliding) {
    sliding?.close();
    if (!(await this.requireLogin(`Inicia sesión para editar a ${cliente.nombre}`))) return;
    this.editingId.set(cliente.id!);
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      ciudad: cliente.ciudad,
      fecha_de_alta: cliente.fecha_de_alta,
    });
  }

  async confirmDelete(cliente: Cliente, sliding?: IonItemSliding) {
    sliding?.close();
    if (!(await this.requireLogin(`Inicia sesión para eliminar a ${cliente.nombre}`))) return;
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cliente',
      message: `¿Seguro que quieres eliminar a ${cliente.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.deleteCliente(cliente.id!) },
      ],
    });
    await alert.present();
  }

  async deleteCliente(id: number) {
    try {
      await this.supabase.deleteCliente(id);
      this.showToast('Cliente eliminado');
      await this.loadClientes();
    } catch (e: any) {
      this.showToast('Error eliminando: ' + e.message);
    }
  }

  resetForm() {
    this.clienteForm.reset();
    this.editingId.set(null);
  }

  async logout() {
    await this.supabase.logout();
    this.resetForm();
    this.showToast('Sesión cerrada');
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    this.isToastOpen.set(true);
  }
}
