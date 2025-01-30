import { Component } from '@angular/core';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabService } from './services/tab.service';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [TabService],
  imports: [TabsComponent],
  template: `
    <div class="container">
      <header class="header">
        <h1>Nested Tabs Demo</h1>
        <div class="actions">
          <button class="btn primary" (click)="openMainTab()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
            </svg>
            Open Main Section
          </button>
          <button class="btn" (click)="openSimpleTab()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Open Simple Tab
          </button>
        </div>
      </header>
      <main class="main">
        <app-tabs></app-tabs>
      </main>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .header {
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: hsl(240 6% 10%);
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid hsl(240 5% 84%);
      background-color: white;
      color: hsl(240 4% 46%);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: hsl(240 5% 96%);
        color: hsl(240 6% 10%);
      }

      &.primary {
        background-color: hsl(240 5% 10%);
        color: white;
        border-color: transparent;

        &:hover {
          background-color: hsl(240 5% 15%);
        }
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .main {
      background-color: white;
      border-radius: 8px;
      border: 1px solid hsl(240 5% 84%);
      padding: 24px;
    }
  `]
})
export class AppComponent {
  constructor(private tabService: TabService) { }

  openMainTab() {
    this.tabService.open({
      title: 'Main Section',
      content: () => import('./components/tabs/level1/level1.component').then(m => ({ default: m.Level1Component })),
      children: [
        {
          title: 'Section A',
          content: () => import('./components/tabs/level1/children/level2a/level2a.component')
            .then(m => ({ default: m.Level2AComponent })),
          children: [
            {
              title: 'Subsection A.1',
              content: () => import('./components/tabs/level1/children/level2a/children/level3a/level3a.component')
                .then(m => ({ default: m.Level3AComponent })),
              children: [
                {
                  title: 'Detail A.1.1',
                  content: () => import('./components/tabs/level1/children/level2a/children/level3a/children/level4a/level4a.component')
                    .then(m => ({ default: m.Level4AComponent }))
                },
                {
                  title: 'Detail A.1.2',
                  content: () => import('./components/tabs/level1/children/level2a/children/level3a/children/level4b/level4b.component')
                    .then(m => ({ default: m.Level4BComponent }))
                }
              ]
            },
            {
              title: 'Subsection A.2',
              content: () => import('./components/tabs/level1/children/level2a/children/level3b/level3b.component')
                .then(m => ({ default: m.Level3BComponent }))
            }
          ]
        },
        {
          title: 'Section B',
          content: () => import('./components/tabs/level1/children/level2b/level2b.component')
            .then(m => ({ default: m.Level2BComponent }))
        }
      ]
    });
  }

  openSimpleTab() {
    this.tabService.open({
      title: 'Simple Tab',
      content: () => import('./components/tabs/level1/level1.component').then(m => ({ default: m.Level1Component })),
      children: [
        {
          title: 'Simple Child',
          content: () => import('./components/tabs/level1/children/level2a/level2a.component')
            .then(m => ({ default: m.Level2AComponent }))
        }
      ]
    });
  }
}
