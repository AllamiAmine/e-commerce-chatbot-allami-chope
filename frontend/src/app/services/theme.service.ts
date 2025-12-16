import { Injectable, signal } from '@angular/core';

type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'allami-theme';
  private currentTheme = signal<ThemeMode>('light');

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    const stored = (localStorage.getItem(this.storageKey) as ThemeMode | null);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    const initial: ThemeMode = stored ?? (prefersDark ? 'dark' : 'light');
    this.setTheme(initial);
  }

  get theme() {
    return this.currentTheme.asReadonly();
  }

  toggleTheme(): void {
    const next: ThemeMode = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  private setTheme(mode: ThemeMode): void {
    this.currentTheme.set(mode);
    localStorage.setItem(this.storageKey, mode);

    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}


