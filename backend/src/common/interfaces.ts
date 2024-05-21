export interface HttpResponseProps<T = any> {
  data?: T;
  errorCode?: number;
  message?: string;
  success?: boolean;
}
