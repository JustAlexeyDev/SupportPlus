export enum BenefitType {
  FEDERAL = 'federal',
  REGIONAL = 'regional',
  MUNICIPAL = 'municipal',
}

export interface BeneficiaryCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Benefit {
  id: number;
  benefitId: string;
  title: string;
  type: BenefitType;
  targetGroups: BeneficiaryCategory[];
  regions: string[];
  validFrom: string;
  validTo: string;
  requirements?: string;
  howToGet?: string;
  sourceUrl?: string;
  partner?: string | null;
  popularity: number;
  requiresConfirmation: boolean;
  createdAt: string;
  updatedAt: string;
  isCommercial?: boolean;
  isExpiringSoon?: boolean;
}

export interface CommercialOffer {
  id: number;
  offerId: string;
  title: string;
  type: 'pharmacy' | 'store' | 'housing' | 'other';
  targetGroups: BeneficiaryCategory[];
  regions: string[];
  validFrom: string;
  validTo: string;
  requirements?: string;
  howToGet?: string;
  sourceUrl?: string;
  partner: string;
  description?: string;
  popularity: number;
  requiresConfirmation: boolean;
  createdAt: string;
  updatedAt: string;
  isExpiringSoon?: boolean;
}

export interface SearchBenefitsParams {
  query?: string;
  type?: BenefitType[];
  categoryIds?: number[];
  regions?: string[];
  termFilter?: ('active' | 'expiring_soon' | 'requires_confirmation')[];
  sortBy?: 'relevance' | 'date' | 'popularity';
  page?: number;
  limit?: number;
}

export interface SearchBenefitsResponse {
  data: (Benefit | CommercialOffer)[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserBenefitsResponse {
  federal: Benefit[];
  regional: Benefit[];
  municipal: Benefit[];
  commercial: CommercialOffer[];
}

