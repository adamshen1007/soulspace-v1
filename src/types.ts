export interface FengShuiReport {
  score: number;
  summary: string;
  element: string; // "金" | "木" ...
  
  dimensions: {
    energy: number;
    balance: number;
    aesthetics: number;
    harmony: number;
    fortune: number;
  };

  issues: {
    title: string;
    type: string;
    description: string;
    suggestion: string;
    product_ref?: string;
  }[];
}

export interface ApiResponse {
  success: boolean;
  data?: FengShuiReport;
  error?: string;
}