import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { LangService } from '../../services/lang.service';
import { apiUrl } from '../api';
import {
  EMPTY_LEGAL_PAGE,
  EMPTY_SITE,
  EMPTY_SITE_CONTENT,
  EMPTY_STATS,
  PublicLegalPage,
  SiteContent,
} from './content.types';

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

  // `value()` throws while the resource is in an error state (even with a defaultValue),
  // which aborts change detection for the whole page when the API is unreachable.
  private readonly content = computed(() =>
    this.resource.hasValue() ? (this.resource.value() ?? EMPTY_SITE_CONTENT) : EMPTY_SITE_CONTENT,
  );

  readonly services = computed(() => this.content().services);
  readonly projects = computed(() => this.content().projects);
  readonly projectCategories = computed(() => this.content().projectCategories);
  readonly testimonials = computed(() => this.content().testimonials);
  readonly team = computed(() => this.content().team);
  readonly partners = computed(() => this.content().partners);
  readonly blog = computed(() => this.content().blog);

  // The API may omit newer fields (older backend / partial payload): every accessor merges
  // over safe empty defaults so templates never dereference undefined.
  readonly site = computed(() => ({ ...EMPTY_SITE, ...(this.content().site ?? {}) }));
  readonly stats = computed(() => ({ ...EMPTY_STATS, ...(this.content().stats ?? {}) }));
  readonly exportCountries = computed(() => this.content().exportCountries ?? []);
  readonly regions = computed(() => this.content().regions ?? []);
  readonly exportCountryKeys = computed(() => new Set(this.exportCountries().map((c) => c.key)));
  readonly regionKeys = computed(() => new Set(this.regions().map((r) => r.key)));
  readonly privacy = computed<PublicLegalPage>(() => this.content().legal?.privacy ?? EMPTY_LEGAL_PAGE);
  readonly terms = computed<PublicLegalPage>(() => this.content().legal?.terms ?? EMPTY_LEGAL_PAGE);

  /** Digits (and a leading +) of the phone number, for `tel:` links. */
  readonly phoneHref = computed(() => {
    const raw = this.site().phone ?? '';
    const digits = raw.replace(/[^\d]/g, '');
    return digits ? `tel:+${digits}` : '';
  });

  /** Google Maps link built from the configured coordinates ('' when unset). */
  readonly mapLink = computed(() => {
    const { mapLat, mapLng } = this.site();
    return mapLat != null && mapLng != null
      ? `https://www.google.com/maps?q=${mapLat},${mapLng}`
      : '';
  });

  /** Embeddable map URL ('' when coordinates are unset). */
  readonly mapEmbedUrl = computed(() => {
    const link = this.mapLink();
    return link ? `${link}&output=embed` : '';
  });

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
