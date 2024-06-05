export type PaymentStatus = {
  cutDate: string;
  dueDate: string;
  billing: {
    period: string;
    start: string;
    end: string;
  };
  status: string;
  total: string;
};
