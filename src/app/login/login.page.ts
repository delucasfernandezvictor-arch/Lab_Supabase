import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle,
  IonCardSubtitle, IonCardContent, IonInput, IonInputPasswordToggle, IonButton,
  IonSpinner, IonText, IonGrid, IonRow, IonCol,
} from '@ionic/angular';
import { SupabaseService } from '../services/supabase';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonInput, IonInputPasswordToggle, IonButton,
    IonSpinner, IonText, IonGrid, IonRow, IonCol,
  ],
})
export class LoginPage {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  errorMsg = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async login() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.supabase.login(email, password);
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: any) {
      this.errorMsg.set('Credenciales incorrectas: ' + e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
