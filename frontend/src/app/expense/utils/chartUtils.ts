import { IChartComponent } from '@expense/types/ChartComponent';
import { Chart } from 'chart.js';

export const getContext = (component: IChartComponent) => {
  const ctx = (
    document.getElementById(component.chartContainer) as HTMLCanvasElement
  ).getContext('2d')!;
  return ctx;
};

export const refreshChart = (component: IChartComponent) => {
  if (component.chart) {
    component.chart.data = component.getChartData();
    component.chart.update();
  }
};

export const createDoughnutChart = (
  ctx: CanvasRenderingContext2D,
  component: IChartComponent
) => {
  return new Chart(ctx, {
    type: 'doughnut',
    data: component.getChartData(),
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}%`,
          },
        },
      },
    },
  });
};
