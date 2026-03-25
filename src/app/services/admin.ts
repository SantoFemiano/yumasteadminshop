import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddIngredienteToBoxRequest,
  Allergene,
  Box, Carrello,
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

  getCarrelloUtente(utenteId: number): Observable<Carrello> {
    return this.http.get<Carrello>(`${this.apiUrl}/utente/${utenteId}/cliente`);
  }

  updateBox(id: number, box: Box): Observable<Box> {
    return this.http.put<Box>(`${this.apiUrl}/box/${id}`, box);
  }

  deleteBox(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/box/${id}`);
  }

  updateIngrediente(id: number, ingrediente: Ingrediente): Observable<any> {
    return this.http.put(`${this.apiUrl}/ingrediente/${id}`, ingrediente);
  }

  deleteIngrediente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ingrediente/${id}`);
  }

  removeIngredienteFromBox(boxId: number, ingredienteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/box/${boxId}/ingrediente/${ingredienteId}`);
  }

  removeScontoFromBox(scontoId: number, boxId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sconto/${scontoId}/box/${boxId}`);
  }

  updateStatoOrdine(id: number, statoOrdine: string, statoSpedizione?: string): Observable<any> {
    let url = `${this.apiUrl}/ordine/${id}/stato?statoOrdine=${statoOrdine}`;

    if (statoSpedizione && statoSpedizione !== 'undefined' && statoSpedizione !== 'null' && statoSpedizione.trim() !== '') {
      url += `&statoSpedizione=${statoSpedizione}`;
    }

    return this.http.patch(url, {});
  }

  updateMagazzino(id: number, magazzino: Magazzino): Observable<Magazzino> {
    return this.http.put<Magazzino>(`${this.apiUrl}/update/magazzino/${id}`, magazzino);
  }

  deleteMagazzino(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/magazzino/${id}`);
  }

  updateFornitore(id: number, fornitore: Fornitore): Observable<Fornitore> {
    return this.http.put<Fornitore>(`${this.apiUrl}/update/fornitore/${id}`, fornitore);
  }

  deleteFornitore(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/fornitore/${id}`);
  }

  deleteCliente(id: number):Observable<void>{
    return this.http.delete<void>(`${this.apiUrl}/delete/cliente/${id}`);
  }

  getAssociazioniScontoBox(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sconto/sconto-box`);
  }

  updateSconto(id: number, sconto: Sconto): Observable<Sconto> {
    return this.http.put<Sconto>(`${this.apiUrl}/sconto/${id}`, sconto);
  }

  deleteSconto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/sconto/${id}`);
  }

  getBoxesInattive(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/boxes/inattive`);
  }


  getIngredientiInattivi(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ingredienti/inattivi`);
  }


  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
  }



}
