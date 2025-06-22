I have the following page in angular `mo-no-int-index-page.component.html`, here is the html code of the template

```html
<div class="monoint-index-page">
  <div class="header-section">
    <h1>Interest-free Monthly Installments</h1>
    <div class="button-group">
      <app-search-bar (search)="onSearch($event)"></app-search-bar>
      <button
        mat-icon-button
        aria-label="Open filter window"
        (click)="openFilter()"
      >
        <mat-icon *ngIf="hasFilter">filter_list</mat-icon>
        <mat-icon *ngIf="!hasFilter">filter_list_off</mat-icon>
      </button>
      <button mat-icon-button (click)="addWallet()">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  </div>
  <hr />
  <div class="main-section">

  </div>
</div>
```

Based on the uploaded image, the main-section is the one with the colors black, red, green and yellow.

Create the following components using angular material UI.

First component

The black rectangle is called "Interest-free Monthly Overview", it is a card(`mat-card`) with a GRID(`mat-grid-list`) template of one row and tree columns, In each column it will display a Header in the first line using h2 and a quantity that will come from an input property `intFreeMo`. 
The first column is "Current Balance" and the value to display is `intFreeMo.current`
The second column is "Monthly Payment" and the value to display is `intFreeMo.monthly`
The third column is "Total Payment" and the value to display is `intFreeMo.total`
Here is the interface for the value intFreeMo

```ts
interface IFreeMontlyInt{
  current: Number;
  monthly: Number;
  total: Number;
}
```

This component is like a header card with Overview title, and has a fixed height

Second component

The red rectangle is called "Interest-free Credit Card Pie Chart", include just the following template

```html
<div class="container">
  <div id="cardChartContainer">
    <canvas id="cardChartPieChart"></canvas>
  </div>
<div>
```

This component has as input value called `cards`, this value is an array of type ICardValue

```ts
interface ICardValue{
  card: string;
  value: Number;
}
```

Third component

The green rectangle is called "Interest-free summary", include just the following template

```ts
<h1>Interest-free summary</h1>
<div class="container">
  <div id="paymentSummaryContainer">
    <canvas id="paymentSummaryChart"></canvas>
  </div>
  <div class="Details">

  </div>
</div>
```

Fourth component

The yellow component, is called "Interest-free details", this is a listview(<mat-list>) in wich each list item(<mat-list-item>) is a expansion panel(<mat-expansion-panel>)and will expand a list of expenses. The component height is variable
