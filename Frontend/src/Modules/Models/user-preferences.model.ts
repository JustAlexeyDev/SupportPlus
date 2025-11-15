import { Benefit } from './benefit.model';
import { CommercialOffer } from './benefit.model';
import { BeneficiaryCategory } from './benefit.model';

export interface UserPreferences {
  id: number;
  userId: number;
  hiddenBenefits: Benefit[];
  hiddenOffers: CommercialOffer[];
  favoriteCategories: BeneficiaryCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesDto {
  hiddenBenefitIds?: number[];
  hiddenOfferIds?: number[];
  favoriteCategoryIds?: number[];
}

