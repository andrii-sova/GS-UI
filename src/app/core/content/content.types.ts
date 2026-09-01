/** Single-locale content shapes returned by `GET /api/content/*`. */

export interface PublicService {
  slug: string;
  name: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  details: string[];
  advantages: string[];
}

export interface PublicCategory {
  key: string;
  label: string;
}

export interface PublicProject {
  slug: string;
  name: string;
  categoryKey: string;
  categoryLabel: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  details: string[];
  gallery: string[];
  isFeatured: boolean;
}

export interface PublicTestimonial {
  quote: string;
  author: string;
  company: string;
}

export interface PublicTeamMember {
  name: string;
  role: string;
  photoUrl: string | null;
}

export interface PublicPartner {
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
}

export interface PublicBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  imageUrl: string | null;
  publishedOn: string;
}

export interface SiteContent {
  language: string;
  services: PublicService[];
  projects: PublicProject[];
  projectCategories: PublicCategory[];
  testimonials: PublicTestimonial[];
  team: PublicTeamMember[];
  partners: PublicPartner[];
  blog: PublicBlogPost[];
}

export const EMPTY_SITE_CONTENT: SiteContent = {
  language: 'uk',
  services: [],
  projects: [],
  projectCategories: [],
  testimonials: [],
  team: [],
  partners: [],
  blog: [],
};
