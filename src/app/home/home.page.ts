import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
  IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonButton, IonButtons,
  IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast,
  IonGrid, IonRow, IonCol, IonBadge, IonListHeader, IonNote, IonRefresher,
  IonRefresherContent, AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, logOutOutline, locationOutline, calendarOutline } from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';
import { Cliente } from '../models/cliente';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    DatePipe, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, IonButton,
    IonButtons, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast,
    IonGrid, IonRow, IonCol, IonBadge, IonListHeader, IonNote, IonRefresher, IonRefresherContent,
  ],
})
export class HomePage implements OnInit {
  private supabase = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  clientes = signal<Cliente[]>([]);
  editingId = signal<number | null>(null);
  toastMessage = signal('');
  isToastOpen = signal(false);

  // Señales del servicio expuestas a la vista
  isAdmin = this.supabase.isAdmin;
  userRole = this.supabase.userRole;
  user = this.supabase.currentUser;

  clienteForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    ciudad: ['', Validators.required],
    fecha_de_alta: ['', Validators.required],
  });

  constructor() {
    addIcons({ createOutline, trashOutline, logOutOutline, locationOutline, calendarOutline });
  }

  async ngOnInit() {
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

  async saveCliente() {
    if (this.clienteForm.invalid) return;
    try {
      const value = this.clienteForm.getRawValue();
      const id = this.editingId();
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
      this.showToast('Error de guardado (¿Eres admin?): ' + e.message);
    }
  }

  editCliente(cliente: Cliente, sliding?: IonItemSliding) {
    sliding?.close();
    this.editingId.set(cliente.id!);
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      ciudad: cliente.ciudad,
      fecha_de_alta: cliente.fecha_de_alta,
    });
  }

  async confirmDelete(cliente: Cliente, sliding?: IonItemSliding) {
    sliding?.close();
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
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    this.isToastOpen.set(true);
  }
}
