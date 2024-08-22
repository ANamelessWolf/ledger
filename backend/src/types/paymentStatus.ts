export type PaymentStatus = {
  cutDate: string;
  dueDate: string;
  payment: {
    startDate: Date;
    dueDate: Date;
  };
  billing: {
    filter: {
      start: Date;
      end: Date;
    },
    period: string;
    start: string;
    end: string;
  };
  status: string;
  total: string;
};
