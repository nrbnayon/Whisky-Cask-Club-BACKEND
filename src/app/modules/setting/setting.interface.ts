export type TSetting = {
  id?: string;
  title?: string;
  description?: string;
  order?: number | unknown;
  [key: string]: unknown;
};
