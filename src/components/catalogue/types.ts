export interface CatalogueAction {
  label: string;
  href: string;
  primary?: boolean;
}

export interface CatalogueChapterItem {
  title: string;
  href: string;
  description?: string;
  order?: number;
  badges?: string[];
}
