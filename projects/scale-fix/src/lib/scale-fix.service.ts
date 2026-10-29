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

    let lastDpr = window.devicePixelRatio || 1;
    let lastInnerWidth = window.innerWidth;

    const correctionFor = (dpr: number) =>
      dpr >= min && dpr <= max ? 1 / dpr : 1;

    const apply = (dpr: number) => {
      const factor = correctionFor(dpr);

      if (factor === this.lastFactor) return;
      this.lastFactor = factor;

      if (factor === 1) {
        document.documentElement.style.removeProperty('zoom');
      } else {
        document.documentElement.style.setProperty('zoom', String(factor));
      }

      // charts ko redraw karne ke liye
      setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    };

    apply(lastDpr);

    window.addEventListener('resize', () => {
      const dpr = window.devicePixelRatio || 1;
      const innerWidth = window.innerWidth;

      if (dpr === lastDpr) {
        lastInnerWidth = innerWidth;
        return;
      }

      // Ctrl+/- page zoom changes devicePixelRatio and the CSS viewport together
      // (inversely). Pinch-zoom does not change devicePixelRatio. Keep the OS
      // compensation fixed so browser zoom still applies on top of it.
      const dprRatio = dpr / lastDpr;
      const widthRatio =
        lastInnerWidth > 0 && innerWidth > 0 ? lastInnerWidth / innerWidth : NaN;
      const isPageZoom =
        Number.isFinite(widthRatio) && Math.abs(dprRatio - widthRatio) <= 0.05;

      lastDpr = dpr;
      lastInnerWidth = innerWidth;

      if (isPageZoom) return;

      apply(dpr);
    });
  }
}
