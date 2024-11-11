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
    };
    period: string;
    start: string;
    end: string;
  };
  status: string;
  total: string;
};

export type CreditCardPeriod = {
  period: {
    month: number;
    year: number;
    key: string;
  };
  cutDay: string;
  cutDate: {
    dateValue: Date;
    dateString: string;
  };
  dueDate: {
    dateValue: Date;
    dateString: string;
  };
  billing: {
    start: {
      dateValue: Date;
      dateString: string;
    };
    end: {
      dateValue: Date;
      dateString: string;
    };
  };
};

export type CreditCardPeriodResponse = {
  id: number;
  periods: CreditCardPeriod[];
};
