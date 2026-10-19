import { Component, Input, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonInput,
  IonInputPasswordToggle, IonSpinner, IonText, IonNote, ModalController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline, lockClosedOutline } from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';

// Se abre como modal (ModalController) cuando una acción de escritura necesita sesión
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
    IonIcon, IonInput, IonInputPasswordToggle, IonSpinner, IonText, IonNote,
  ],
})
export class LoginPage {
  private supabase = inject(SupabaseService);
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);

  // Texto que explica por qué se pide el login (lo pasa HomePage en componentProps)
  @Input() motivo = 'Inicia sesión para continuar';

  loading = signal(false);
  errorMsg = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    addIcons({ closeOutline, lockClosedOutline });
  }

  async login() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.supabase.login(email, password);
      await this.modalCtrl.dismiss(true, 'login');
    } catch (e: any) {
      this.errorMsg.set('Credenciales incorrectas: ' + e.message);
    } finally {
      this.loading.set(false);
    }
  }

  cancelar() {
    this.modalCtrl.dismiss(false, 'cancel');
  }
}
