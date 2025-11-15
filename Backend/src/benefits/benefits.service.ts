import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, MoreThanOrEqual, LessThanOrEqual, Or } from 'typeorm';
import { Benefit, BenefitType } from './entities/benefit.entity';
import { CommercialOffer, CommercialOfferType } from './entities/commercial-offer.entity';
import { BeneficiaryCategory } from '../beneficiary-categories/entities/beneficiary-category.entity';
import { UserPreferences } from '../users/entities/user-preferences.entity';
import { SearchBenefitsDto, SortBy, TermFilter } from './dto/search-benefits.dto';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { CreateCommercialOfferDto } from './dto/create-commercial-offer.dto';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(Benefit)
    private benefitsRepository: Repository<Benefit>,
    @InjectRepository(CommercialOffer)
    private commercialOffersRepository: Repository<CommercialOffer>,
    @InjectRepository(BeneficiaryCategory)
    private categoriesRepository: Repository<BeneficiaryCategory>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
  ) {}

  async searchBenefits(searchDto: SearchBenefitsDto, userRegion?: string, userCategoryIds?: number[]) {
    const { query, type, categoryIds, regions, termFilter, sortBy, page = 1, limit = 20 } = searchDto;
    

    const benefitsQuery = this.benefitsRepository.createQueryBuilder('benefit')
      .leftJoinAndSelect('benefit.targetGroups', 'targetGroup');


    const offersQuery = this.commercialOffersRepository.createQueryBuilder('offer')
      .leftJoinAndSelect('offer.targetGroups', 'targetGroup');


    if (query) {
      const searchTerm = `%${query.toLowerCase()}%`;
      benefitsQuery.andWhere(
        '(LOWER(benefit.title) LIKE :search OR LOWER(benefit.requirements) LIKE :search OR LOWER(benefit.howToGet) LIKE :search)',
        { search: searchTerm }
      );
      offersQuery.andWhere(
        '(LOWER(offer.title) LIKE :search OR LOWER(offer.requirements) LIKE :search OR LOWER(offer.howToGet) LIKE :search OR LOWER(offer.description) LIKE :search)',
        { search: searchTerm }
      );
    }


    if (type && type.length > 0) {
      benefitsQuery.andWhere('benefit.type IN (:...types)', { types: type });
    }


    if (categoryIds && categoryIds.length > 0) {
      benefitsQuery.andWhere('targetGroup.id IN (:...categoryIds)', { categoryIds });
      offersQuery.andWhere('targetGroup.id IN (:...categoryIds)', { categoryIds });
    }


    const effectiveRegions = regions || (userRegion ? [userRegion, 'all'] : ['all']);
    benefitsQuery.andWhere(
      '(benefit.regions LIKE :region OR benefit.regions LIKE :all)',
      { region: `%${userRegion || ''}%`, all: '%all%' }
    );
    offersQuery.andWhere(
      '(offer.regions LIKE :region OR offer.regions LIKE :all)',
      { region: `%${userRegion || ''}%`, all: '%all%' }
    );


    const now = new Date();
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 30);

    if (termFilter && termFilter.length > 0) {
      const conditions: string[] = [];
      
      if (termFilter.includes(TermFilter.ACTIVE)) {
        conditions.push('(benefit.validFrom <= :now AND benefit.validTo >= :now)');
      }
      if (termFilter.includes(TermFilter.EXPIRING_SOON)) {
        conditions.push('(benefit.validTo >= :now AND benefit.validTo <= :soon)');
      }
      if (termFilter.includes(TermFilter.REQUIRES_CONFIRMATION)) {
        conditions.push('benefit.requiresConfirmation = :requiresConfirmation');
      }
      
      if (conditions.length > 0) {
        benefitsQuery.andWhere(`(${conditions.join(' OR ')})`, { 
          now, 
          soon: soonDate, 
          requiresConfirmation: true 
        });
        

        const offerConditions: string[] = [];
        if (termFilter.includes(TermFilter.ACTIVE)) {
          offerConditions.push('(offer.validFrom <= :now AND offer.validTo >= :now)');
        }
        if (termFilter.includes(TermFilter.EXPIRING_SOON)) {
          offerConditions.push('(offer.validTo >= :now AND offer.validTo <= :soon)');
        }
        if (termFilter.includes(TermFilter.REQUIRES_CONFIRMATION)) {
          offerConditions.push('offer.requiresConfirmation = :requiresConfirmation');
        }
        if (offerConditions.length > 0) {
          offersQuery.andWhere(`(${offerConditions.join(' OR ')})`, { 
            now, 
            soon: soonDate, 
            requiresConfirmation: true 
          });
        }
      }
    } else {

      benefitsQuery.andWhere('benefit.validFrom <= :now AND benefit.validTo >= :now', { now });
      offersQuery.andWhere('offer.validFrom <= :now AND offer.validTo >= :now', { now });
    }


    if (sortBy === SortBy.POPULARITY) {
      benefitsQuery.orderBy('benefit.popularity', 'DESC');
      offersQuery.orderBy('offer.popularity', 'DESC');
    } else if (sortBy === SortBy.DATE) {
      benefitsQuery.orderBy('benefit.validFrom', 'DESC');
      offersQuery.orderBy('offer.validFrom', 'DESC');
    } else {

      benefitsQuery.orderBy('benefit.popularity', 'DESC').addOrderBy('benefit.validFrom', 'DESC');
      offersQuery.orderBy('offer.popularity', 'DESC').addOrderBy('offer.validFrom', 'DESC');
    }


    const skip = (page - 1) * limit;
    benefitsQuery.skip(skip).take(limit);
    offersQuery.skip(skip).take(limit);

    const [benefits, benefitsCount] = await benefitsQuery.getManyAndCount();
    const [offers, offersCount] = await offersQuery.getManyAndCount();


    const allResults = [
      ...benefits.map(b => ({ ...b, isCommercial: false })),
      ...offers.map(o => ({ ...o, isCommercial: true })),
    ];


    if (sortBy === SortBy.RELEVANCE) {
      allResults.sort((a, b) => {

        const aRelevance = this.calculateRelevance(a, userCategoryIds, userRegion);
        const bRelevance = this.calculateRelevance(b, userCategoryIds, userRegion);
        return bRelevance - aRelevance;
      });
    }

    return {
      data: allResults,
      total: benefitsCount + offersCount,
      page,
      limit,
      totalPages: Math.ceil((benefitsCount + offersCount) / limit),
    };
  }

  private calculateRelevance(item: any, userCategoryIds?: number[], userRegion?: string): number {
    let relevance = item.popularity || 0;
    

    if (userCategoryIds && item.targetGroups) {
      const matchingCategories = item.targetGroups.filter((tg: BeneficiaryCategory) =>
        userCategoryIds.includes(tg.id)
      ).length;
      relevance += matchingCategories * 10;
    }
    

    if (userRegion && item.regions) {
      if (item.regions.includes('all') || item.regions.includes(userRegion)) {
        relevance += 5;
      }
    }
    
    return relevance;
  }

  async getUserBenefits(userId: number, userRegion?: string, userCategoryIds?: number[]) {

    const now = new Date();
    
    const benefitsQuery = this.benefitsRepository.createQueryBuilder('benefit')
      .leftJoinAndSelect('benefit.targetGroups', 'targetGroup')
      .where('benefit.validFrom <= :now AND benefit.validTo >= :now', { now });

    const offersQuery = this.commercialOffersRepository.createQueryBuilder('offer')
      .leftJoinAndSelect('offer.targetGroups', 'targetGroup')
      .where('offer.validFrom <= :now AND offer.validTo >= :now', { now });


    if (userCategoryIds && userCategoryIds.length > 0) {
      benefitsQuery.andWhere('targetGroup.id IN (:...categoryIds)', { categoryIds: userCategoryIds });
      offersQuery.andWhere('targetGroup.id IN (:...categoryIds)', { categoryIds: userCategoryIds });
    }


    if (userRegion) {
      benefitsQuery.andWhere(
        '(benefit.regions LIKE :region OR benefit.regions LIKE :all)',
        { region: `%${userRegion}%`, all: '%all%' }
      );
      offersQuery.andWhere(
        '(offer.regions LIKE :region OR offer.regions LIKE :all)',
        { region: `%${userRegion}%`, all: '%all%' }
      );
    }

    const benefits = await benefitsQuery.getMany();
    const offers = await offersQuery.getMany();


    const preferences = await this.preferencesRepository.findOne({
      where: { userId },
      relations: ['hiddenBenefits', 'hiddenOffers'],
    });

    const hiddenBenefitIds = preferences?.hiddenBenefits?.map(b => b.id) || [];
    const hiddenOfferIds = preferences?.hiddenOffers?.map(o => o.id) || [];


    const filteredBenefits = benefits.filter(b => !hiddenBenefitIds.includes(b.id));
    const filteredOffers = offers.filter(o => !hiddenOfferIds.includes(o.id));


    const federal = filteredBenefits.filter(b => b.type === BenefitType.FEDERAL);
    const regional = filteredBenefits.filter(b => b.type === BenefitType.REGIONAL);
    const municipal = filteredBenefits.filter(b => b.type === BenefitType.MUNICIPAL);
    const commercial = filteredOffers;


    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 30);

    return {
      federal: federal.map(b => ({
        ...b,
        isExpiringSoon: b.validTo <= soonDate,
      })),
      regional: regional.map(b => ({
        ...b,
        isExpiringSoon: b.validTo <= soonDate,
      })),
      municipal: municipal.map(b => ({
        ...b,
        isExpiringSoon: b.validTo <= soonDate,
      })),
      commercial: commercial.map(o => ({
        ...o,
        isExpiringSoon: o.validTo <= soonDate,
      })),
    };
  }

  async createBenefit(createDto: CreateBenefitDto): Promise<Benefit> {
    const categories = await this.categoriesRepository.findBy({
      id: In(createDto.targetGroupIds),
    });

    if (categories.length !== createDto.targetGroupIds.length) {
      throw new NotFoundException('Some beneficiary categories not found');
    }

    const benefit = this.benefitsRepository.create({
      benefitId: createDto.benefitId,
      title: createDto.title,
      type: createDto.type,
      targetGroups: categories,
      regions: createDto.regions,
      validFrom: new Date(createDto.validFrom),
      validTo: new Date(createDto.validTo),
      requirements: createDto.requirements,
      howToGet: createDto.howToGet,
      sourceUrl: createDto.sourceUrl,
      partner: createDto.partner,
      popularity: createDto.popularity || 0,
      requiresConfirmation: createDto.requiresConfirmation || false,
    });

    return this.benefitsRepository.save(benefit);
  }

  async createCommercialOffer(createDto: CreateCommercialOfferDto): Promise<CommercialOffer> {
    const categories = await this.categoriesRepository.findBy({
      id: In(createDto.targetGroupIds),
    });

    if (categories.length !== createDto.targetGroupIds.length) {
      throw new NotFoundException('Some beneficiary categories not found');
    }

    const offer = this.commercialOffersRepository.create({
      offerId: createDto.offerId,
      title: createDto.title,
      type: createDto.type,
      targetGroups: categories,
      regions: createDto.regions,
      validFrom: new Date(createDto.validFrom),
      validTo: new Date(createDto.validTo),
      requirements: createDto.requirements,
      howToGet: createDto.howToGet,
      sourceUrl: createDto.sourceUrl,
      partner: createDto.partner,
      description: createDto.description,
      popularity: createDto.popularity || 0,
      requiresConfirmation: createDto.requiresConfirmation || false,
    });

    return this.commercialOffersRepository.save(offer);
  }

  async seedBenefits() {

    const existingBenefits = await this.benefitsRepository.count();
    if (existingBenefits > 0) {
      return { message: 'Benefits already seeded' };
    }


    const categories = await this.categoriesRepository.find();
    const categoryMap = new Map(categories.map(c => [c.code, c]));

    const pensionerId = categoryMap.get('pensioner')?.id;
    const disabledId = categoryMap.get('disabled')?.id;
    const largeFamilyId = categoryMap.get('large_family')?.id;
    const veteranId = categoryMap.get('veteran')?.id;
    const lowIncomeId = categoryMap.get('low_income')?.id;


    const federalBenefits = [
      {
        benefitId: 'pens-transport-2025',
        title: 'Бесплатный проезд на общественном транспорте',
        type: BenefitType.FEDERAL,
        targetGroupIds: [pensionerId, disabledId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие удостоверения льготника',
        howToGet: 'Обратиться в МФЦ с паспортом и удостоверением',
        sourceUrl: 'https://mintrud.gov.ru/benefits/transport',
        partner: null,
        popularity: 100,
      },
      {
        benefitId: 'pens-medicine-2025',
        title: 'Льготное обеспечение лекарственными препаратами',
        type: BenefitType.FEDERAL,
        targetGroupIds: [pensionerId, disabledId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие рецепта врача',
        howToGet: 'Получить рецепт в поликлинике, обратиться в аптеку',
        sourceUrl: 'https://mintrud.gov.ru/benefits/medicine',
        partner: null,
        popularity: 95,
      },
      {
        benefitId: 'pens-compensation-2025',
        title: 'Ежемесячная денежная компенсация',
        type: BenefitType.FEDERAL,
        targetGroupIds: [pensionerId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Достижение пенсионного возраста',
        howToGet: 'Обратиться в Пенсионный фонд',
        sourceUrl: 'https://pfr.gov.ru/compensation',
        partner: null,
        popularity: 90,
      },
      {
        benefitId: 'disabled-rehabilitation-2025',
        title: 'Бесплатная реабилитация и санаторно-курортное лечение',
        type: BenefitType.FEDERAL,
        targetGroupIds: [disabledId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие справки об инвалидности',
        howToGet: 'Обратиться в ФСС с заявлением',
        sourceUrl: 'https://fss.ru/rehabilitation',
        partner: null,
        popularity: 85,
      },
      {
        benefitId: 'large-family-tax-2025',
        title: 'Налоговые льготы для многодетных семей',
        type: BenefitType.FEDERAL,
        targetGroupIds: [largeFamilyId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие удостоверения многодетной семьи',
        howToGet: 'Обратиться в налоговую инспекцию',
        sourceUrl: 'https://nalog.gov.ru/benefits',
        partner: null,
        popularity: 80,
      },
      {
        benefitId: 'veteran-housing-2025',
        title: 'Льготы на оплату жилищно-коммунальных услуг',
        type: BenefitType.FEDERAL,
        targetGroupIds: [veteranId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие удостоверения ветерана',
        howToGet: 'Обратиться в управляющую компанию',
        sourceUrl: 'https://mintrud.gov.ru/benefits/housing',
        partner: null,
        popularity: 75,
      },
      {
        benefitId: 'low-income-subsidy-2025',
        title: 'Субсидия на оплату жилого помещения и коммунальных услуг',
        type: BenefitType.FEDERAL,
        targetGroupIds: [lowIncomeId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Доход ниже прожиточного минимума',
        howToGet: 'Обратиться в МФЦ с документами о доходах',
        sourceUrl: 'https://mintrud.gov.ru/benefits/subsidy',
        partner: null,
        popularity: 70,
      },
    ];


    const regionalBenefits = [
      {
        benefitId: 'yakutsk-transport-2025',
        title: 'Бесплатный проезд в общественном транспорте Якутска',
        type: BenefitType.REGIONAL,
        targetGroupIds: [pensionerId, disabledId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Проживание в Республике Саха (Якутия)',
        howToGet: 'Обратиться в транспортную компанию с документами',
        sourceUrl: 'https://yakutia.gov.ru/benefits',
        partner: null,
        popularity: 65,
      },
      {
        benefitId: 'yakutsk-medicine-2025',
        title: 'Дополнительные льготы на лекарства в Якутии',
        type: BenefitType.REGIONAL,
        targetGroupIds: [pensionerId, disabledId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Регистрация в Республике Саха (Якутия)',
        howToGet: 'Обратиться в аптеку с рецептом',
        sourceUrl: 'https://yakutia.gov.ru/medicine',
        partner: null,
        popularity: 60,
      },
      {
        benefitId: 'yakutsk-education-2025',
        title: 'Льготы на образование для детей из многодетных семей',
        type: BenefitType.REGIONAL,
        targetGroupIds: [largeFamilyId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Многодетная семья, проживающая в Якутии',
        howToGet: 'Обратиться в образовательное учреждение',
        sourceUrl: 'https://yakutia.gov.ru/education',
        partner: null,
        popularity: 55,
      },
      {
        benefitId: 'yakutsk-housing-2025',
        title: 'Региональная программа улучшения жилищных условий',
        type: BenefitType.REGIONAL,
        targetGroupIds: [largeFamilyId, lowIncomeId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Постановка на учет нуждающихся в жилье',
        howToGet: 'Обратиться в администрацию города',
        sourceUrl: 'https://yakutia.gov.ru/housing',
        partner: null,
        popularity: 50,
      },
      {
        benefitId: 'yakutsk-utilities-2025',
        title: 'Компенсация расходов на коммунальные услуги',
        type: BenefitType.REGIONAL,
        targetGroupIds: [pensionerId, disabledId, veteranId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Проживание в Якутии, наличие льготного удостоверения',
        howToGet: 'Обратиться в управляющую компанию',
        sourceUrl: 'https://yakutia.gov.ru/utilities',
        partner: null,
        popularity: 45,
      },
      {
        benefitId: 'yakutsk-summer-2025',
        title: 'Льготные путевки в детские лагеря',
        type: BenefitType.REGIONAL,
        targetGroupIds: [largeFamilyId, lowIncomeId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-06-01',
        validTo: '2025-08-31',
        requirements: 'Дети из многодетных или малообеспеченных семей',
        howToGet: 'Обратиться в отдел соцзащиты',
        sourceUrl: 'https://yakutia.gov.ru/camps',
        partner: null,
        popularity: 40,
      },
      {
        benefitId: 'yakutsk-sports-2025',
        title: 'Бесплатное посещение спортивных секций',
        type: BenefitType.REGIONAL,
        targetGroupIds: [largeFamilyId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Дети из многодетных семей',
        howToGet: 'Обратиться в спортивную школу',
        sourceUrl: 'https://yakutia.gov.ru/sports',
        partner: null,
        popularity: 35,
      },
      {
        benefitId: 'yakutsk-culture-2025',
        title: 'Бесплатное посещение музеев и театров',
        type: BenefitType.REGIONAL,
        targetGroupIds: [pensionerId, disabledId, largeFamilyId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие льготного удостоверения',
        howToGet: 'Предъявить удостоверение в кассе',
        sourceUrl: 'https://yakutia.gov.ru/culture',
        partner: null,
        popularity: 30,
      },
    ];


    for (const benefitData of [...federalBenefits, ...regionalBenefits]) {
      await this.createBenefit(benefitData as any);
    }


    const commercialOffers = [
      {
        offerId: 'apteka-discount-2025',
        title: 'Скидка 10% на лекарства для льготников',
        type: CommercialOfferType.PHARMACY,
        targetGroupIds: [pensionerId, disabledId].filter(Boolean),
        regions: ['14', '77'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие льготного удостоверения',
        howToGet: 'Предъявить удостоверение в аптеке',
        sourceUrl: 'https://apteka-partner.ru/offers',
        partner: 'Аптека Здоровье',
        description: 'Скидка действует на все лекарственные препараты',
        popularity: 90,
      },
      {
        offerId: 'store-food-2025',
        title: 'Скидка 5% на продукты питания',
        type: CommercialOfferType.STORE,
        targetGroupIds: [pensionerId, largeFamilyId, lowIncomeId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие льготного удостоверения',
        howToGet: 'Предъявить удостоверение на кассе',
        sourceUrl: 'https://store-partner.ru/offers',
        partner: 'Магазин Продукты+',
        description: 'Скидка на все товары собственного производства',
        popularity: 85,
      },
      {
        offerId: 'housing-service-2025',
        title: 'Скидка 15% на услуги ЖКХ',
        type: CommercialOfferType.HOUSING,
        targetGroupIds: [pensionerId, disabledId, veteranId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Подключение к услугам компании',
        howToGet: 'Обратиться в офис компании',
        sourceUrl: 'https://housing-partner.ru/offers',
        partner: 'УК Комфорт',
        description: 'Скидка на все виды коммунальных услуг',
        popularity: 80,
      },
      {
        offerId: 'apteka-vitamins-2025',
        title: 'Скидка 20% на витамины и БАДы',
        type: CommercialOfferType.PHARMACY,
        targetGroupIds: [pensionerId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Возраст 60+',
        howToGet: 'Предъявить паспорт в аптеке',
        sourceUrl: 'https://vitamins-partner.ru/offers',
        partner: 'Аптека Витамин',
        description: 'Специальное предложение для пенсионеров',
        popularity: 75,
      },
      {
        offerId: 'store-clothes-2025',
        title: 'Скидка 10% на детскую одежду',
        type: CommercialOfferType.STORE,
        targetGroupIds: [largeFamilyId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Удостоверение многодетной семьи',
        howToGet: 'Предъявить удостоверение в магазине',
        sourceUrl: 'https://clothes-partner.ru/offers',
        partner: 'Детский Мир',
        description: 'Скидка на весь ассортимент детской одежды',
        popularity: 70,
      },
      {
        offerId: 'housing-repair-2025',
        title: 'Скидка 10% на ремонтные работы',
        type: CommercialOfferType.HOUSING,
        targetGroupIds: [pensionerId, disabledId].filter(Boolean),
        regions: ['14', '77'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие льготного удостоверения',
        howToGet: 'Обратиться в компанию для оценки',
        sourceUrl: 'https://repair-partner.ru/offers',
        partner: 'Ремонт Сервис',
        description: 'Скидка на все виды ремонтных работ',
        popularity: 65,
      },
      {
        offerId: 'apteka-medical-2025',
        title: 'Бесплатная доставка лекарств на дом',
        type: CommercialOfferType.PHARMACY,
        targetGroupIds: [disabledId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Инвалидность 1 или 2 группы',
        howToGet: 'Оформить заказ по телефону',
        sourceUrl: 'https://delivery-apteka.ru/offers',
        partner: 'Аптека Доставка',
        description: 'Бесплатная доставка при заказе от 500 рублей',
        popularity: 60,
      },
      {
        offerId: 'store-household-2025',
        title: 'Скидка 7% на товары для дома',
        type: CommercialOfferType.STORE,
        targetGroupIds: [pensionerId, largeFamilyId].filter(Boolean),
        regions: ['all'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Наличие льготного удостоверения',
        howToGet: 'Предъявить удостоверение на кассе',
        sourceUrl: 'https://household-partner.ru/offers',
        partner: 'Дом и Сад',
        description: 'Скидка на товары для дома и сада',
        popularity: 55,
      },
      {
        offerId: 'housing-internet-2025',
        title: 'Скидка 20% на интернет и телевидение',
        type: CommercialOfferType.HOUSING,
        targetGroupIds: [pensionerId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Возраст 60+',
        howToGet: 'Обратиться в офис провайдера',
        sourceUrl: 'https://internet-partner.ru/offers',
        partner: 'Интернет Плюс',
        description: 'Специальный тариф для пенсионеров',
        popularity: 50,
      },
      {
        offerId: 'store-books-2025',
        title: 'Скидка 15% на книги и канцелярию',
        type: CommercialOfferType.STORE,
        targetGroupIds: [largeFamilyId].filter(Boolean),
        regions: ['14'],
        validFrom: '2025-01-01',
        validTo: '2025-12-31',
        requirements: 'Удостоверение многодетной семьи',
        howToGet: 'Предъявить удостоверение в магазине',
        sourceUrl: 'https://books-partner.ru/offers',
        partner: 'Книжный Дом',
        description: 'Скидка на учебники и канцелярские товары',
        popularity: 45,
      },
    ];

    for (const offerData of commercialOffers) {
      await this.createCommercialOffer(offerData as any);
    }

    return {
      message: 'Benefits and commercial offers seeded successfully',
      benefitsCount: federalBenefits.length + regionalBenefits.length,
      offersCount: commercialOffers.length,
    };
  }
}

