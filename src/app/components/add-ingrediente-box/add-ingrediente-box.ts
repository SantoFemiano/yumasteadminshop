import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import {AdminService} from '../../services/admin';
import {NavbarComponent} from '../navbar/navbar';

@Component({
  selector: 'app-add-ingrediente-box',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './add-ingrediente-box.html',
  styleUrls: ['./add-ingrediente-box.css']
})
export class AddIngredienteBoxComponent implements OnInit, OnDestroy {

  composizioneForm!: FormGroup;
  boxes: any[] = [];
  ingredienti: any[] = [];
  ingredientiAttuali: any[] = [];

  isLoading: boolean = false;
  isSubmitting: boolean = false;

  private boxSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.composizioneForm = this.fb.group({
      boxId: ['', Validators.required],
      ingredienteId: ['', Validators.required],
      quantita: ['', [Validators.required, Validators.min(0.01)]]
    });

    this.caricaDatiIniziali();

    this.boxSub = this.composizioneForm.get('boxId')!.valueChanges.pipe(
      tap(() => {
        this.isLoading = true;
        this.ingredientiAttuali = [];
      }),
      switchMap(boxId => {
        if (!boxId) return of([]);

        return this.adminService.getIngredientiDellaBox(boxId).pipe(
          catchError(err => {
            console.error('Errore nel recupero ingredienti', err);
            return of([]);
          })
        );
      })
    ).subscribe(ingredienti => {
      this.ingredientiAttuali = ingredienti;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.boxSub) {
      this.boxSub.unsubscribe();
    }
  }

  // --- NUOVO METODO: Ricava l'unità di misura in tempo reale ---
  get unitaMisuraSelezionata(): string {
    const ingredienteId = this.composizioneForm.get('ingredienteId')?.value;
    if (!ingredienteId) {
      return 'unità';
    }
    const ing = this.ingredienti.find(i => i.id === Number(ingredienteId));
    return ing ? ing.unitaMisura : 'unità';
  }
  // --------------------------------------------------------------

  caricaDatiIniziali() {
    this.adminService.getBoxes().subscribe(res => {
      this.boxes = res.content || res;
      this.cdr.detectChanges();
    });
    this.adminService.getIngredienti().subscribe(res => {
      this.ingredienti = res.content || res;
      this.cdr.detectChanges();
    });
  }

  onSubmit() {
    if (this.composizioneForm.invalid) {
      this.composizioneForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValues = this.composizioneForm.value;
    const boxId = formValues.boxId;
    const request = {
      ingredienteId: formValues.ingredienteId,
      quantita: formValues.quantita
    };

    this.adminService.addIngredientToBox(boxId, request).subscribe({
      next: () => {
        this.ricaricaIngredienti(boxId);

        this.composizioneForm.patchValue({ ingredienteId: '', quantita: '' });
        this.composizioneForm.get('ingredienteId')?.markAsUntouched();
        this.composizioneForm.get('quantita')?.markAsUntouched();
        this.cdr.detectChanges();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante l\'aggiunta dell\'ingrediente. (Controlla che non sia già presente)');
        this.isSubmitting = false;
      }
    });
  }

  onRemoveIngredienteDallaBox(nomeIngrediente: string) {
    const boxId = this.composizioneForm.get('boxId')?.value;
    if (!boxId) return;

    const ingredienteCorrispondente = this.ingredienti.find(i => i.nome === nomeIngrediente);

    if (!ingredienteCorrispondente || !ingredienteCorrispondente.id) {
      alert("Impossibile trovare l'ID di questo ingrediente nel catalogo globale.");
      return;
    }

    if (confirm(`Vuoi davvero rimuovere ${nomeIngrediente} dalla ricetta di questa Box?`)) {
      this.adminService.removeIngredienteFromBox(boxId, ingredienteCorrispondente.id).subscribe({
        next: () => {
          alert('Ingrediente rimosso con successo dalla Box!');
          this.ricaricaIngredienti(boxId);
        },
        error: (err) => {
          console.error(err);
          alert('Si è verificato un errore durante la rimozione.');
        }
      });
    }
  }

  private ricaricaIngredienti(boxId: number) {
    this.isLoading = true;
    this.adminService.getIngredientiDellaBox(boxId).subscribe({
      next: (res) => {
        this.ingredientiAttuali = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => this.isLoading = false
    });
  }
}
