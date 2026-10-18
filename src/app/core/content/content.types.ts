/** Single-locale content shapes returned by `GET /api/content/*`. */

export interface PublicService {
  slug: string;
  name: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  gallery: string[];
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
  detailTitle: string;
  detail: string[];
  gallery: string[];
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
  gallery: string[];
  publishedOn: string;
}

export interface PublicSite {
  heroImageUrl: string | null;
  teamPhotoUrl: string | null;
  aboutImageUrl: string | null;
  logoUrl: string | null;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  mapLat: number | null;
  mapLng: number | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
}

export interface PublicStat {
  value: string;
  label: string;
}

export interface PublicStats {
  hero: PublicStat[];
  about: PublicStat[];
  team: PublicStat[];
  metrics: PublicStat[];
}

export interface PublicKeyedName {
  key: string;
  name: string;
}

export interface PublicLegalSection {
  heading: string;
  text: string;
  items: string[];
  textAfter: string;
}

export interface PublicLegalPage {
  title: string;
  intro: string;
  sections: PublicLegalSection[];
}

export interface PublicLegal {
  privacy: PublicLegalPage;
  terms: PublicLegalPage;
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
  site: PublicSite;
  stats: PublicStats;
  exportCountries: PublicKeyedName[];
  regions: PublicKeyedName[];
  legal: PublicLegal;
}

export const EMPTY_SITE: PublicSite = {
  heroImageUrl: null,
  teamPhotoUrl: null,
  aboutImageUrl: null,
  logoUrl: null,
  phone: '',
  email: '',
  address: '',
  workingHours: '',
  mapLat: null,
  mapLng: null,
  instagramUrl: null,
  facebookUrl: null,
  youtubeUrl: null,
};

export const EMPTY_STATS: PublicStats = { hero: [], about: [], team: [], metrics: [] };

export const EMPTY_LEGAL_PAGE: PublicLegalPage = { title: '', intro: '', sections: [] };

export const EMPTY_SITE_CONTENT: SiteContent = {
  language: 'uk',
  services: [],
  projects: [],
  projectCategories: [],
  testimonials: [],
  team: [],
  partners: [],
  blog: [],
  site: EMPTY_SITE,
  stats: EMPTY_STATS,
  exportCountries: [],
  regions: [],
  legal: { privacy: EMPTY_LEGAL_PAGE, terms: EMPTY_LEGAL_PAGE },
};
