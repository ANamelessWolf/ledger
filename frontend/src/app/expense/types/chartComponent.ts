export type ChartDataSet = {
  data: number[];
  backgroundColor?: string[];
  color?: string;
  legend?: string;
};
export type ChartData = {
  labels: string[];
  datasets: ChartDataSet[];
};

export interface IChartComponent {
  updateChart(): void;
  createChart(): void;
  getChartData(): ChartData;
  chartContainer: string;
  chart: any;
}

export const EMPTY_CHART_DATA: ChartData = {
  labels: [],
  datasets: [],
};
