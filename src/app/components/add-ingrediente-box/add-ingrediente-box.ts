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

  // Variabili per gestire l'UI ed evitare rallentamenti visivi
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

    // LA MAGIA È QUI: Gestione intelligente del cambio Box
    this.boxSub = this.composizioneForm.get('boxId')!.valueChanges.pipe(
      tap(() => {
        // Appena l'utente cambia box, svuota la lista e mostra subito il caricamento
        this.isLoading = true;
        this.ingredientiAttuali = [];
      }),
      switchMap(boxId => {
        if (!boxId) return of([]); // Se non c'è box, ritorna vuoto

        // switchMap annulla le richieste precedenti se l'utente clicca velocemente
        return this.adminService.getIngredientiDellaBox(boxId).pipe(
          catchError(err => {
            console.error('Errore nel recupero ingredienti', err);
            return of([]); // In caso di errore non blocca l'applicazione
          })
        );
      })
    ).subscribe(ingredienti => {
      this.ingredientiAttuali = ingredienti;
      this.isLoading = false;
      this.cdr.detectChanges();// Ferma il caricamento
    });
  }

  ngOnDestroy(): void {
    if (this.boxSub) {
      this.boxSub.unsubscribe();
    }
  }

  caricaDatiIniziali() {
    this.adminService.getBoxes().subscribe(res => {
      this.boxes = res.content || res;
      this.cdr.detectChanges();
    });
    this.adminService.getIngredienti().subscribe(res => {
      this.ingredienti = res;
      this.cdr.detectChanges();
    });
  }

  onSubmit() {
    if (this.composizioneForm.invalid) {
      this.composizioneForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true; // Disabilita il bottone

    const formValues = this.composizioneForm.value;
    const boxId = formValues.boxId;
    const request = {
      ingredienteId: formValues.ingredienteId,
      quantita: formValues.quantita
    };

    this.adminService.addIngredientToBox(boxId, request).subscribe({
      next: () => {
        // Ricarica la tabellina di destra
        this.ricaricaIngredienti(boxId);

        // Svuota solo i campi dell'ingrediente, lasciando la box selezionata
        this.composizioneForm.patchValue({ ingredienteId: '', quantita: '' });
        this.composizioneForm.get('ingredienteId')?.markAsUntouched();
        this.composizioneForm.get('quantita')?.markAsUntouched();
        this.cdr.detectChanges();
        this.isSubmitting = false; // Riattiva il bottone
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante l\'aggiunta dell\'ingrediente.');
        this.isSubmitting = false;
      }
    });
  }

  // Metodo privato usato solo per fare il refresh dopo l'inserimento
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
