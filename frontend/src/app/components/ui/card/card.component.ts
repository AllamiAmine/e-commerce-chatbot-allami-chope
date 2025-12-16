import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'rounded-lg border border-border bg-card text-card-foreground shadow-sm ' + className">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() className = '';
}

