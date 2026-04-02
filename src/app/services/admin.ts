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
  Sconto, Cliente
} from '../models/admin-models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // L'URL base per il controller degli admin
  private apiRenderUrlPublic='https://yumaste-backend.onrender.com/api/public'
  private apiRenderUrlAdmin='https://yumaste-backend.onrender.com/api/admin'


  private apiUrl = 'http://localhost:8084/api/admin';


  constructor(private http: HttpClient) { }

  // Metodo per recuperare la lista dei fornitori
  getFornitori(): Observable<Fornitore[]> {
    return this.http.get<Fornitore[]>(`${this.apiRenderUrlAdmin}/fornitori`);

  }

  // Invia i dati al backend per creare il fornitore
  addFornitore(fornitore: Fornitore): Observable<Fornitore> {
    return this.http.post<Fornitore>(`${this.apiRenderUrlAdmin}/add/fornitore`, fornitore);
  }

  getMagazzini(): Observable<Magazzino[]> {
    return this.http.get<Magazzino[]>(`${this.apiRenderUrlAdmin}/magazzini`);
  }

  addMagazzino(magazzino: Magazzino): Observable<Magazzino> {
    return this.http.post<Magazzino>(`${this.apiRenderUrlAdmin}/add/magazzino`, magazzino);
  }
  private publicUrl = 'http://localhost:8084/api/public';

  // Legge le box (usiamo un parametro size grande per prenderle tutte, o puoi gestire la paginazione in futuro)
  getBoxes(): Observable<PageResponse<Box>> {
    return this.http.get<PageResponse<Box>>(`${this.apiRenderUrlPublic}/boxes?size=100`);
  }

  // Crea una nuova box
  addBox(box: Box): Observable<Box> {
    return this.http.post<Box>(`${this.apiRenderUrlAdmin}/addBox`, box);
  }

  getSconti(): Observable<Sconto[]> {
    return this.http.get<Sconto[]>(`${this.apiRenderUrlAdmin}/sconti`);
  }

  getScontiValidi(): Observable<Sconto[]> {
    return this.http.get<Sconto[]>(`${this.apiRenderUrlAdmin}/scontiattivi`);
  }

  addSconto(sconto: Sconto): Observable<Sconto> {
    return this.http.post<Sconto>(`${this.apiRenderUrlAdmin}/add/sconto`, sconto);
  }

  applicaScontoABox(payload: { scontoId: number, boxIds: number[] }): Observable<any> {
    return this.http.post(`${this.apiRenderUrlAdmin}/add/scontobox`, payload);
  }

  getAllergeni(): Observable<Allergene[]> {
    return this.http.get<Allergene[]>(`${this.apiRenderUrlAdmin}/allergeni`);
  }

  getIngredienti(): Observable<any> {
    return this.http.get(`${this.apiRenderUrlAdmin}/ingredienti`);
  }

  addIngrediente(ingrediente: Ingrediente): Observable<any> {
    return this.http.post(`${this.apiRenderUrlAdmin}/addIngredient`, ingrediente);
  }

  getTuttiValoriNutrizionali(): Observable<any> {
    return this.http.get(`${this.apiRenderUrlAdmin}/valorinutrizionali`);
  }

  getTuttiIngredientiAllergeni(): Observable<any> {
    return this.http.get(`${this.apiRenderUrlAdmin}/ingredienti/allergeni`);
    }

  getBoxDettagli(boxId: number): Observable<any> {
    const publicUrl = this.apiRenderUrlAdmin.replace('/admin', '/public');
    return this.http.get(`${publicUrl}/box/detail/${boxId}`);
  }

  addIngredientToBox(boxId: number, request: AddIngredienteToBoxRequest): Observable<any> {
    return this.http.post(`${this.apiRenderUrlAdmin}/addIngredientToBox/${boxId}`, request);
  }

  getIngredientiDellaBox(boxId: number): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>(`${this.apiRenderUrlPublic}/box/ingredienti/${boxId}`);
    }

  getTuttiGliOrdini(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiRenderUrlAdmin}/ordini/clienti`);
  }

  getClienti(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiRenderUrlAdmin}/clienti`);
  }

  getDettagliOrdine(idOrdine: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiRenderUrlAdmin}/ordine/${idOrdine}/dettagli`);
  }

  getIngredienteMagazzino(): Observable<IngredienteMagazzinoResponse[]> {
    return this.http.get<IngredienteMagazzinoResponse[]>(`${this.apiRenderUrlAdmin}/ingrediente/magazzino`);
  }

  addIngredienteMagazzino(request: IngredienteMagazzinoRequest): Observable<IngredienteMagazzinoResponse> {
    return this.http.post<IngredienteMagazzinoResponse>(`${this.apiRenderUrlAdmin}/add/ingrediente/magazzino`, request);
  }

  getCarrelloUtente(utenteId: number): Observable<Carrello> {
    return this.http.get<Carrello>(`${this.apiRenderUrlAdmin}/utente/${utenteId}/cliente`);
  }

  updateBox(id: number, box: Box): Observable<Box> {
    return this.http.put<Box>(`${this.apiRenderUrlAdmin}/box/${id}`, box);
  }

  deleteBox(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRenderUrlAdmin}/box/${id}`);
  }

  updateIngrediente(id: number, ingrediente: Ingrediente): Observable<any> {
    return this.http.put(`${this.apiRenderUrlAdmin}/ingrediente/${id}`, ingrediente);
  }

  deleteIngrediente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRenderUrlAdmin}/ingrediente/${id}`);
  }

  removeIngredienteFromBox(boxId: number, ingredienteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRenderUrlAdmin}/box/${boxId}/ingrediente/${ingredienteId}`);
  }

  removeScontoFromBox(scontoId: number, boxId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRenderUrlAdmin}/sconto/${scontoId}/box/${boxId}`);
  }

  updateStatoOrdine(id: number, statoOrdine: string, statoSpedizione?: string): Observable<any> {
    let url = `${this.apiRenderUrlAdmin}/ordine/${id}/stato?statoOrdine=${statoOrdine}`;

    if (statoSpedizione && statoSpedizione !== 'undefined' && statoSpedizione !== 'null' && statoSpedizione.trim() !== '') {
      url += `&statoSpedizione=${statoSpedizione}`;
    }

    return this.http.patch(url, {});
  }

  updateMagazzino(id: number, magazzino: Magazzino): Observable<Magazzino> {
    return this.http.put<Magazzino>(`${this.apiRenderUrlAdmin}/update/magazzino/${id}`, magazzino);
  }

  deleteMagazzino(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRenderUrlAdmin}/delete/magazzino/${id}`);
  }

  updateFornitore(id: number, fornitore: Fornitore): Observable<Fornitore> {
    return this.http.put<Fornitore>(`${this.apiRenderUrlAdmin}/update/fornitore/${id}`, fornitore);
  }

  deleteFornitore(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRenderUrlAdmin}/delete/fornitore/${id}`);
  }

  deleteCliente(id: number):Observable<void>{
    return this.http.delete<void>(`${this.apiRenderUrlAdmin}/delete/cliente/${id}`);
  }

  getAssociazioniScontoBox(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiRenderUrlAdmin}/sconto/sconto-box`);
  }

  updateSconto(id: number, sconto: Sconto): Observable<Sconto> {
    return this.http.put<Sconto>(`${this.apiRenderUrlAdmin}/sconto/${id}`, sconto);
  }

  deleteSconto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiRenderUrlAdmin}/delete/sconto/${id}`);
  }

  getBoxesInattive(): Observable<Box> {
    return this.http.get<Box>(`${this.apiRenderUrlAdmin}/boxes/inattive`);
  }


  getIngredientiInattivi(): Observable<Ingrediente> {
    return this.http.get<Ingrediente>(`${this.apiRenderUrlAdmin}/ingredienti/inattivi`);
  }


  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiRenderUrlAdmin}/dashboard/stats`);
  }



}
