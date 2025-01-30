import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <div class="level-content">
      <h2>Level 1</h2>
      <p>This is the content of Level 1</p>
    </div>
  `,
  styles: [`
    .level-content {
      padding: 20px;
      background: hsl(240 5% 96%);
      border-radius: 8px;
    }
    h2 {
      margin: 0 0 12px;
      font-size: 18px;
      font-weight: 600;
      color: hsl(240 6% 10%);
    }
    p {
      margin: 0;
      color: hsl(240 4% 46%);
    }
  `]
})
export class Level1Component {} 