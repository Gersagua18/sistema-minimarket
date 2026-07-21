import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-logo.component.html'
})
export class BrandLogoComponent {
  @Input() height: number = 32;
  @Input() showText: boolean = true;
  @Input() darkTheme: boolean = false;
}
