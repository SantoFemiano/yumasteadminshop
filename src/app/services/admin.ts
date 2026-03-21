import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddIngredienteToBoxRequest,
  Allergene,
  Box,
  Fornitore,
  Ingrediente, IngredienteMagazzinoRequest, IngredienteMagazzinoResponse,
  Magazzino,
  PageResponse,
  Sconto
} from '../models/admin-models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // L'URL base per il controller degli admin
  private apiUrl = 'http://localhost:8084/api/admin';


  constructor(private http: HttpClient) { }

  // Metodo per recuperare la lista dei fornitori
  getFornitori(): Observable<Fornitore[]> {
    // Grazie all'Interceptor creato prima, il token verrà aggiunto automaticamente a questa chiamata!
    return this.http.get<Fornitore[]>(`${this.apiUrl}/fornitori`);

  }

  // Invia i dati al backend per creare il fornitore
  addFornitore(fornitore: Fornitore): Observable<Fornitore> {
    return this.http.post<Fornitore>(`${this.apiUrl}/add/fornitore`, fornitore);
  }

  getMagazzini(): Observable<Magazzino[]> {
    return this.http.get<Magazzino[]>(`${this.apiUrl}/magazzini`);
  }

  addMagazzino(magazzino: Magazzino): Observable<Magazzino> {
    return this.http.post<Magazzino>(`${this.apiUrl}/add/magazzino`, magazzino);
  }
  private publicUrl = 'http://localhost:8084/api/public';

  // Legge le box (usiamo un parametro size grande per prenderle tutte, o puoi gestire la paginazione in futuro)
  getBoxes(): Observable<PageResponse<Box>> {
    return this.http.get<PageResponse<Box>>(`${this.publicUrl}/boxes?size=100`);
  }

  // Crea una nuova box
  addBox(box: Box): Observable<Box> {
    return this.http.post<Box>(`${this.apiUrl}/addBox`, box);
  }

  getSconti(): Observable<Sconto[]> {
    return this.http.get<Sconto[]>(`${this.apiUrl}/sconti`);
  }

  getScontiValidi(): Observable<Sconto[]> {
    return this.http.get<Sconto[]>(`${this.apiUrl}/scontiattivi`);
  }

  addSconto(sconto: Sconto): Observable<Sconto> {
    return this.http.post<Sconto>(`${this.apiUrl}/add/sconto`, sconto);
  }

  applicaScontoABox(payload: { scontoId: number, boxIds: number[] }): Observable<any> {
    return this.http.post(`${this.apiUrl}/add/scontobox`, payload);
  }

  getAllergeni(): Observable<Allergene[]> {
    return this.http.get<Allergene[]>(`${this.apiUrl}/allergeni`);
  }

  getIngredienti(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ingredienti`);
  }

  addIngrediente(ingrediente: Ingrediente): Observable<any> {
    return this.http.post(`${this.apiUrl}/addIngredient`, ingrediente);
  }

  getTuttiValoriNutrizionali(): Observable<any> {
    return this.http.get(`${this.apiUrl}/valorinutrizionali`);
  }

  getTuttiIngredientiAllergeni(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ingredienti/allergeni`);
    }

  getBoxDettagli(boxId: number): Observable<any> {
    const publicUrl = this.apiUrl.replace('/admin', '/public');
    return this.http.get(`${publicUrl}/box/detail/${boxId}`);
  }

  addIngredientToBox(boxId: number, request: AddIngredienteToBoxRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/addIngredientToBox/${boxId}`, request);
  }

  getIngredientiDellaBox(boxId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8084/api/public/box/ingredienti/${boxId}`);
    }

  getTuttiGliOrdini(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ordini/clienti`);
  }

  getClienti(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clienti`);
  }

  getDettagliOrdine(idOrdine: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ordine/${idOrdine}/dettagli`);
  }

  getIngredienteMagazzino(): Observable<IngredienteMagazzinoResponse[]> {
    return this.http.get<IngredienteMagazzinoResponse[]>(`${this.apiUrl}/ingrediente/magazzino`);
  }

  addIngredienteMagazzino(request: IngredienteMagazzinoRequest): Observable<IngredienteMagazzinoResponse> {
    return this.http.post<IngredienteMagazzinoResponse>(`${this.apiUrl}/add/ingrediente/magazzino`, request);
  }

}
