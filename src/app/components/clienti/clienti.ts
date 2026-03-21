import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-clienti',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './clienti.html'
})
export class ClientiComponent implements OnInit {
  clienti: any[] = [];
  isLoading: boolean = false;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaClienti();
  }

  caricaClienti() {
    this.isLoading = true;
    this.adminService.getClienti().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.clienti = data;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei clienti', err);
      }
    });
  }
}
