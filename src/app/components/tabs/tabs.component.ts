import { Component, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabService, Tab } from '../../services/tab.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="tabs$ | async as tabs">
      <div class="tabs-container" *ngIf="tabs.length > 0">
        <div class="tabs-header" [style.marginLeft.px]="level * 24">
          <div class="level-indicator" *ngIf="level > 0">Level {{level}}</div>
          <div class="tabs-list">
            <div *ngFor="let tab of tabs" 
                 [class.active]="tab.active"
                 class="tab-trigger"
                 (click)="activateTab(tab.id)">
              <span class="tab-icon">
                <svg *ngIf="hasChildren(tab)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                  <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/>
                </svg>
                <svg *ngIf="!hasChildren(tab)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                </svg>
              </span>
              <span class="tab-title">{{ tab.title }}</span>
              <button class="close-btn" (click)="closeTab(tab.id, $event)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="tab-content" *ngIf="activeTab$ | async as activeTab">
          <ng-container #tabContent></ng-container>
          <app-tabs 
            *ngIf="activeTab.active"
            [parentId]="activeTab.id"
            [level]="level + 1">
          </app-tabs>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .tabs-container {
      width: 100%;
      margin-bottom: 8px;
    }

    .tabs-header {
      border-bottom: 1px solid hsl(240 5% 84%);
      margin-bottom: 12px;
    }

    .level-indicator {
      font-size: 12px;
      color: hsl(240 4% 46%);
      margin-bottom: 8px;
      padding-left: 4px;
      font-weight: 500;
    }

    .tabs-list {
      display: flex;
      gap: 2px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .tab-trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px;
      font-size: 14px;
      font-weight: 500;
      background-color: transparent;
      color: hsl(240 4% 46%);
      border-radius: 6px 6px 0 0;
      border: 1px solid transparent;
      border-bottom: none;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: hsl(240 5% 96%);
        color: hsl(240 6% 10%);
      }

      &.active {
        background-color: white;
        color: hsl(240 6% 10%);
        border-color: hsl(240 5% 84%);
        border-bottom-color: white;
        margin-bottom: -1px;
      }
    }

    .tab-icon {
      display: inline-flex;
      align-items: center;
      opacity: 0.5;
    }

    .tab-title {
      line-height: 1;
    }

    .close-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px;
      border: none;
      background: transparent;
      color: currentColor;
      opacity: 0.6;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        opacity: 1;
        background-color: hsl(240 5% 92%);
      }

      svg {
        width: 14px;
        height: 14px;
      }
    }

    .tab-content {
      padding: 16px 0;
      margin-left: 12px;
      border-left: 2px solid hsl(240 5% 96%);
      padding-left: 24px;
    }
  `]
})
export class TabsComponent {
  @ViewChild('tabContent', { read: ViewContainerRef, static: false}) 
  tabContent!: ViewContainerRef;

  @Input() parentId?: string;
  @Input() level = 0;

  tabs$: Observable<Tab[]>;
  activeTab$: Observable<Tab | undefined>;

  constructor(private tabService: TabService) {
    this.tabs$ = this.tabService.tabs$.pipe(
      map(tabs => tabs.filter(tab => tab.parent === this.parentId))
    );
    
    this.activeTab$ = this.tabs$.pipe(
      map(tabs => tabs.find(tab => tab.active))
    );
  }

  ngAfterViewInit() {
    this.activeTab$.subscribe(activeTab => {
      if (this.tabContent && activeTab?.component) {
        this.tabContent.clear();
        this.tabContent.createComponent(activeTab.component);
      }
    });
  }

  async activateTab(id: string) {
    await this.tabService.activateTab(id);
  }

  closeTab(id: string, event: Event) {
    event.stopPropagation();
    this.tabService.closeTab(id);
  }

  hasChildren(tab: Tab): boolean {
    const currentTabs = this.tabService.tabs.value;
    return currentTabs.some(t => t.parent === tab.id);
  }
} 