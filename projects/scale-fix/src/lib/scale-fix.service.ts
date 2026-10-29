import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScaleFixService {
  private lastFactor: number;
  private started: boolean;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.lastFactor = 1;
    this.started = false;
  }

  init(min = 1.1, max = 1.75) {
    if (this.started || !isPlatformBrowser(this.platformId)) return;
    this.started = true;

    const apply = () => {
      const dpr = window.devicePixelRatio || 1;
      const factor = dpr >= min && dpr <= max ? 1 / dpr : 1;

      if (factor === this.lastFactor) return;
      this.lastFactor = factor;

      document.documentElement.style.setProperty('zoom', String(factor));

      // charts ko redraw karne ke liye
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    };

    apply();
    window.addEventListener('resize', apply);
  }
}
