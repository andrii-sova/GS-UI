import {
  ChangeDetectionStrategy, Component, HostListener, computed, inject, linkedSignal, resource, signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { StudioApi } from '../studio-api';
import { CollectionDef, FieldDef, apiPathOf, collectionByKey, listLink } from '../collections.config';
import { ImageFieldComponent } from '../media/image-field';
import { GalleryFieldComponent } from '../media/gallery-field';
import { LegalSection, SectionsFieldComponent, blankSection } from '../fields/sections-field';
import { T } from '../studio-i18n';
import { LocListComponent, LocPairComponent } from '../shared/loc-field';
import { StudioToast } from '../shared/toast';
import { StudioConfirm } from '../shared/confirm';
import {
  LocalizedText, blankLoc, fieldMissingEn, missingTranslations,
} from '../shared/localized';
import { HasUnsavedChanges } from './unsaved-changes.guard';

type Model = Record<string, unknown>;

@Component({
  selector: 'app-collection-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ImageFieldComponent, GalleryFieldComponent, SectionsFieldComponent, LocPairComponent, LocListComponent],
  templateUrl: './collection-form.html',
})
export class CollectionFormComponent implements HasUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(StudioApi);
  private readonly toast = inject(StudioToast);
  private readonly confirm = inject(StudioConfirm);
  protected readonly t = T;

  readonly collectionKey = toSignal(
    this.route.data.pipe(map((d) => String(d['collection'] ?? ''))),
    { initialValue: '' },
  );
  readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? 'new')), {
    initialValue: 'new',
  });

  readonly def = computed<CollectionDef | undefined>(() => collectionByKey(this.collectionKey()));
  readonly isSingleton = computed(() => !!this.def()?.singleton);
  readonly isNew = computed(() => !this.isSingleton() && this.id() === 'new');
  readonly backLink = computed(() => {
    const d = this.def();
    return d ? listLink(d) : ['/studio'];
  });

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly loaded = resource({
    params: () => {
      const d = this.def();
      return d ? { key: d.key, id: this.id() } : undefined;
    },
    loader: async ({ params }): Promise<Model> => {
      const def = collectionByKey(params.key)!;
      if (def.singleton) return this.api.getOne<Model>(apiPathOf(def));
      if (params.id === 'new') return blankModel(def);
      return this.api.get<Model>(apiPathOf(def), params.id);
    },
  });

  private readonly initial = computed<Model | null>(() => {
    const d = this.def();
    const v = this.loaded.hasValue() ? this.loaded.value() : undefined;
    return d && v ? normalise(d, v) : null;
  });

  readonly model = linkedSignal<Model>(() => this.initial() ?? {});
  private readonly pristine = linkedSignal<string>(() => {
    const i = this.initial();
    return i ? JSON.stringify(i) : '';
  });
  private savedAndLeaving = false;

  readonly dirty = computed(
    () => this.pristine() !== '' && JSON.stringify(this.model()) !== this.pristine(),
  );

  readonly hasLocalized = computed(() =>
    !!this.def()?.fields.some((f) => ['localized', 'localizedMultiline', 'localizedList', 'sections'].includes(f.kind)),
  );
  readonly missing = computed(() => {
    const d = this.def();
    return d ? missingTranslations(d.fields, this.model()) : [];
  });

  /** Category options for `categorySelect` fields. */
  readonly categories = resource({
    params: () => (this.def()?.fields.some((f) => f.kind === 'categorySelect') ? true : undefined),
    loader: () => this.api.list<{ key: string; label: LocalizedText }>('project-categories'),
  });
  readonly categoryOptions = computed(() =>
    (this.categories.hasValue() ? this.categories.value() : []).map((c) => ({
      key: c.key,
      label: c.label?.uk || c.label?.en || c.key,
    })),
  );

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty() && !this.savedAndLeaving) event.preventDefault();
  }

  @HostListener('document:keydown.control.s', ['$event'])
  onCtrlS(event: Event): void {
    event.preventDefault();
    if (!this.saving() && this.initial()) void this.save();
  }

  /** Router `canDeactivate` hook. */
  canLeave(): boolean | Promise<boolean> {
    if (!this.dirty() || this.savedAndLeaving) return true;
    return this.confirm.ask({
      title: T.form.discardTitle,
      message: T.form.discardMessage,
      confirmLabel: T.form.discardConfirm,
      cancelLabel: T.common.keepEditing,
      danger: true,
    });
  }

  // ── model accessors ──────────────────────────────────────
  value(key: string): unknown { return this.model()[key]; }
  str(key: string): string { return String(this.model()[key] ?? ''); }
  set(key: string, value: unknown): void { this.model.update((m) => ({ ...m, [key]: value })); }
  inputValue(event: Event): string { return (event.target as HTMLInputElement).value; }

  loc(key: string): LocalizedText { return (this.model()[key] as LocalizedText) ?? blankLoc(); }

  list(key: string): LocalizedText[] { return (this.model()[key] as LocalizedText[]) ?? []; }

  strings(key: string): string[] { return (this.model()[key] as string[]) ?? []; }
  sections(key: string): LegalSection[] { return (this.model()[key] as LegalSection[]) ?? []; }
  imageOf(key: string | undefined): string | null {
    return key ? ((this.model()[key] as string | null) ?? null) : null;
  }

  fieldMissing(field: FieldDef): boolean { return fieldMissingEn(field, this.model()[field.key]); }

  discard(): void {
    const i = this.initial();
    if (i) this.model.set(structuredClone(i));
  }

  async save(): Promise<void> {
    const def = this.def();
    if (!def || this.saving()) return;
    this.error.set(null);
    this.saving.set(true);
    try {
      const body = buildRequest(def, this.model(), this.loaded.value());
      if (def.singleton) {
        await this.api.putOne(apiPathOf(def), body);
        this.pristine.set(JSON.stringify(this.model()));
      } else if (this.isNew()) {
        await this.api.create(apiPathOf(def), body);
        this.savedAndLeaving = true;
      } else {
        await this.api.update(apiPathOf(def), this.id(), body);
        this.savedAndLeaving = true;
      }
      const missing = this.missing();
      if (missing.length) {
        this.toast.warn(T.lang.savedWarn(missing.join(', ')));
      } else {
        this.toast.success(T.common.saved);
      }
      if (!def.singleton) await this.router.navigate(listLink(def));
    } catch (err) {
      this.savedAndLeaving = false;
      this.error.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}

function blankModel(def: CollectionDef): Model {
  const model: Model = {};
  for (const field of def.fields) model[field.key] = blankValue(field);
  return model;
}

function blankValue(field: FieldDef): unknown {
  switch (field.kind) {
    case 'localized':
    case 'localizedMultiline':
      return blankLoc();
    case 'localizedList':
    case 'gallery':
    case 'sections':
      return [];
    case 'bool':
      return field.key === 'isPublished';
    case 'date':
      return new Date().toISOString().slice(0, 10);
    case 'image':
      return null;
    case 'number':
      return 0;
    default:
      return '';
  }
}

const asLoc = (v: unknown): LocalizedText => {
  const o = (v ?? {}) as Partial<LocalizedText>;
  return { uk: o.uk ?? '', en: o.en ?? '' };
};

/** Fill any missing field so template bindings never hit undefined. */
function normalise(def: CollectionDef, model: Model): Model {
  const next: Model = { ...model };
  for (const field of def.fields) {
    const v = next[field.key];
    if (v == null) {
      next[field.key] = blankValue(field);
      continue;
    }
    if (field.kind === 'localized' || field.kind === 'localizedMultiline') next[field.key] = asLoc(v);
    else if (field.kind === 'localizedList') next[field.key] = ((v as unknown[]) ?? []).map(asLoc);
    else if (field.kind === 'sections') {
      next[field.key] = ((v as Array<Partial<LegalSection>>) ?? []).map((s) => ({
        ...blankSection(),
        heading: asLoc(s.heading),
        text: asLoc(s.text),
        items: (s.items ?? []).map(asLoc),
        textAfter: asLoc(s.textAfter),
      }));
    }
  }
  if (!def.singleton && next['isPublished'] == null) next['isPublished'] = true;
  return next;
}

function buildRequest(def: CollectionDef, model: Model, raw: Model | undefined): Model {
  const body: Model = {};
  if (def.singleton) {
    Object.assign(body, raw ?? {});
    delete body['updatedAtUtc'];
    delete body['updatedBy'];
  } else {
    body['isPublished'] = !!model['isPublished'];
  }
  const nonEmpty = (v: LocalizedText) => !!(v.uk?.trim() || v.en?.trim());

  for (const field of def.fields) {
    if (field.key === 'isPublished') continue;
    const value = model[field.key];
    switch (field.kind) {
      case 'localizedList':
        body[field.key] = ((value as LocalizedText[]) ?? []).filter(nonEmpty);
        break;
      case 'sections':
        body[field.key] = ((value as LegalSection[]) ?? [])
          .map((s) => ({ ...s, items: s.items.filter(nonEmpty) }))
          .filter((s) => nonEmpty(s.heading) || nonEmpty(s.text) || s.items.length || nonEmpty(s.textAfter));
        break;
      case 'gallery':
        body[field.key] = ((value as string[]) ?? []).filter((v) => v?.trim());
        break;
      case 'image':
      case 'url':
      case 'slug':
        body[field.key] = value ? String(value).trim() || null : null;
        break;
      case 'text': {
        const t = String(value ?? '').trim();
        body[field.key] = field.nullable && !t ? null : t;
        break;
      }
      case 'number': {
        const n = Number(value);
        body[field.key] = Number.isFinite(n) ? n : 0;
        break;
      }
      case 'bool':
        body[field.key] = !!value;
        break;
      default:
        body[field.key] = value ?? null;
    }
  }
  return body;
}

function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const problem = err.error;
    if (problem?.errors) {
      return Object.values(problem.errors as Record<string, string[]>).flat().join(' ');
    }
    if (problem?.title) return String(problem.title);
    if (err.status === 0) return T.form.networkError;
  }
  return T.form.saveError;
}
