import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ProductsComponent } from '../../components/products/products.component';
import { AboutComponent } from '../../components/about/about.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, HeroComponent, ProductsComponent, AboutComponent],
  template: `
    <main class="min-h-screen">
      <app-header></app-header>
      <app-hero></app-hero>
      <app-products></app-products>
      <app-about></app-about>
    </main>
  `
})
export class HomeComponent {}

