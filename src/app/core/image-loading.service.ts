import { Injectable } from '@angular/core';

/**
 * Marks every `<img>` on the page with `.is-loaded` once it has finished loading (or failed), so the
 * stylesheet can show a shimmer placeholder until then. One document-level capture listener covers
 * all components, including images added later (lazy sections, route changes, gallery slides).
 */
@Injectable({ providedIn: 'root' })
export class ImageLoadingService {
  private started = false;

  start(): void {
    if (this.started || typeof document === 'undefined') return;
    this.started = true;

    // `load` / `error` do not bubble, so listen in the capture phase.
    const onDone = (event: Event) => {
      if (event.target instanceof HTMLImageElement) event.target.classList.add('is-loaded');
    };
    document.addEventListener('load', onDone, true);
    document.addEventListener('error', onDone, true);

    // Images served from cache can finish before they are attached: catch those as they appear.
    const markIfDone = (img: HTMLImageElement) => {
      if (img.complete && img.naturalWidth > 0) img.classList.add('is-loaded');
    };
    new MutationObserver((mutations) => {
      for (const m of mutations)
        for (const node of Array.from(m.addedNodes)) {
          if (node instanceof HTMLImageElement) markIfDone(node);
          else if (node instanceof HTMLElement) node.querySelectorAll('img').forEach(markIfDone);
        }
    }).observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('img').forEach(markIfDone);
  }
}
