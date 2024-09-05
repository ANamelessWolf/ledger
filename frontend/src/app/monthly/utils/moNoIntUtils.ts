import { formatBreakLine } from '@common/utils/formatUtils';
import {
  NoIntMonthlyInstallment,
  Payment,
} from '@moNoInt/types/monthlyNoInterest';

export const mapNoIntMonthlyInstallments = (response: any) => {
  const installments: NoIntMonthlyInstallment[] = response.data.result.map(
    (row: any) => {
      return {
        ...row,
      };
    }
  );
  installments.forEach((i: NoIntMonthlyInstallment) => {
    i.purchase.description = formatBreakLine(i.purchase.description);
    i.payments.forEach((p: Payment) => {
      p.description = formatBreakLine(i.purchase.description);
    });
  });
  const totalItems: number = response.data.pagination.total;
  return { installments, totalItems, total: response.data.total };
};
