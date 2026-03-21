import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin';
import { AuthService } from '../../services/auth';
import { Magazzino, Ingrediente, IngredienteMagazzinoResponse, IngredienteMagazzinoRequest } from '../../models/admin-models';
import { finalize, switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-magazzini',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './magazzini.html'
})
export class MagazziniComponent implements OnInit {
  magazzini: Magazzino[] = [];
  tutteLeGiacenze: IngredienteMagazzinoResponse[] = [];
  ingredientiDisponibili: Ingrediente[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;

  nuovoMagazzino: Magazzino = {
    nome: '', via: '', civico: '', cap: '', citta: '', provincia: ''
  };

  // --- Variabili per Modale Inventario ---
  magazzinoSelezionato: Magazzino | null = null;
  giacenzeSelezionate: IngredienteMagazzinoResponse[] = [];
  isSavingGiacenza: boolean = false;

  nuovaGiacenza: IngredienteMagazzinoRequest = {
    magazzinoId: 0,
    ingredienteId: 0,
    quantita: 0,
    lotto: '',
    dataIngresso: new Date().toISOString().split('T')[0] // Data di oggi di default
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaDati();
  }

  caricaDati() {
    this.isLoading = true;

    forkJoin({
      magazzini: this.adminService.getMagazzini(),
      giacenze: this.adminService.getIngredienteMagazzino(),
      ingredienti: this.adminService.getIngredienti()
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.magazzini = res.magazzini;
        this.tutteLeGiacenze = res.giacenze;
        // Filtriamo per sicurezza eventuali ingredienti non correttamente mappati
        this.ingredientiDisponibili = res.ingredienti.filter((i: any) => i.id != null);
      },
      error: (err) => console.error('Errore nel caricamento dati:', err)
    });
  }

  salvaMagazzino(form: any) {
    this.isSaving = true;
    this.adminService.addMagazzino(this.nuovoMagazzino).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        alert('Magazzino aggiunto con successo!');
        this.caricaDati();
        form.resetForm(); // Usa resetForm per pulire anche gli stati di validazione
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante il salvataggio del magazzino.');
      }
    });
  }

  // --- GESTIONE INVENTARIO ---

  apriInventario(magazzino: Magazzino) {
    this.magazzinoSelezionato = magazzino;
    this.aggiornaGiacenzeSelezionate();

    // Inizializza il form vuoto. Ora magazzino.id esiste! 🎉
    this.nuovaGiacenza = {
      magazzinoId: magazzino.id!,
      ingredienteId: 0,
      quantita: 0,
      lotto: '',
      dataIngresso: new Date().toISOString().split('T')[0]
    };

    // Log di controllo (puoi rimuoverlo quando tutto funziona)
    console.log("Apertura inventario. ID Magazzino:", magazzino.id);
  }

  aggiornaGiacenzeSelezionate() {
    if (this.magazzinoSelezionato?.id) {
      // Ora questo filtro funzionerà perfettamente
      this.giacenzeSelezionate = this.tutteLeGiacenze.filter(g => g.magazzinoId === this.magazzinoSelezionato!.id);
    } else {
      this.giacenzeSelezionate = [];
    }
  }

  salvaGiacenza(form: any) {
    if (!this.magazzinoSelezionato?.id || this.nuovaGiacenza.ingredienteId === 0) {
      alert("Errore: Assicurati di aver selezionato un ingrediente.");
      return;
    }

    this.isSavingGiacenza = true;
    this.nuovaGiacenza.magazzinoId = this.magazzinoSelezionato.id;

    this.adminService.addIngredienteMagazzino(this.nuovaGiacenza).pipe(
      // Aggiorniamo la lista globale dal backend subito dopo aver salvato
      switchMap(() => this.adminService.getIngredienteMagazzino()),
      finalize(() => {
        this.isSavingGiacenza = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (giacenzeAggiornate) => {
        // Aggiorniamo i dati nella vista
        this.tutteLeGiacenze = giacenzeAggiornate;
        this.aggiornaGiacenzeSelezionate();

        // Resettiamo il form per un nuovo inserimento
        this.nuovaGiacenza = {
          magazzinoId: this.magazzinoSelezionato!.id!,
          ingredienteId: 0,
          quantita: 0,
          lotto: '',
          dataIngresso: new Date().toISOString().split('T')[0]
        };

        form.resetForm(this.nuovaGiacenza);
      },
      error: (err) => {
        console.error("Errore API salvataggio:", err);
        alert("Errore durante il caricamento della merce. Controlla la console per i dettagli.");
      }
    });
  }
}
