import {
  Component,
  Output,
  EventEmitter,
  Type,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorizontalScrollDirective } from '../../../directives/horizontalScroll.directive';
import { MiddleClickDirective } from '../../../directives/middleClick.directive';
import {
  CdkDragDrop,
  CdkDragHandle,
  CdkDrag,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ShortcutDirective } from '../../../directives/shortcut.directive';
@Component({
  selector: 'dynamic-tabs',
  standalone: true,
  imports: [
    CommonModule,
    HorizontalScrollDirective,
    MiddleClickDirective,
    ShortcutDirective,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
  ],
  templateUrl: './dynamic-tabs.component.html',
  styleUrl: './dynamic-tabs.component.less',
})
export class DynamicTabsComponent<T> implements AfterViewInit, OnDestroy {
  //#region Properties
  private _tabs: Tab<T>[] = [];

  set tabs(value: Tab<T>[]) {
    this._tabs = value;
    this.onTabsChanged();
  }
  get tabs(): Tab<T>[] {
    return this._tabs;
  }
  @Output() tabsChange = new EventEmitter<Tab<T>[]>();
  @Output() tabRemoved = new EventEmitter<string>();
  @Output() tabSelected = new EventEmitter<Tab<T>>();
  @ViewChild('navtabs', { read: ElementRef })
  navtabs!: ElementRef<HTMLElement>;
  @ViewChild('tabcontents', { read: ElementRef })
  tabcontents!: ElementRef<HTMLElement>;
  @ViewChildren('tabItem', { read: ElementRef })
  tabItems!: QueryList<ElementRef<HTMLElement>>;
  private resizeObserver!: ResizeObserver;
  //#endregion

  //#region Life cycle
  ngAfterViewInit() {
    const listEls = this.navtabs.nativeElement;
    const tabcontentEls = this.tabcontents.nativeElement;
    listEls.style.setProperty('--nav-list-height', `calc(100% - 2px)`);
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const entry = entries[0];
        const { height } = entry.contentRect;
        tabcontentEls.style.setProperty(
          '--tab-content-height',
          `calc(100% - ${height + 2}px)`
        );
      }
    });
    this.resizeObserver.observe(listEls);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }
  //#endregion

  selectTab(tabId: string) {
    this.tabs = this.tabs.map((t) => ({
      ...t,
      active: t.id === tabId,
    }));
    const selected = this.tabs.find((t) => t.id === tabId);
    const navlinks = document.querySelectorAll(`[data-tab-name]`);
    navlinks.forEach((l) => {
      if (l.getAttribute('data-tab-name') == selected?.title)
        l.classList.add('active');
      else l.classList.remove('active');
    });
    this.tabsChange.emit(this.tabs);
    this.tabSelected.emit(this.tabs.find((t) => t.id === tabId)!);
  }

  removeTab(tabId: string) {
    const newTabs = [...this.tabs];
    const idx = newTabs.findIndex((t) => t.id === tabId);
    if (idx === -1) return;
    const navlinks = document.querySelectorAll(`[data-tab-name]`);
    const wasActive = newTabs[idx].active;
    newTabs.splice(idx, 1);

    if (wasActive && newTabs.length) {
      const newIndex = idx < newTabs.length ? idx : newTabs.length - 1;
      newTabs.forEach((t) => (t.active = false));
      newTabs[newIndex].active = true;
      navlinks.forEach((l) => {
        if (l.getAttribute('data-tab-name') == newTabs[newIndex]?.title)
          l.classList.add('active');
        else l.classList.remove('active');
      });
    }
    if (!newTabs.length)
      navlinks.forEach((l) => {
        l.classList.remove('active');
      });
    this.tabs = newTabs;
    this.tabsChange.emit(this.tabs);
    this.tabRemoved.emit(tabId);
  }
  removeTabWithShortcut(event: KeyboardEvent) {
    event.preventDefault();
    const newTabs = [...this.tabs];
    const idx = newTabs.findIndex((t) => t.active);
    const tabId = newTabs[idx].id;
    if (idx === -1) return;
    const navlinks = document.querySelectorAll(`[data-tab-name]`);
    const wasActive = newTabs[idx].active;
    newTabs.splice(idx, 1);
    if (wasActive && newTabs.length) {
      const newIndex = idx < newTabs.length ? idx : newTabs.length - 1;
      newTabs.forEach((t) => (t.active = false));
      newTabs[newIndex].active = true;
      navlinks.forEach((l) => {
        if (l.getAttribute('data-tab-name') == newTabs[newIndex]?.title)
          l.classList.add('active');
        else l.classList.remove('active');
      });
    }
    if (!newTabs.length)
      navlinks.forEach((l) => {
        l.classList.remove('active');
      });
    this.tabs = newTabs;
    this.tabsChange.emit(this.tabs);
    this.tabRemoved.emit(tabId);
  }
  public scrollToTab(id: string) {
    const tabEl = this.tabItems?.find(
      (t) => t.nativeElement.getAttribute('data-id') === id
    )?.nativeElement;
    if (!tabEl) return;
    tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }
  public onTabsChanged() {
    const active = this.tabs.find((t) => t.active);
    this.scrollToTab(active?.id ?? '');
  }
  public passToChilds(tab: Tab<T>) {
    const passTab = tab.passTabs ? { dynamicTabs: this } : {};
    const passInputs = tab.passInputs ? tab.inputs : {};
    return { ...passTab, ...passInputs };
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
  }
}

export interface Tab<T> {
  id: string;
  title: string;
  content: Type<T>;
  active: boolean;
  passTabs?: boolean;
  passInputs?: boolean;
  inputs?: { [inputName: string]: any };
}
