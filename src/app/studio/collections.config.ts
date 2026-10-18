/**
 * Declarative description of every editable content type. One generic list component and one
 * generic edit form (collections or singletons) are driven entirely by this config, so adding a
 * field is a one-line change. Stats (Numbers) and coverage lists have dedicated components.
 */

export type FieldKind =
  | 'text'
  | 'slug'
  | 'url'
  | 'date'
  | 'number'
  | 'bool'
  | 'localized'
  | 'localizedMultiline'
  | 'localizedList'
  | 'image'
  | 'gallery'
  | 'categorySelect'
  | 'sections';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  help?: string;
  /** Row title in the list view (text / localized). */
  titleField?: boolean;
  /** Secondary line in the list view. */
  subtitleField?: boolean;
  /** Image shown as thumbnail in the list view. */
  thumbField?: boolean;
  /** `gallery`: model key of the main image ("set as main image" swaps with it). */
  mainKey?: string;
  /** `localizedList`: use multi-line textareas (paragraphs). */
  multiline?: boolean;
  /** `image`: logo-like artwork, show without cropping. */
  contain?: boolean;
  /** `text`/`url`/`image`: send null instead of '' when empty. */
  nullable?: boolean;
  /** `number` step attribute. */
  step?: string;
}

export interface CollectionDef {
  /** Unique id; also the default API path and URL segment. */
  key: string;
  /** URL path below /studio/website (defaults to `key`). */
  route?: string;
  /** API path below /api/admin when it differs from `key`. */
  path?: string;
  title: string;
  singular: string;
  icon: string;
  fields: FieldDef[];
  /** One document edited in place (site-settings, legal/*), not a list. */
  singleton?: boolean;
}

const publishedField: FieldDef = { key: 'isPublished', label: 'Опубліковано (видно на сайті)', kind: 'bool' };

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'team',
    title: 'Команда',
    singular: 'учасника команди',
    icon: '👤',
    fields: [
      { key: 'name', label: 'Ім’я', kind: 'localized', titleField: true },
      { key: 'role', label: 'Посада', kind: 'localized', subtitleField: true },
      { key: 'photoUrl', label: 'Фото', kind: 'image', thumbField: true },
      publishedField,
    ],
  },
  {
    key: 'partners',
    title: 'Партнери',
    singular: 'партнера',
    icon: '🤝',
    fields: [
      { key: 'name', label: 'Назва', kind: 'text', titleField: true },
      { key: 'websiteUrl', label: 'Вебсайт', kind: 'url', subtitleField: true },
      { key: 'logoUrl', label: 'Логотип', kind: 'image', thumbField: true, contain: true, help: 'Показується в стрічці логотипів на головній сторінці.' },
      publishedField,
    ],
  },
  {
    key: 'projects',
    title: 'Проєкти',
    singular: 'проєкт',
    icon: '🏗️',
    fields: [
      { key: 'name', label: 'Назва', kind: 'localized', titleField: true },
      { key: 'categoryKey', label: 'Категорія', kind: 'categorySelect', subtitleField: true },
      { key: 'slug', label: 'Адреса сторінки (slug)', kind: 'slug', help: 'Залиште порожнім — адреса створиться з української назви.' },
      { key: 'shortDescription', label: 'Короткий опис (картка)', kind: 'localizedMultiline' },
      { key: 'details', label: 'Перелік характеристик', kind: 'localizedList' },
      { key: 'description', label: 'Повний опис', kind: 'localizedMultiline' },
      { key: 'imageUrl', label: 'Головне зображення', kind: 'image', thumbField: true },
      { key: 'galleryUrls', label: 'Галерея', kind: 'gallery', mainKey: 'imageUrl' },
      { key: 'isFeatured', label: 'Показувати на головній сторінці', kind: 'bool' },
      publishedField,
    ],
  },
  {
    key: 'project-categories',
    route: 'projects/categories',
    title: 'Категорії проєктів',
    singular: 'категорію',
    icon: '🏷️',
    fields: [
      { key: 'label', label: 'Назва категорії', kind: 'localized', titleField: true },
      { key: 'key', label: 'Ключ', kind: 'text', subtitleField: true, help: 'Незмінний ідентифікатор, напр. «industrial». Проєкти посилаються на нього.' },
      publishedField,
    ],
  },
  {
    key: 'testimonials',
    title: 'Відгуки',
    singular: 'відгук',
    icon: '💬',
    fields: [
      { key: 'company', label: 'Компанія', kind: 'text', titleField: true },
      { key: 'author', label: 'Клієнт / автор', kind: 'localized', subtitleField: true },
      { key: 'quote', label: 'Коротка цитата', kind: 'localizedMultiline' },
      { key: 'detailTitle', label: 'Розгорнутий відгук — заголовок', kind: 'localized' },
      { key: 'detail', label: 'Розгорнутий відгук — абзаци', kind: 'localizedList', multiline: true,
        help: 'Залиште порожнім, щоб сховати кнопку «Детальніше» на сайті.' },
      { key: 'galleryUrls', label: 'Зображення до відгуку', kind: 'gallery' },
      publishedField,
    ],
  },
  {
    key: 'services',
    title: 'Послуги',
    singular: 'послугу',
    icon: '🔧',
    fields: [
      { key: 'name', label: 'Назва', kind: 'localized', titleField: true },
      { key: 'slug', label: 'Адреса сторінки (slug)', kind: 'slug', subtitleField: true, help: 'Залиште порожнім — адреса створиться з української назви.' },
      { key: 'summary', label: 'Короткий опис (картка)', kind: 'localizedMultiline' },
      { key: 'description', label: 'Опис', kind: 'localizedMultiline' },
      { key: 'details', label: 'Характеристики', kind: 'localizedList' },
      { key: 'advantages', label: 'Переваги', kind: 'localizedList' },
      { key: 'imageUrl', label: 'Головне зображення', kind: 'image', thumbField: true },
      { key: 'galleryUrls', label: 'Галерея', kind: 'gallery', mainKey: 'imageUrl' },
      publishedField,
    ],
  },
  {
    key: 'blog',
    title: 'Блог',
    singular: 'допис',
    icon: '📝',
    fields: [
      { key: 'title', label: 'Заголовок', kind: 'localized', titleField: true },
      { key: 'publishedOn', label: 'Дата', kind: 'date', subtitleField: true },
      { key: 'slug', label: 'Адреса сторінки (slug)', kind: 'slug' },
      { key: 'excerpt', label: 'Анотація', kind: 'localizedMultiline' },
      { key: 'body', label: 'Текст (абзаци)', kind: 'localizedList', multiline: true },
      { key: 'imageUrl', label: 'Головне зображення', kind: 'image', thumbField: true },
      { key: 'galleryUrls', label: 'Галерея', kind: 'gallery', mainKey: 'imageUrl' },
      publishedField,
    ],
  },

  // ── Singletons ────────────────────────────────────────────
  {
    key: 'media',
    path: 'site-settings',
    singleton: true,
    title: 'Медіа та головний екран',
    singular: 'медіа сайту',
    icon: '🖼️',
    fields: [
      { key: 'heroImageUrl', label: 'Фон головного екрана', kind: 'image', nullable: true, help: 'Великий фон головного екрана на головній сторінці.' },
      { key: 'teamPhotoUrl', label: 'Групове фото команди', kind: 'image', nullable: true },
      { key: 'aboutImageUrl', label: 'Зображення «Про нас»', kind: 'image', nullable: true },
      { key: 'logoUrl', label: 'Логотип', kind: 'image', contain: true, nullable: true },
    ],
  },
  {
    key: 'contacts',
    path: 'site-settings',
    singleton: true,
    title: 'Контакти та соцмережі',
    singular: 'контакти',
    icon: '📞',
    fields: [
      { key: 'phone', label: 'Телефон', kind: 'text' },
      { key: 'email', label: 'Електронна пошта', kind: 'text' },
      { key: 'address', label: 'Адреса', kind: 'localizedMultiline' },
      { key: 'workingHours', label: 'Графік роботи', kind: 'localized' },
      { key: 'mapLat', label: 'Широта на мапі', kind: 'number', step: 'any' },
      { key: 'mapLng', label: 'Довгота на мапі', kind: 'number', step: 'any' },
      { key: 'instagramUrl', label: 'Посилання на Instagram', kind: 'url', nullable: true },
      { key: 'facebookUrl', label: 'Посилання на Facebook', kind: 'url', nullable: true },
      { key: 'youtubeUrl', label: 'Посилання на YouTube', kind: 'url', nullable: true },
    ],
  },
  {
    key: 'legal-privacy',
    route: 'legal/privacy',
    path: 'legal/privacy',
    singleton: true,
    title: 'Політика конфіденційності',
    singular: 'політику конфіденційності',
    icon: '🔒',
    fields: [
      { key: 'title', label: 'Заголовок', kind: 'localized' },
      { key: 'intro', label: 'Вступ', kind: 'localizedMultiline' },
      { key: 'sections', label: 'Розділи', kind: 'sections' },
    ],
  },
  {
    key: 'legal-terms',
    route: 'legal/terms',
    path: 'legal/terms',
    singleton: true,
    title: 'Умови користування',
    singular: 'умови користування',
    icon: '📄',
    fields: [
      { key: 'title', label: 'Заголовок', kind: 'localized' },
      { key: 'intro', label: 'Вступ', kind: 'localizedMultiline' },
      { key: 'sections', label: 'Розділи', kind: 'sections' },
    ],
  },
];

export const collectionByKey = (key: string): CollectionDef | undefined =>
  COLLECTIONS.find((c) => c.key === key);

export const apiPathOf = (def: CollectionDef): string => def.path ?? def.key;
export const routeOf = (def: CollectionDef): string => def.route ?? def.key;
/** Router commands to the list/page of a definition. */
export const listLink = (def: CollectionDef): string[] => ['/studio/website', ...routeOf(def).split('/')];
