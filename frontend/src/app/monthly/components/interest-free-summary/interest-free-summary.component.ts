import { Component } from '@angular/core';
import { LineChartComponent } from '../../../common/components/charts/line-chart/line-chart.component';
import { ChartData } from '@expense/types/chartComponent';

@Component({
  selector: 'app-interest-free-summary',
  standalone: true,
  imports: [LineChartComponent],
  templateUrl: './interest-free-summary.component.html',
  styleUrl: './interest-free-summary.component.scss',
})
export class InterestFreeSummaryComponent {
  data: ChartData = {
    labels: ['January', 'February', 'March'],
    datasets: [{ data: [5000, 4500, 6000], color: 'blue', legend: 'balance' }],
  };
}
