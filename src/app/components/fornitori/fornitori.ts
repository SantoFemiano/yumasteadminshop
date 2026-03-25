import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin';
import { AuthService } from '../../services/auth';
import { Fornitore } from '../../models/admin-models';
import { finalize } from 'rxjs/operators';
import { NavbarComponent} from '../navbar/navbar';

@Component({
  selector: 'app-fornitori', // Ho corretto il selettore (prima era app-dashboard)
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './fornitori.html',
  styleUrl: './fornitori.css' // Se hai il file css, altrimenti puoi toglierlo
})
export class FornitoriComponent implements OnInit {
  fornitori: Fornitore[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  nuovoFornitore: Fornitore = {
    partitaIva: '', nome: '', via: '', civico: '', cap: '', citta: '', provincia: ''
  };

  // Variabile per memorizzare il fornitore attualmente in modifica
  fornitoreInModifica: Fornitore | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaFornitori();
  }

  caricaFornitori() {
    this.isLoading = true;

    this.adminService.getFornitori().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (dati) => {
        this.fornitori = dati;
      },
      error: (err) => {
        console.error('Errore durante il caricamento fornitori:', err);
      }
    });
  }

  salvaFornitore(form: any) {
    this.isSaving = true;
    this.adminService.addFornitore(this.nuovoFornitore).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        alert('Fornitore aggiunto con successo!');
        this.caricaFornitori();
        form.reset();
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Errore! Controlla i dati o la Partita IVA (potrebbe esistere già).');
      }
    });
  }

  // --- LOGICA MODIFICA ---
  apriModaleModifica(fornitore: Fornitore) {
    // Creiamo una copia per non modificare i dati in tabella finché non salviamo
    this.fornitoreInModifica = { ...fornitore };
  }

  salvaModificaFornitore() {
    // In un sistema reale, per i fornitori la P.IVA di solito fa da ID.
    // Assicurati che l'ID primario sia presente (nel tuo model potrebbe essere "id" o "partitaIva")
    // Se usi un ID numerico classico:
    if (this.fornitoreInModifica && this.fornitoreInModifica.id) {
      this.isSaving = true;
      this.adminService.updateFornitore(this.fornitoreInModifica.id, this.fornitoreInModifica).pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          alert('Fornitore aggiornato con successo!');
          this.fornitoreInModifica = null; // Chiude il modale logicamente
          this.caricaFornitori(); // Ricarica tabella
        },
        error: (err) => {
          console.error('Errore aggiornamento fornitore:', err);
          alert('Impossibile aggiornare il fornitore.');
        }
      });
    } else {
      alert("Errore: ID fornitore mancante.");
    }
  }

  // --- LOGICA ELIMINAZIONE ---
  onDeleteFornitore(id: number | undefined) {
    if (!id) return;
    if (confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      this.adminService.deleteFornitore(id).subscribe({
        next: () => {
          alert('Fornitore eliminato con successo!');
          this.caricaFornitori();
        },
        error: (err) => {
          console.error('Errore durante l\'eliminazione', err);
          alert('Impossibile eliminare il fornitore. Potrebbe essere collegato a degli ingredienti.');
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
