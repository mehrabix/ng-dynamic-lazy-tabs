import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TabConfig {
  id?: string;
  title: string;
  content?: () => Promise<{ [key: string]: Type<any> }>;
  children?: TabConfig[];
  data?: any;
  contentLoader?: () => Promise<{ [key: string]: Type<any> }>;
  active?: boolean;
}

export interface Tab extends TabConfig {
  id: string;
  component?: Type<any>;
  active: boolean;
  parent?: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class TabService {
  readonly tabs = new BehaviorSubject<Tab[]>([]);
  tabs$ = this.tabs.asObservable();

  async open(config: TabConfig, parentId?: string) {
    const id = config.id || crypto.randomUUID();
    let component: Type<any> | undefined;
    
    if (config.content && !config.contentLoader) {
      const module = await config.content();
      component = Object.values(module)[0] as Type<any>;
    }
    
    const currentTabs = this.tabs.value;
    const parentTab = parentId ? currentTabs.find(t => t.id === parentId) : undefined;
    const level = parentTab ? parentTab.level + 1 : 0;

    // Create new tab with required properties
    const newTab: Tab = {
      ...config,
      id,
      title: config.title,
      component,
      contentLoader: config.contentLoader || config.content,
      active: true,
      parent: parentId,
      level,
      children: config.children
    };

    // Find insertion index
    let insertIndex = currentTabs.length;
    if (parentId) {
      const parentIndex = currentTabs.findIndex(t => t.id === parentId);
      // Find the last sibling or parent's next sibling
      for (let i = parentIndex + 1; i < currentTabs.length; i++) {
        if (currentTabs[i].level <= level) {
          insertIndex = i;
          break;
        }
      }
    }

    // Deactivate siblings
    const updatedTabs = currentTabs.map(tab => ({
      ...tab,
      active: tab.parent === parentId ? false : tab.active
    }));

    // Insert new tab
    updatedTabs.splice(insertIndex, 0, newTab);
    await this.tabs.next(updatedTabs);

    // Create children if any
    if (config.children?.length) {
      // Create first child
      await this.open({
        ...config.children[0],
        content: undefined,
        contentLoader: config.children[0].content,
        children: config.children[0].children,
        active: true
      }, id);

      // Create remaining children
      for (let i = 1; i < config.children.length; i++) {
        await this.open({
          ...config.children[i],
          content: undefined,
          contentLoader: config.children[i].content,
          children: config.children[i].children,
          active: false
        }, id);
      }
    }
  }

  async activateTab(id: string) {
    const currentTabs = this.tabs.value;
    const tabToActivate = currentTabs.find(tab => tab.id === id);
    if (!tabToActivate) return;

    // Deactivate siblings and activate target
    const updatedTabs = currentTabs.map(tab => ({
      ...tab,
      active: tab.id === id ? true : 
             (tab.parent === tabToActivate.parent ? false : tab.active)
    }));

    // Load content if needed
    const tabIndex = updatedTabs.findIndex(tab => tab.id === id);
    if (updatedTabs[tabIndex].contentLoader && !updatedTabs[tabIndex].component) {
      const module = await updatedTabs[tabIndex].contentLoader();
      updatedTabs[tabIndex].component = Object.values(module)[0] as Type<any>;
      delete updatedTabs[tabIndex].contentLoader;
    }

    await this.tabs.next(updatedTabs);

    // Create children if needed
    if (tabToActivate.children?.length && 
        !currentTabs.some(tab => tab.parent === id)) {
      // Create first child
      await this.open({
        ...tabToActivate.children[0],
        content: undefined,
        contentLoader: tabToActivate.children[0].content,
        children: tabToActivate.children[0].children,
        active: true
      }, id);

      // Create remaining children
      for (let i = 1; i < tabToActivate.children.length; i++) {
        await this.open({
          ...tabToActivate.children[i],
          content: undefined,
          contentLoader: tabToActivate.children[i].content,
          children: tabToActivate.children[i].children,
          active: false
        }, id);
      }
    }
  }

  closeTab(id: string) {
    const currentTabs = this.tabs.value;
    const tabToClose = currentTabs.find(tab => tab.id === id);
    if (!tabToClose) return;

    // Get all descendants
    const tabsToRemove = this.getAllDescendantIds(id, currentTabs);
    tabsToRemove.push(id);
    
    // Remove tabs and handle activation
    const remainingTabs = currentTabs.filter(tab => !tabsToRemove.includes(tab.id));
    if (remainingTabs.length && tabToClose.active) {
      const siblings = remainingTabs.filter(tab => tab.parent === tabToClose.parent);
      if (siblings.length) {
        const siblingIndex = currentTabs.findIndex(tab => tab.id === siblings[0].id);
        siblings[Math.min(0, siblingIndex)].active = true;
      }
    }

    this.tabs.next(remainingTabs);
  }

  private getAllDescendantIds(parentId: string, tabs: Tab[]): string[] {
    const children = tabs.filter(tab => tab.parent === parentId);
    return children.reduce((acc, child) => [
      ...acc,
      child.id,
      ...this.getAllDescendantIds(child.id, tabs)
    ], [] as string[]);
  }
} 