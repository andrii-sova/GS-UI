import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from '../core/api';

export interface LocalizedText {
  uk: string;
  en: string;
}

export interface ContentItem {
  id: string;
  sortOrder: number;
  isPublished: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  updatedBy: string | null;
}

export interface MediaUploadResult {
  url: string;
  blobName: string;
  contentType: string;
  size: number;
}

export interface StudioUserDto {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  isSystemAccount: boolean;
  createdAtUtc: string;
  lastLoginAtUtc: string | null;
}

/** Thin typed wrapper over the `/api/admin/*` endpoints. */
@Injectable({ providedIn: 'root' })
export class StudioApi {
  private readonly http = inject(HttpClient);

  list<T>(collection: string): Promise<T[]> {
    return firstValueFrom(this.http.get<T[]>(apiUrl(`admin/${collection}`)));
  }

  get<T>(collection: string, id: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(apiUrl(`admin/${collection}/${id}`)));
  }

  create<T>(collection: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(apiUrl(`admin/${collection}`), body));
  }

  update<T>(collection: string, id: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(apiUrl(`admin/${collection}/${id}`), body));
  }

  remove(collection: string, id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiUrl(`admin/${collection}/${id}`)));
  }

  setPublished<T>(collection: string, id: string, isPublished: boolean): Promise<T> {
    return firstValueFrom(
      this.http.put<T>(apiUrl(`admin/${collection}/${id}/published`), { isPublished }),
    );
  }

  reorder(collection: string, orderedIds: string[]): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(apiUrl(`admin/${collection}/order`), { orderedIds }),
    );
  }

  uploadImage(file: File): Promise<MediaUploadResult> {
    const form = new FormData();
    form.append('file', file);
    return firstValueFrom(
      this.http.post<MediaUploadResult>(apiUrl('admin/media/images'), form),
    );
  }

  /** Several images in one request; falls back to one request per file when the batch endpoint is unavailable. */
  async uploadImages(files: File[]): Promise<MediaUploadResult[]> {
    if (files.length === 0) return [];
    if (files.length > 1) {
      try {
        const form = new FormData();
        for (const f of files) form.append('files', f);
        return await firstValueFrom(
          this.http.post<MediaUploadResult[]>(apiUrl('admin/media/images/batch'), form),
        );
      } catch (err) {
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        if (status === 401 || status === 403 || status === 413) throw err;
      }
    }
    const results: MediaUploadResult[] = [];
    for (const f of files) results.push(await this.uploadImage(f));
    return results;
  }

  // --- singletons (site-settings, legal/{key}) ---
  getOne<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(apiUrl(`admin/${path}`)));
  }

  putOne<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(apiUrl(`admin/${path}`), body));
  }

  // --- operator accounts ---
  listUsers(): Promise<StudioUserDto[]> {
    return firstValueFrom(this.http.get<StudioUserDto[]>(apiUrl('admin/users')));
  }

  createUser(body: { email: string; displayName: string; password: string }): Promise<StudioUserDto> {
    return firstValueFrom(this.http.post<StudioUserDto>(apiUrl('admin/users'), body));
  }

  updateUser(id: string, body: { displayName: string; isActive: boolean }): Promise<StudioUserDto> {
    return firstValueFrom(this.http.put<StudioUserDto>(apiUrl(`admin/users/${id}`), body));
  }

  changeUserPassword(id: string, newPassword: string): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(apiUrl(`admin/users/${id}/password`), { newPassword }),
    );
  }

  removeUser(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(apiUrl(`admin/users/${id}`)));
  }
}
