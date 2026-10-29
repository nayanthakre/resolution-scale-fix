# scale-fix

Angular library that corrects Windows display scaling so an application keeps its 100% layout.

Windows display scaling between **110%** and **175%** raises `devicePixelRatio` above `1`. Text, layout, and charts then render larger than designed. `ScaleFixService` applies the inverse CSS `zoom` on the document element and dispatches a `resize` event so chart libraries redraw at the corrected size.

Scaling at **100%**, and scaling outside the configured range (for example **200%**), is left unchanged.

## Installation

```bash
npm install scale-fix
```

Peer dependencies:

| Package | Version |
| --- | --- |
| `@angular/core` | `>=12.0.0` |
| `@angular/common` | `>=12.0.0` |

The same package works in an Angular 12 project and in later majors, including future ones. It is published as partial Ivy, and the application links it with its own Angular compiler. Angular versions older than 12 cannot consume that format.

## Usage

`ScaleFixService` is provided in the root injector. Call `init()` once when the application starts.

```typescript
import { Component } from '@angular/core';
import { ScaleFixService } from 'scale-fix';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private readonly scaleFix: ScaleFixService) {
    this.scaleFix.init();
  }
}
```

On Angular 14 or later, `inject(ScaleFixService)` works the same way.

Pass a custom inclusive range when the defaults are not the ones you want. Values are `devicePixelRatio` units (`1.25` is 125% scaling).

```typescript
this.scaleFix.init(1.25, 1.5);
```

## API

### `init(min = 1.1, max = 1.75): void`

Reads `window.devicePixelRatio`, sets `zoom` on `<html>`, and listens for `resize` so the correction follows display-scale changes.

| `devicePixelRatio` | Display scaling | Result |
| --- | --- | --- |
| Below `min` or above `max` | for example 100% or 200% | No correction (`zoom` stays `1`) |
| From `min` through `max` | 110%–175% by default | `zoom` is set to `1 / devicePixelRatio` |

`init()` is safe to call more than once. The resize listener is registered only on the first call.

On the server, `init()` does nothing.

## How it works

1. Read `window.devicePixelRatio` (default `1`).
2. If the ratio is inside `[min, max]`, set `document.documentElement` `zoom` to `1 / devicePixelRatio`.
3. Skip the update when the factor has not changed.
4. Dispatch a `resize` event on the next turn so charts and other resize-aware widgets redraw.

## Build

From this repository:

```bash
npm install
npx ng build scale-fix
```

Build output is written to `dist/scale-fix`.

## Publishing

```bash
cd dist/scale-fix
npm publish --access public
```

## License

[MIT](LICENSE) © 2026 Om Dixit

Anyone may use, copy, modify, publish, distribute, sublicense, and sell this library, including in commercial applications. Copies must keep the copyright notice and the permission notice.
