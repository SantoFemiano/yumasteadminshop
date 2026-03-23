import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin';
import { Cliente, Carrello, Oggetti_carrello } from '../../models/admin-models';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-carrello',
  templateUrl: './carrello.html',
  standalone: true,
  imports: [NavbarComponent],
})
export class CarrelloComponent implements OnInit {
  clienti: Cliente[] = [];

  // Variabili per il carrello
  carrelloUtente: Carrello | null = null;
  clienteSelezionato: Cliente | null = null;
  isLoadingCarrello: boolean = false;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.caricaClienti();
  }

  caricaClienti() {
    this.adminService.getClienti().subscribe({
      next: (res) => {
        this.clienti = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore nel caricamento clienti', err)
    });
  }

  // Passiamo il Cliente esatto dalla tabella
  apriCarrello(cliente: Cliente) {
    if (!cliente || !cliente.id) return; // Controllo di sicurezza

    this.clienteSelezionato = cliente;
    this.carrelloUtente = null; // Resetta il carrello precedente
    this.isLoadingCarrello = true;

    this.adminService.getCarrelloUtente(cliente.id).subscribe({
      next: (res: any) => {
        this.carrelloUtente = res;
        this.isLoadingCarrello = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Errore nel caricamento del carrello", err);
        this.isLoadingCarrello = false;
        this.cdr.detectChanges(); // Aggiorna la vista anche in caso di errore
      }
    });
  }
}
