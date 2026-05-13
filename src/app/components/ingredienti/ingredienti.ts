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
  isGeneratingAi: boolean = false;

  // Variabili per la modale dei dettagli
  ingredienteSelezionato: Ingrediente | null = null;
  valoriSelezionati: any = null;
  allergeniSelezionati: any[] = [];

  // Variabile per l'ingrediente in modifica
  ingredienteInModifica: Ingrediente | null = null;

  isLoading: boolean = false;
  isSaving: boolean = false;

  nuovoIngrediente: Ingrediente = this.getOggettoVuoto();

  // SWITCH PER L'IA DEI VALORI NUTRIZIONALI (In Creazione - Attivo di default)
  usaIA_ValoriNutrizionali: boolean = true;

  // SWITCH PER L'IA DEI VALORI NUTRIZIONALI (In Modifica - Spento di default per sicurezza)
  usaIA_ModificaValoriNutrizionali: boolean = false;

  constructor(private adminService: AdminService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.caricaDati();
  }

  getOggettoVuoto(): Ingrediente {
    return {
      ean: '', nome: '', descrizione: '', unitaMisura: 'g', pesoPerPezzo: undefined, prezzoPerUnita: 0, attivo: true,
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

    // FIX: Legge i valori nutrizionali direttamente dall'ingrediente, ignorando possibili problemi della lista separata!
    if (ing.valoriNutrizionali) {
      this.valoriSelezionati = ing.valoriNutrizionali;
    } else {
      // Fallback più sicuro (cerca per id o nome senza errori di maiuscole/minuscole)
      this.valoriSelezionati = this.tuttiValoriNutrizionali.find((v: any) =>
        v.ingredienteId === ing.id || v.nome_Ingrediente === ing.nome || v.nomeIngrediente === ing.nome
      );
    }

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

    // Pulisci il peso se non è a pezzi prima di inviare al backend
    if (this.nuovoIngrediente.unitaMisura !== 'pz') {
      this.nuovoIngrediente.pesoPerPezzo = undefined;
    }

    // Creiamo una copia dell'oggetto per evitare di modificare il form visualmente
    let ingredienteDaSalvare = { ...this.nuovoIngrediente };

    // Se stiamo usando l'IA, i valori nutrizionali devono essere inviati come null
    if (this.usaIA_ValoriNutrizionali) {
      ingredienteDaSalvare.valoriNutrizionali = null as any;
    }

    this.isSaving = true;
    this.adminService.addIngrediente(ingredienteDaSalvare).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert('Ingrediente salvato con successo!');
        this.caricaDati();
        this.nuovoIngrediente = this.getOggettoVuoto();
        this.usaIA_ValoriNutrizionali = true; // Resettiamo lo switch a true
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Errore! Verifica i campi inseriti. (Controlla la console)');
      }
    });
  }

  // --- NUOVO METODO: Generazione Ingredienti con Intelligenza Artificiale ---
  generaConIA() {
    const input = prompt("Quanti ingredienti vuoi inventare con l'Intelligenza Artificiale?", "3");
    const quantita = parseInt(input || '0', 10);

    if (quantita > 0) {
      this.isGeneratingAi = true; // Mostra il caricamento

      // Chiama il metodo nel tuo AdminService
      this.adminService.generaIngredientiAi(quantita).pipe(
        finalize(() => {
          this.isGeneratingAi = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (nuoviIngredienti: any[]) => {
          alert(`Successo! L'IA ha creato e inserito nel magazzino ${nuoviIngredienti.length} nuovi ingredienti.`);
          this.caricaDati(); // Ricarica la tabella
        },
        error: (err) => {
          console.error("Errore IA:", err);
          alert("Ops! C'è stato un problema durante la generazione AI. Assicurati di avere almeno un fornitore registrato.");
        }
      });
    }
  }

  // --- METODI PER MODIFICA E CANCELLAZIONE ---

  apriModaleModifica(ing: any) {
    this.usaIA_ModificaValoriNutrizionali = false; // Resetta lo switch IA ogni volta che si apre la modale
    this.ingredienteInModifica = { ...ing };

    // FIX: Ricolleghiamo la partitaIvaFornitore al campo partitaIva per far funzionare la tendina <select>
    if (this.ingredienteInModifica) {
      this.ingredienteInModifica.partitaIva = ing.partitaIvaFornitore || ing.partitaIva;

      // FIX: Prendi direttamente l'oggetto valori nutrizionali già salvato nell'ingrediente
      if (ing.valoriNutrizionali) {
        this.ingredienteInModifica.valoriNutrizionali = { ...ing.valoriNutrizionali };
      } else {
        // Fallback di sicurezza: Inizializza a zero se non esistono
        this.ingredienteInModifica.valoriNutrizionali = {
          chilocalorie: 0, proteine: 0, carboidrati: 0, zuccheri: 0, grassi: 0, fibre: 0, sale: 0
        };

        // Ulteriore fallback dalla lista esterna
        if (this.tuttiValoriNutrizionali) {
          const valoriEsistenti = this.tuttiValoriNutrizionali.find((v: any) =>
            v.ingredienteId === ing.id || v.nome_Ingrediente === ing.nome || v.nomeIngrediente === ing.nome
          );
          if (valoriEsistenti) {
            this.ingredienteInModifica.valoriNutrizionali = { ...valoriEsistenti };
          }
        }
      }
    }
  }

  salvaModificaIngrediente() {
    if (this.ingredienteInModifica && this.ingredienteInModifica.id) {
      this.isSaving = true;

      // --- INIZIO AGGIUNTA IA ---
      // Se l'utente ha scelto di usare l'IA per ricalcolare, inviamo null
      let valoriDaInviare = this.ingredienteInModifica.valoriNutrizionali;
      if (this.usaIA_ModificaValoriNutrizionali) {
        valoriDaInviare = null as any;
      }
      // --- FINE AGGIUNTA IA ---

      // Costruiamo un oggetto pulito per il backend
      const ingDaModificare = {
        ean: this.ingredienteInModifica.ean,
        partitaIva: this.ingredienteInModifica.partitaIva,
        nome: this.ingredienteInModifica.nome,
        descrizione: this.ingredienteInModifica.descrizione,
        prezzoPerUnita: this.ingredienteInModifica.prezzoPerUnita,
        unitaMisura: this.ingredienteInModifica.unitaMisura,
        // Invia il peso per pezzo SOLO se l'unità è a pezzi
        pesoPerPezzo: this.ingredienteInModifica.unitaMisura === 'pz' ? this.ingredienteInModifica.pesoPerPezzo : undefined,
        attivo: this.ingredienteInModifica.attivo,
        valoriNutrizionali: valoriDaInviare // Invia null se l'IA è attiva, altrimenti i valori compilati
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
