import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { LangService } from '../../services/lang.service';
import { apiUrl } from '../api';
import { EMPTY_SITE_CONTENT, SiteContent } from './content.types';

/**
 * Loads all published website content from `GET /api/content` and re-fetches whenever the
 * active language changes. Components read the collection signals here instead of the old
 * compile-time i18n dictionaries (chrome copy still comes from `LangService.dict()`).
 */
@Injectable({ providedIn: 'root' })
export class ContentStore {
  private readonly lang = inject(LangService);

  private readonly resource = httpResource<SiteContent>(
    () => apiUrl(`content?lang=${this.lang.lang()}`),
    { defaultValue: EMPTY_SITE_CONTENT },
  );

  readonly isLoading = this.resource.isLoading;
  readonly hasError = computed(() => this.resource.error() != null);

  private readonly content = computed(() => this.resource.value() ?? EMPTY_SITE_CONTENT);

  readonly services = computed(() => this.content().services);
  readonly projects = computed(() => this.content().projects);
  readonly projectCategories = computed(() => this.content().projectCategories);
  readonly testimonials = computed(() => this.content().testimonials);
  readonly team = computed(() => this.content().team);
  readonly partners = computed(() => this.content().partners);
  readonly blog = computed(() => this.content().blog);

  readonly featuredProjects = computed(() => {
    const featured = this.projects().filter((p) => p.isFeatured);
    return featured.length > 0 ? featured : this.projects();
  });

  serviceBySlug(slug: string) {
    return computed(() => this.services().find((s) => s.slug === slug) ?? null);
  }

  projectBySlug(slug: string) {
    return computed(() => this.projects().find((p) => p.slug === slug) ?? null);
  }

  blogPostBySlug(slug: string) {
    return computed(() => this.blog().find((p) => p.slug === slug) ?? null);
  }

  /** Force a refetch (used by the studio after edits, if it shares this app instance). */
  reload(): void {
    this.resource.reload();
  }
}
