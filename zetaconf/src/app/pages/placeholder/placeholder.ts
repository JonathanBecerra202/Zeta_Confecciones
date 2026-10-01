import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [],
  template: `
    <div style="text-align:center; padding: 3rem; color:#8fa8bc;">
      <h2 style="color:#26425e; font-family:'Playfair Display', serif;">{{ title }}</h2>
      <p>Esta sección todavía no está construida.</p>
    </div>
  `
})
export class Placeholder {
  title = '';

  constructor(private route: ActivatedRoute) {
    this.title = this.route.snapshot.data['title'] ?? '';
  }
}