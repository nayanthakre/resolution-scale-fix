import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScaleFixService {
  private readonly platformId = inject(PLATFORM_ID);
  private lastFactor = 1;
  private started = false;

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
