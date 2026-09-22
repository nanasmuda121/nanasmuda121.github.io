import profileJson from "./profile.json";
import projectsJson from "./projects.json";

export interface ProjectCategory {
  id: string;
  name: string;
}

export interface ProductItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Web Application" | "Android Application" | "Developer Tool" | string;
  price: number;
  formattedPrice: string;
  description: string;
  features: string[];
  techStack: string[];
  logo: string;
  demoUrl?: string;
  apkUrl?: string;
  badge?: string;
  featured?: boolean;
}

export interface ProfileIdentity {
  fullName: string;
  shortName: string;
  initials: string;
  role: string;
  tagline: string;
  description: string;
  statusBadge: string;
  phone: string;
  whatsappFormatted: string;
  whatsappUrl: string;
  location: string;
  github: string;
  socials?: {
    github?: string;
    whatsapp?: string;
    [key: string]: string | undefined;
  };
  guarantees?: string[];
}

export const PORTFOLIO_DATA = {
  identity: profileJson as ProfileIdentity,
  categories: projectsJson.categories as ProjectCategory[],
  products: projectsJson.projects as ProductItem[],
};
