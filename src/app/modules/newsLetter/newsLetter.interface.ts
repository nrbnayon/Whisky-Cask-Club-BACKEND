export interface INewsLetter {
  id?: string;
  email?: string;
  name?: string;
  subject?: string;
  description?: string;
  order?: number | unknown;
  [key: string]: unknown;
}
