import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { Ingrediente, Fornitore, Allergene } from '../../models/admin-models';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ingredienti',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ingredienti.html'
})
export class IngredientiComponent implements OnInit {
  ingredienti: Ingrediente[] = [];
  fornitori: Fornitore[] = [];
  allergeniList: Allergene[] = [];
  tuttiValoriNutrizionali: any[] = [];
  tuttiIngredientiAllergeni: any[] = [];
  ingredientiInattivi: any[] = [];
  isLoadingInattive: boolean = false;

  // Variabili per la modale dei dettagli
  ingredienteSelezionato: Ingrediente | null = null;
  valoriSelezionati: any = null;
  allergeniSelezionati: any[] = [];

  // Variabile per l'ingrediente in modifica
  ingredienteInModifica: Ingrediente | null = null;

  isLoading: boolean = false;
  isSaving: boolean = false;

  nuovoIngrediente: Ingrediente = this.getOggettoVuoto();

  constructor(private adminService: AdminService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.caricaDati();
  }

  getOggettoVuoto(): Ingrediente {
    return {
      ean: '', nome: '', descrizione: '', unitaMisura: 'g', prezzoPerUnita: 0, attivo: true,
      nomeFornitore:'', partitaIva: null,
      fornitoreId: null as any,
      valoriNutrizionali: { proteine: 0, carboidrati: 0, zuccheri: 0, fibre: 0, grassi: 0, sale: 0, chilocalorie: 0 },
      allergeniIds: []
    };
  }

  caricaDati() {
    this.isLoading = true;

    forkJoin({
      ingRes: this.adminService.getIngredienti(),
      fornRes: this.adminService.getFornitori(),
      allergRes: this.adminService.getAllergeni(),
      valoriRes: this.adminService.getTuttiValoriNutrizionali(),
      allergeniCollRes: this.adminService.getTuttiIngredientiAllergeni()
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (risultati: any) => {
        this.ingredienti = risultati.ingRes.content ? risultati.ingRes.content : risultati.ingRes;
        this.fornitori = risultati.fornRes.content ? risultati.fornRes.content : risultati.fornRes;
        this.allergeniList = risultati.allergRes;

        // Salviamo le liste globali per i dettagli
        this.tuttiValoriNutrizionali = risultati.valoriRes;
        this.tuttiIngredientiAllergeni = risultati.allergeniCollRes;
      },
      error: (err) => { console.error('Errore caricamento dati:', err); }
    });
  }

  toggleAllergene(id: number) {
    const index = this.nuovoIngrediente.allergeniIds.indexOf(id);
    if (index > -1) {
      this.nuovoIngrediente.allergeniIds.splice(index, 1);
    } else {
      this.nuovoIngrediente.allergeniIds.push(id);
    }
  }

  apriDettagli(ing: Ingrediente) {
    this.ingredienteSelezionato = ing;
    this.valoriSelezionati = this.tuttiValoriNutrizionali.find(v => v.nome_Ingrediente === ing.nome);

    let idsAllergeni: number[] = [];

    if (ing.allergeniIds && ing.allergeniIds.length > 0) {
      idsAllergeni = ing.allergeniIds;
    }
    else {
      idsAllergeni = this.tuttiIngredientiAllergeni
        .filter(a => a.ingredienteId === ing.id)
        .map(c => c.allergeneId);
    }

    this.allergeniSelezionati = this.allergeniList.filter(al => idsAllergeni.includes(al.id));
  }

  isAllergeneSelected(id: number): boolean {
    return this.nuovoIngrediente.allergeniIds.includes(id);
  }

  salvaIngrediente() {
    if (!this.nuovoIngrediente.partitaIva) {
      alert("Devi selezionare un fornitore nella prima scheda!");
      return;
    }

    this.isSaving = true;
    this.adminService.addIngrediente(this.nuovoIngrediente).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert('Ingrediente salvato con Valori Nutrizionali e Allergeni!');
        this.caricaDati();
        this.nuovoIngrediente = this.getOggettoVuoto();
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Errore! Verifica i campi inseriti. (Controlla la console)');
      }
    });
  }

  // --- METODI PER MODIFICA E CANCELLAZIONE ---

  apriModaleModifica(ing: any) {
    this.ingredienteInModifica = { ...ing };

    // FIX: Ricolleghiamo la partitaIvaFornitore al campo partitaIva per far funzionare la tendina <select>
    if (this.ingredienteInModifica) {
      this.ingredienteInModifica.partitaIva = ing.partitaIvaFornitore || ing.partitaIva;

      // Inizializziamo un oggetto vuoto per i valori nutrizionali per sicurezza
      this.ingredienteInModifica.valoriNutrizionali = {
        chilocalorie: 0, proteine: 0, carboidrati: 0, zuccheri: 0, grassi: 0, fibre: 0, sale: 0
      };

      // FIX: Usiamo 'tuttiValoriNutrizionali' invece di 'valoriNutrizionali'
      if (this.tuttiValoriNutrizionali) {
        const valoriEsistenti = this.tuttiValoriNutrizionali.find((v: any) => v.nome_Ingrediente === ing.nome);
        if (valoriEsistenti) {
          this.ingredienteInModifica.valoriNutrizionali = { ...valoriEsistenti };
        }
      }
    }
  }

  salvaModificaIngrediente() {
    if (this.ingredienteInModifica && this.ingredienteInModifica.id) {
      this.isSaving = true;

      // Costruiamo un oggetto pulito per il backend
      const ingDaModificare = {
        ean: this.ingredienteInModifica.ean,
        partitaIva: this.ingredienteInModifica.partitaIva,
        nome: this.ingredienteInModifica.nome,
        descrizione: this.ingredienteInModifica.descrizione,
        prezzoPerUnita: this.ingredienteInModifica.prezzoPerUnita,
        unitaMisura: this.ingredienteInModifica.unitaMisura,
        attivo: this.ingredienteInModifica.attivo,
        valoriNutrizionali: this.ingredienteInModifica.valoriNutrizionali
      };

      // Facciamo il cast ad any per bypassare controlli TypeScript extra
      this.adminService.updateIngrediente(this.ingredienteInModifica.id, ingDaModificare as any).pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          alert('Ingrediente aggiornato con successo!');
          this.ingredienteInModifica = null;
          this.caricaDati();
        },
        error: (err) => {
          console.error('Errore aggiornamento ingrediente:', err);
          alert('Impossibile aggiornare l\'ingrediente.');
        }
      });
    }
  }

  onDeleteIngrediente(id: number | undefined) {
    if (!id) return;
    if (confirm('Sei sicuro di voler disattivare questo ingrediente?')) {
      this.adminService.deleteIngrediente(id).subscribe({
        next: () => {
          alert('Ingrediente rimosso/disattivato con successo!');
          this.caricaDati();
        },
        error: (err) => {
          console.error('Errore durante la rimozione', err);
          alert('Impossibile rimuovere l\'ingrediente.');
        }
      });
    }
  }

  apriModaleInattive() {
    this.isLoadingInattive = true;
    this.adminService.getIngredientiInattivi().pipe(
      finalize(() => {
        this.isLoadingInattive = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.ingredientiInattivi = res;
      },
      error: (err) => { console.error('Errore nel caricamento ingredienti inattivi:', err); }
    });
  }

  riattivaIngrediente(ing: any) {
    if (confirm(`Vuoi riattivare l'ingrediente "${ing.nome}" per poterlo usare di nuovo nelle Box?`)) {

      const ingDaRiattivare = {
        ean: ing.ean,
        partitaIva: ing.partitaIvaFornitore,
        nome: ing.nome,
        descrizione: ing.descrizione,
        prezzoPerUnita: ing.prezzoPerUnita,
        unitaMisura: ing.unitaMisura,
        attivo: true,
        valoriNutrizionali: {
          chilocalorie: 0, proteine: 0, carboidrati: 0,
          zuccheri: 0, grassi: 0, fibre: 0, sale: 0
        }
      };

      this.adminService.updateIngrediente(ing.id, ingDaRiattivare as any).subscribe({
        next: () => {
          alert('Ingrediente riattivato con successo!');
          this.apriModaleInattive();
          this.caricaDati();
        },
        error: (err: any) => {
          console.error('Errore durante la riattivazione:', err);
          alert('Errore durante la riattivazione.');
        }
      });
    }
  }

}
