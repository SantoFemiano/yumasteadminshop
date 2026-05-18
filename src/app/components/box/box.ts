import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { Box, Ingrediente, AiGenerateBoxResponseDTO, AiBoxIngredientDTO } from '../../models/admin-models';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './box.html'
})
export class BoxComponent implements OnInit {
  boxes: Box[] = [];
  boxesInattive: Box[] = [];
  isLoading: boolean = false;
  isLoadingInattive: boolean = false;
  isSaving: boolean = false;

  boxSelezionataDettagli: any = null;
  isLoadingDettagli: boolean = false;
  boxInModifica: Box | null = null;

  nuovaBox: Box = {
    ean: '', nome: '', categoria: '', prezzo: 0, prezzoScontato: 0, percentualeSconto: 0, porzioni: 1, quantitaInBox: 1, immagineUrl: '', attivo: true
  };

  // --- VARIABILI IA ---
  isGeneratingAi: boolean = false;
  suggerimentoAi: string = '';
  ingredientiDisponibili: Ingrediente[] = [];
  ingredientiGenerati: AiBoxIngredientDTO[] = [];

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaBoxes();
    this.caricaIngredienti();
  }

  caricaBoxes() {
    this.isLoading = true;
    this.adminService.getBoxes().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.boxes = response.content ? response.content : response;
      },
      error: (err) => { console.error('Errore nel caricamento box:', err); }
    });
  }

  // Carica gli ingredienti dal DB per permettere a Gemini (e all'admin) di sceglierli
  caricaIngredienti() {
    this.adminService.getIngredienti().subscribe({
      next: (res: any) => {
        // Se il backend restituisce un content paginato o la lista diretta
        this.ingredientiDisponibili = res.content ? res.content : res;
      },
      error: (err) => console.error("Errore caricamento ingredienti", err)
    });
  }

  // --- LOGICA GENERAZIONE IA ---
  generaBoxIA() {
    this.isGeneratingAi = true;
    this.adminService.generateBoxWithAi(this.suggerimentoAi).pipe(
      finalize(() => {
        this.isGeneratingAi = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (aiBox: AiGenerateBoxResponseDTO) => {
        // Popolamento dei campi classici
        this.nuovaBox.nome = aiBox.nome;
        this.nuovaBox.prezzo = aiBox.prezzo;
        this.nuovaBox.porzioni = aiBox.porzioni;
        this.nuovaBox.immagineUrl = aiBox.urlImmagine;

        // Genera un EAN univoco temporaneo
        this.nuovaBox.ean = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();

        // Mappatura Categoria IA -> Select Frontend
        let rawCat = aiBox.categoria.toUpperCase().replace(/\s+/g, '');
        if (rawCat.includes('GLUTEN')) rawCat = 'SENZAGLUTINE';
        this.nuovaBox.categoria = rawCat;

        // Salva la composizione generata
        this.ingredientiGenerati = aiBox.ingredienti;
      },
      error: (err) => {
        console.error("Errore IA", err);
        alert("Si è verificato un errore durante la generazione della Box con l'IA.");
      }
    });
  }

  // Modificato per salvare la box e, in parallelo, i suoi ingredienti
  salvaBox(form: any) {
    this.isSaving = true;
    this.adminService.addBox(this.nuovaBox).subscribe({
      next: (savedBox: any) => {

        // Se l'IA ha generato degli ingredienti, facciamo le chiamate a cascata
        if (this.ingredientiGenerati.length > 0 && savedBox.id) {
          const ingredientiRequests = this.ingredientiGenerati.map(ing => {
            const payload: any = { ingredienteId: ing.ingredienteId, quantita: ing.quantita };
            return this.adminService.addIngredientToBox(savedBox.id, payload).toPromise();
          });

          Promise.all(ingredientiRequests).then(() => {
            this.finalizzaCreazione(form, 'Box e composizione ingredienti salvati con successo!');
          }).catch(err => {
            console.error("Errore salvataggio composizione", err);
            this.finalizzaCreazione(form, 'Box creata, ma c\'è stato un errore nell\'aggiunta degli ingredienti.');
          });
        } else {
          this.finalizzaCreazione(form, 'Box creata con successo!');
        }
      },
      error: (err) => {
        console.error('Errore', err);
        alert('Errore creazione Box.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  private finalizzaCreazione(form: any, messaggio: string) {
    alert(messaggio);
    this.caricaBoxes();
    form.resetForm({ prezzo: 0, porzioni: 1, quantitaInBox: 1, attivo: true });
    this.ingredientiGenerati = [];
    this.suggerimentoAi = '';
    this.isSaving = false;
    this.cdr.detectChanges();
  }

  apriModaleInattive() {
    this.isLoadingInattive = true;
    this.adminService.getBoxesInattive().pipe(
      finalize(() => {
        this.isLoadingInattive = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.boxesInattive = response.content ? response.content : response;
      },
      error: (err) => { console.error('Errore nel caricamento box inattive:', err); }
    });
  }

  riattivaBox(box: any) {
    if (confirm(`Vuoi riattivare la box "${box.nome}" e rimetterla a catalogo?`)) {
      const boxDaRiattivare: Box = {
        percentualeSconto: 0, prezzoScontato: 0,
        id: box.id, ean: box.ean, nome: box.nome, categoria: box.categoria,
        prezzo: box.prezzo, porzioni: box.porzioni,
        quantitaInBox: box.quantitaInBox ? box.quantitaInBox : 1,
        immagineUrl: box.immagineUrl, attivo: true
      };

      this.adminService.updateBox(box.id, boxDaRiattivare).subscribe({
        next: () => {
          alert('Box riattivata con successo!');
          this.apriModaleInattive();
          this.caricaBoxes();
        },
        error: (err) => {
          console.error('Errore durante la riattivazione:', err);
          alert('Errore durante la riattivazione della box. Controlla la console.');
        }
      });
    }
  }

  apriDettagli(box: Box) {
    this.boxSelezionataDettagli = null;
    if (box.id) {
      this.isLoadingDettagli = true;
      this.adminService.getBoxDettagli(box.id).pipe(
        finalize(() => {
          this.isLoadingDettagli = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (res: any) => { this.boxSelezionataDettagli = res; },
        error: (err) => {
          console.error("Errore recupero dettagli box", err);
          alert("Impossibile caricare i dettagli.");
        }
      });
    }
  }

  apriModaleModifica(box: Box) {
    this.boxInModifica = { ...box };
  }

  salvaModificaBox() {
    if (this.boxInModifica && this.boxInModifica.id) {
      this.isSaving = true;
      this.adminService.updateBox(this.boxInModifica.id, this.boxInModifica).pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          alert('Box modificata con successo!');
          this.boxInModifica = null;
          this.caricaBoxes();
        },
        error: (err) => { console.error('Errore', err); alert('Impossibile modificare.'); }
      });
    }
  }

  onDeleteBox(id: number | undefined) {
    if (!id) return;
    if (confirm('Sei sicuro di voler disattivare questa Box? Verrà nascosta dal catalogo.')) {
      this.adminService.deleteBox(id).subscribe({
        next: () => {
          alert('Box disattivata con successo.');
          this.caricaBoxes();
        },
        error: (err) => { console.error('Errore', err); alert('Impossibile disattivare.'); }
      });
    }
  }
}
