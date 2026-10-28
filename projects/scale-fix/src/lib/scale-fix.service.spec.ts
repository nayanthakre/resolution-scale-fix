import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ScaleFixService } from './scale-fix.service';

describe('ScaleFixService', () => {
  const resizeListeners: EventListener[] = [];

  function setDevicePixelRatio(value: number) {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      get: () => value,
    });
  }

  beforeEach(() => {
    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'resize' && typeof listener === 'function') {
        resizeListeners.push(listener);
      }
    });

    document.documentElement.style.removeProperty('zoom');
    setDevicePixelRatio(1);

    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    resizeListeners.length = 0;
    document.documentElement.style.removeProperty('zoom');
    vi.restoreAllMocks();
  });

  it('counter-scales Windows display scaling between 110% and 175%', () => {
    const service = TestBed.inject(ScaleFixService);

    setDevicePixelRatio(1.25);
    service.init();
    expect(document.documentElement.style.getPropertyValue('zoom')).toBe('0.8');

    setDevicePixelRatio(1.5);
    resizeListeners.forEach((listener) => listener(new Event('resize')));
    expect(document.documentElement.style.getPropertyValue('zoom')).toBe(String(1 / 1.5));
  });

  it('leaves 100% and 200% scaling unchanged', () => {
    const service = TestBed.inject(ScaleFixService);

    setDevicePixelRatio(1);
    service.init();
    expect(document.documentElement.style.getPropertyValue('zoom')).toBe('');

    setDevicePixelRatio(2);
    resizeListeners.forEach((listener) => listener(new Event('resize')));
    expect(document.documentElement.style.getPropertyValue('zoom')).toBe('');
  });

  it('registers the resize listener only once', () => {
    const service = TestBed.inject(ScaleFixService);

    service.init();
    service.init();

    expect(resizeListeners).toHaveLength(1);
  });

  it('does nothing during server rendering', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    setDevicePixelRatio(1.5);
    TestBed.inject(ScaleFixService).init();

    expect(document.documentElement.style.getPropertyValue('zoom')).toBe('');
    expect(resizeListeners).toHaveLength(0);
  });
});
