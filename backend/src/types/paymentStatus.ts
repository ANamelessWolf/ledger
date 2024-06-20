export type PaymentStatus = {
  cutDate: string;
  dueDate: string;
  payment: {
    startDate: Date;
    dueDate: Date;
  };
  billing: {
    period: string;
    start: string;
    end: string;
  };
  status: string;
  total: string;
};
