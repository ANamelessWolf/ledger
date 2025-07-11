export type HttpResponseProps = {
  data?: any;
  errorCode?: number;
  message?: string;
  success?: boolean;
};

export interface PaymentMap {
  [key: string]: { date: Date; total: number };
}

export interface PairedValue {
  label: string;
  value: number;
}
