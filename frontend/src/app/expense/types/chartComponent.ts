export type ChartDataSet = {
  backgroundColor: string[];
  data: number[];
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
