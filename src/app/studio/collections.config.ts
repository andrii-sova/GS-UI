/**
 * Declarative description of every editable collection. One generic list component and one
 * generic edit form are driven entirely by this config, so adding a field is a one-line change.
 */

export type FieldKind =
  | 'text'
  | 'slug'
  | 'localized'
  | 'localizedMultiline'
  | 'localizedList'
  | 'image'
  | 'imageList'
  | 'url'
  | 'date'
  | 'checkbox'
  | 'categorySelect';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  help?: string;
  /** For `text`/`localized`: show as the row title in the list view. */
  titleField?: boolean;
}

export interface CollectionDef {
  /** Route segment + API collection name. */
  key: string;
  /** API path segment when it differs from `key`. */
  path?: string;
  title: string;
  singular: string;
  icon: string;
  fields: FieldDef[];
}

const publishedField: FieldDef = { key: 'isPublished', label: 'Published', kind: 'checkbox' };

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'services',
    title: 'Services',
    singular: 'Service',
    icon: '🔧',
    fields: [
      { key: 'name', label: 'Name', kind: 'localized', titleField: true },
      { key: 'slug', label: 'Slug', kind: 'slug', help: 'Leave blank to generate from the Ukrainian name.' },
      { key: 'summary', label: 'Card summary', kind: 'localizedMultiline' },
      { key: 'description', label: 'Full description', kind: 'localizedMultiline' },
      { key: 'imageUrl', label: 'Image', kind: 'image' },
      { key: 'details', label: 'Specifications', kind: 'localizedList' },
      { key: 'advantages', label: 'Advantages', kind: 'localizedList' },
      publishedField,
    ],
  },
  {
    key: 'projects',
    title: 'Portfolio projects',
    singular: 'Project',
    icon: '🏗️',
    fields: [
      { key: 'name', label: 'Name', kind: 'localized', titleField: true },
      { key: 'slug', label: 'Slug', kind: 'slug' },
      { key: 'categoryKey', label: 'Category', kind: 'categorySelect' },
      { key: 'shortDescription', label: 'Card description', kind: 'localizedMultiline' },
      { key: 'description', label: 'Full description', kind: 'localizedMultiline' },
      { key: 'imageUrl', label: 'Cover image', kind: 'image' },
      { key: 'details', label: 'Project details', kind: 'localizedList' },
      { key: 'galleryUrls', label: 'Gallery', kind: 'imageList' },
      { key: 'isFeatured', label: 'Featured on home page', kind: 'checkbox' },
      publishedField,
    ],
  },
  {
    key: 'project-categories',
    path: 'project-categories',
    title: 'Project categories',
    singular: 'Category',
    icon: '🏷️',
    fields: [
      { key: 'key', label: 'Key', kind: 'text', titleField: true, help: 'Stable identifier, e.g. "industrial".' },
      { key: 'label', label: 'Label', kind: 'localized' },
      publishedField,
    ],
  },
  {
    key: 'testimonials',
    title: 'Testimonials',
    singular: 'Testimonial',
    icon: '💬',
    fields: [
      { key: 'company', label: 'Company', kind: 'text', titleField: true },
      { key: 'author', label: 'Author', kind: 'localized' },
      { key: 'quote', label: 'Quote', kind: 'localizedMultiline' },
      publishedField,
    ],
  },
  {
    key: 'team',
    title: 'Team',
    singular: 'Team member',
    icon: '👤',
    fields: [
      { key: 'name', label: 'Name', kind: 'text', titleField: true },
      { key: 'role', label: 'Role', kind: 'localized' },
      { key: 'photoUrl', label: 'Photo', kind: 'image' },
      publishedField,
    ],
  },
  {
    key: 'partners',
    title: 'Partners',
    singular: 'Partner',
    icon: '🤝',
    fields: [
      { key: 'name', label: 'Name', kind: 'text', titleField: true },
      { key: 'logoUrl', label: 'Logo', kind: 'image' },
      { key: 'websiteUrl', label: 'Website', kind: 'url' },
      publishedField,
    ],
  },
  {
    key: 'blog',
    title: 'Blog',
    singular: 'Post',
    icon: '📝',
    fields: [
      { key: 'title', label: 'Title', kind: 'localized', titleField: true },
      { key: 'slug', label: 'Slug', kind: 'slug' },
      { key: 'publishedOn', label: 'Publication date', kind: 'date' },
      { key: 'excerpt', label: 'Excerpt', kind: 'localizedMultiline' },
      { key: 'body', label: 'Body paragraphs', kind: 'localizedList' },
      { key: 'imageUrl', label: 'Cover image', kind: 'image' },
      publishedField,
    ],
  },
];

export const collectionByKey = (key: string): CollectionDef | undefined =>
  COLLECTIONS.find((c) => c.key === key);
