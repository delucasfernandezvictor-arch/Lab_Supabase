import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonImg, IonRefresher, IonRefresherContent,
  IonSkeletonText, IonText, IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { imageOutline } from 'ionicons/icons';
import { SupabaseService } from '../services/supabase';
import { Imagen } from '../models/imagen';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.page.html',
  styleUrls: ['./galeria.page.scss'],
  imports: [
    DatePipe, DecimalPipe, IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonImg, IonRefresher,
    IonRefresherContent, IonSkeletonText, IonText, IonIcon,
  ],
})
export class GaleriaPage implements OnInit {
  private supabase = inject(SupabaseService);

  imagenes = signal<Imagen[]>([]);
  cargando = signal(true);
  errorMsg = signal('');

  constructor() {
    addIcons({ imageOutline });
  }

  async ngOnInit() {
    await this.loadImagenes();
  }

  async loadImagenes() {
    this.errorMsg.set('');
    try {
      this.imagenes.set(await this.supabase.getImagenes());
    } catch (e: any) {
      this.errorMsg.set('Error cargando imágenes: ' + e.message);
    } finally {
      this.cargando.set(false);
    }
  }

  async refresh(event: CustomEvent) {
    await this.loadImagenes();
    (event.target as HTMLIonRefresherElement).complete();
  }
}
