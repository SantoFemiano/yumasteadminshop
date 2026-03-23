
export interface Fornitore {
  partitaIva: string;
  nome: string;
  via: string;
  civico: string;
  cap: string;
  citta: string;
  provincia: string;
}

export interface Magazzino {
  id?:number;
  nome: string;
  via: string;
  civico: string;
  cap: string;
  citta: string;
  provincia: string;
}

export interface Box {
  id?:number
  ean:string;
  nome:string;
  categoria?:string;
  prezzo:number;
  prezzoScontato:number;
  percentualeSconto:number;
  porzioni:number;
  quantitaInBox:number;
  immagineUrl:string;
  attivo:boolean;

}

export interface PageResponse<T> {
  content: T[];      // L'array effettivo dei dati
  totalElements: number;
  totalPages: number;
  number: number;    // Pagina corrente
}

export interface Sconto {
  id?: number;
  nome: string;
  valore: number; // Percentuale o valore fisso
  attivo: boolean;
  inizioSconto: string; // Formato data: YYYY-MM-DD
  fineSconto: string;   // Formato data: YYYY-MM-DD
}

export interface AddIngredienteToBoxRequest {
  ingredienteId: number;
  quantita: number;
}

export interface Fornitore {
  id?: number;
  partitaIva: string;
  nome: string;
  via: string;
  civico: string;
  cap: string;
  citta: string;
  provincia: string;
}

export interface ValoriNutrizionali {
  proteine: number;
  carboidrati: number;
  zuccheri: number;
  fibre: number;
  grassi: number;
  sale: number;
  chilocalorie: number;
}

export interface Allergene {
  id: number;
  nome: string;
  descrizione?: string;
}

export interface Ingrediente {
  id?: number;
  ean: string;
  partitaIva: string | null;
  nomeFornitore?: string;
  fornitoreId: number;
  nome: string;
  descrizione: string;
  unitaMisura: string;
  prezzoPerUnita: number;
  attivo: boolean;
  valoriNutrizionali: ValoriNutrizionali;
  allergeniIds: number[];
}

export interface Indirizzo {
  id: number;
  via: string;
  civico: string;
  cap: string;
  citta: string;
  provincia: string;
  stato: string;
}

export interface Cliente {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  cf: string; // Codice Fiscale
  indirizzi: Indirizzo[];
}

export interface IngredienteMagazzinoRequest {
  ingredienteId: number;
  magazzinoId: number;
  quantita: number;
  lotto: string;
  dataIngresso: string;
}

export interface IngredienteMagazzinoResponse {
  ingredienteMagazzinoId: number;
  magazzinoId: number;
  ingredienteId: number;
  nomeMagazzino: string;
  nomeIngrediente: string;
  quantita: number;
  unitaMisura: string;
  lotto: string;
  dataIngresso: string;
}

export interface Oggetti_carrello {
  idRigaCarrello:number,
  boxId:number,
  nomeBox:string,
  quantita:number,
  immagineUrl:string,
  prezzoOriginale:number,
  prezzoScontato:number,
  percentualeSconto:number
}

export interface Carrello{
   totalItems:number,
   totalQuantity:number,
   totalPrice:number
   items:Oggetti_carrello[]
  }

