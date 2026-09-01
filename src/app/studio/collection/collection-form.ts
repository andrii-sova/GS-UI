import { Component, computed, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { StudioApi } from '../studio-api';
import { CollectionDef, FieldDef, collectionByKey } from '../collections.config';
import { ImageFieldComponent } from '../media/image-field';

type Model = Record<string, unknown>;

@Component({
  selector: 'app-collection-form',
  imports: [FormsModule, RouterLink, ImageFieldComponent],
  templateUrl: './collection-form.html',
})
export class CollectionFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(StudioApi);

  readonly collectionKey = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('collection') ?? '')),
    { initialValue: '' },
  );
  readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? 'new')), {
    initialValue: 'new',
  });

  readonly def = computed<CollectionDef | undefined>(() => collectionByKey(this.collectionKey()));
  readonly isNew = computed(() => this.id() === 'new');

  readonly model = signal<Model>({});
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  /** Category options for `categorySelect` fields. */
  readonly categories = resource({
    loader: () => this.api.list<{ key: string; label: { uk: string } }>('project-categories'),
  });

  private get path(): string {
    return this.def()?.path ?? this.def()!.key;
  }

  readonly loaded = resource({
    params: () => ({ key: this.collectionKey(), id: this.id() }),
    loader: async ({ params }) => {
      const def = collectionByKey(params.key);
      if (!def) return {};
      const model = params.id === 'new'
        ? blankModel(def)
        : await this.api.get<Model>(def.path ?? def.key, params.id);
      this.model.set(normalise(def, model));
      return model;
    },
  });

  asList(key: string): Array<{ uk: string; en: string }> {
    return (this.model()[key] as Array<{ uk: string; en: string }>) ?? [];
  }

  asStringList(key: string): string[] {
    return (this.model()[key] as string[]) ?? [];
  }

  localized(key: string): { uk: string; en: string } {
    return (this.model()[key] as { uk: string; en: string }) ?? { uk: '', en: '' };
  }

  categoryOptions(): Array<{ key: string; label: string }> {
    return (this.categories.value() ?? []).map((c) => ({ key: c.key, label: c.label.uk }));
  }

  addListItem(key: string, kind: 'localized' | 'string'): void {
    const next = { ...this.model() };
    const arr = [...((next[key] as unknown[]) ?? [])];
    arr.push(kind === 'localized' ? { uk: '', en: '' } : '');
    next[key] = arr;
    this.model.set(next);
  }

  removeListItem(key: string, index: number): void {
    const next = { ...this.model() };
    const arr = [...((next[key] as unknown[]) ?? [])];
    arr.splice(index, 1);
    next[key] = arr;
    this.model.set(next);
  }

  setStringListItem(key: string, index: number, value: string | null): void {
    const next = { ...this.model() };
    const arr = [...((next[key] as string[]) ?? [])];
    arr[index] = value ?? '';
    next[key] = arr;
    this.model.set(next);
  }

  bump(): void {
    // Force a new reference so ngModel-mutated nested objects re-render predictably.
    this.model.set({ ...this.model() });
  }

  async save(): Promise<void> {
    const def = this.def();
    if (!def) return;
    this.error.set(null);
    this.saving.set(true);
    try {
      const body = buildRequest(def, this.model());
      if (this.isNew()) {
        await this.api.create(this.path, body);
      } else {
        await this.api.update(this.path, this.id(), body);
      }
      await this.router.navigate(['/studio', def.key]);
    } catch (err) {
      this.error.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}

function blankModel(def: CollectionDef): Model {
  const model: Model = { isPublished: true };
  for (const field of def.fields) model[field.key] = blankValue(field);
  return model;
}

function blankValue(field: FieldDef): unknown {
  switch (field.kind) {
    case 'localized':
    case 'localizedMultiline':
      return { uk: '', en: '' };
    case 'localizedList':
    case 'imageList':
      return [];
    case 'checkbox':
      return field.key === 'isPublished';
    case 'date':
      return new Date().toISOString().slice(0, 10);
    default:
      return '';
  }
}

/** Fill any missing field so template bindings never hit undefined. */
function normalise(def: CollectionDef, model: Model): Model {
  const next: Model = { ...model };
  for (const field of def.fields) {
    if (next[field.key] == null) next[field.key] = blankValue(field);
  }
  if (next['isPublished'] == null) next['isPublished'] = true;
  return next;
}

function buildRequest(def: CollectionDef, model: Model): Model {
  const body: Model = { isPublished: !!model['isPublished'] };
  for (const field of def.fields) {
    if (field.key === 'isPublished') continue;
    const value = model[field.key];
    switch (field.kind) {
      case 'localizedList':
        body[field.key] = ((value as Array<{ uk: string; en: string }>) ?? []).filter(
          (v) => v.uk?.trim() || v.en?.trim(),
        );
        break;
      case 'imageList':
        body[field.key] = ((value as string[]) ?? []).filter((v) => v?.trim());
        break;
      case 'image':
      case 'url':
      case 'slug':
        body[field.key] = value ? String(value).trim() : null;
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
      return Object.values(problem.errors as Record<string, string[]>)
        .flat()
        .join(' ');
    }
    if (problem?.title) return String(problem.title);
  }
  return 'Could not save. Please review the fields and try again.';
}
