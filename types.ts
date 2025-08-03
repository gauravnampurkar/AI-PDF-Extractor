
export interface ExtractedTable {
  title: string;
  data: string[][];
}

export interface TableExtractionResponse {
  tables: ExtractedTable[];
}

export interface PageData {
  pageNumber: number;
  status: 'pending' | 'loading' | 'success' | 'error';
  tables: ExtractedTable[];
  errorMessage?: string;
}
