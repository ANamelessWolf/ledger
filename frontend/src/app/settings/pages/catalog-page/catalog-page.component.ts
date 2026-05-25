import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CatalogManagerComponent } from '../../components/catalog-manager/catalog-manager.component';
import { CATALOG_CONFIGS, CatalogConfig } from '../../types/catalog-config.types';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, CatalogManagerComponent],
  templateUrl: './catalog-page.component.html',
  styleUrl: './catalog-page.component.scss',
})
export class CatalogPageComponent implements OnInit {
  config: CatalogConfig | null = null;
  notFound = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('catalogId') ?? '';
      this.config = CATALOG_CONFIGS[id] ?? null;
      this.notFound = !this.config;
    });
  }
}
