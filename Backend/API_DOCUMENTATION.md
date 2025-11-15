# SupportPlus Backend API Documentation

## Base URL
```
http://localhost:8000
```

## Swagger Documentation
Интерактивная документация доступна по адресу: `http://localhost:8000/api`

## Аутентификация

Большинство эндпоинтов требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

Токен получается при логине или OAuth авторизации.

---

## 1. Аутентификация (Auth)

### POST /auth/login
Вход с email и PIN-кодом.

**Request Body:**
```json
{
  "email": "user@example.com",
  "pinCode": "12345"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "beneficiaryCategories": []
  }
}
```

**Errors:**
- `401` - Неверные учетные данные

---

### GET /auth/google
Инициация Google OAuth авторизации. Перенаправляет на страницу авторизации Google.

**Response:** `302 Redirect`

---

### GET /auth/google/callback
Callback для Google OAuth. Перенаправляет на фронтенд с токеном.

**Response:** `302 Redirect` на `{FRONTEND_URL}/auth/callback?token={access_token}`

---

## 2. Пользователи (Users)

### POST /users
Регистрация нового пользователя.

**Request Body:**
```json
{
  "email": "user@example.com",
  "pinCode": "12345",
  "snils": "123-456-789 01",
  "region": "Москва",
  "beneficiaryCategoryIds": [1, 2]
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "snils": "123-456-789 01",
  "region": "Москва",
  "beneficiaryCategories": [],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**
- `400` - Неверные входные данные

---

### GET /users/profile
Получить профиль текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "snils": "123-456-789 01",
  "region": "Москва",
  "beneficiaryCategories": [
    {
      "id": 1,
      "code": "pensioner",
      "name": "Пенсионер"
    }
  ]
}
```

**Errors:**
- `401` - Не авторизован

---

### PATCH /users/profile
Обновить профиль текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "snils": "123-456-789 02",
  "region": "Санкт-Петербург",
  "beneficiaryCategoryIds": [1, 3]
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "snils": "123-456-789 02",
  "region": "Санкт-Петербург",
  "beneficiaryCategories": [...]
}
```

**Errors:**
- `401` - Не авторизован

---

### GET /users/:id
Получить пользователя по ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  ...
}
```

**Errors:**
- `401` - Не авторизован
- `404` - Пользователь не найден

---

### GET /users/preferences/me
Получить настройки пользователя (скрытые льготы, избранные категории).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "userId": 1,
  "hiddenBenefits": [],
  "hiddenOffers": [],
  "favoriteCategories": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PATCH /users/preferences/me
Обновить настройки пользователя.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "hiddenBenefitIds": [1, 2],
  "hiddenOfferIds": [3],
  "favoriteCategoryIds": [1, 2]
}
```

**Response (200):**
```json
{
  "id": 1,
  "userId": 1,
  "hiddenBenefits": [...],
  "hiddenOffers": [...],
  "favoriteCategories": [...]
}
```

---

### GET /users/export/pdf
Экспорт данных пользователя для генерации PDF.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "email": "user@example.com",
    "region": "Москва",
    "snils": "123-***-*** 01"
  },
  "benefits": {
    "note": "Call /benefits/my-benefits to get actual benefits data"
  },
  "preferences": {
    "hiddenBenefits": [],
    "hiddenOffers": [],
    "favoriteCategories": []
  },
  "exportDate": "2024-01-01T00:00:00.000Z"
}
```

---

## 3. Категории льготников (Beneficiary Categories)

### GET /beneficiary-categories
Получить все категории льготников.

**Response (200):**
```json
[
  {
    "id": 1,
    "code": "pensioner",
    "name": "Пенсионер",
    "description": "Лица пенсионного возраста"
  },
  {
    "id": 2,
    "code": "disabled",
    "name": "Инвалид",
    "description": "Лица с ограниченными возможностями"
  }
]
```

---

### GET /beneficiary-categories/:id
Получить категорию по ID.

**Response (200):**
```json
{
  "id": 1,
  "code": "pensioner",
  "name": "Пенсионер",
  "description": "Лица пенсионного возраста"
}
```

**Errors:**
- `404` - Категория не найдена

---

### POST /beneficiary-categories/seed
Заполнить базу данных категориями по умолчанию.

**Response (201):**
```json
{
  "message": "Categories seeded successfully"
}
```

---

## 4. Льготы и акции (Benefits)

### GET /benefits/search
Поиск и фильтрация льгот и коммерческих предложений.

**Query Parameters:**
- `query` (string, optional) - Поисковый запрос (ключевые слова)
- `type` (array, optional) - Фильтр по типу: `federal`, `regional`, `municipal`
- `categoryIds` (array, optional) - Фильтр по ID категорий льготников
- `regions` (array, optional) - Фильтр по кодам регионов
- `termFilter` (array, optional) - Фильтр по сроку: `active`, `expiring_soon`, `requires_confirmation`
- `sortBy` (string, optional) - Сортировка: `relevance`, `date`, `popularity` (default: `relevance`)
- `page` (number, optional) - Номер страницы (default: 1)
- `limit` (number, optional) - Элементов на странице (default: 20)

**Example:**
```
GET /benefits/search?query=лекарства&type[]=federal&categoryIds[]=1&sortBy=popularity&page=1&limit=20
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "benefitId": "pens-medicine-2025",
      "title": "Льготное обеспечение лекарственными препаратами",
      "type": "federal",
      "targetGroups": [...],
      "regions": ["all"],
      "validFrom": "2025-01-01",
      "validTo": "2025-12-31",
      "requirements": "Наличие рецепта врача",
      "howToGet": "Получить рецепт в поликлинике, обратиться в аптеку",
      "sourceUrl": "https://mintrud.gov.ru/benefits/medicine",
      "partner": null,
      "popularity": 95,
      "requiresConfirmation": false,
      "isCommercial": false
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### GET /benefits/my-benefits
Получить активные льготы текущего пользователя (личный кабинет).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "federal": [
    {
      "id": 1,
      "benefitId": "pens-transport-2025",
      "title": "Бесплатный проезд на общественном транспорте",
      "type": "federal",
      "targetGroups": [...],
      "regions": ["all"],
      "validFrom": "2025-01-01",
      "validTo": "2025-12-31",
      "isExpiringSoon": false
    }
  ],
  "regional": [...],
  "municipal": [...],
  "commercial": [
    {
      "id": 1,
      "offerId": "apteka-discount-2025",
      "title": "Скидка 10% на лекарства для льготников",
      "type": "pharmacy",
      "partner": "Аптека Здоровье",
      "isExpiringSoon": false
    }
  ]
}
```

**Errors:**
- `401` - Не авторизован

---

### POST /benefits
Создать новую льготу (только для администраторов).

**Request Body:**
```json
{
  "benefitId": "new-benefit-2025",
  "title": "Новая льгота",
  "type": "federal",
  "targetGroupIds": [1, 2],
  "regions": ["all"],
  "validFrom": "2025-01-01",
  "validTo": "2025-12-31",
  "requirements": "Требования",
  "howToGet": "Как получить",
  "sourceUrl": "https://example.com",
  "partner": null,
  "popularity": 0,
  "requiresConfirmation": false
}
```

**Response (201):**
```json
{
  "id": 1,
  "benefitId": "new-benefit-2025",
  "title": "Новая льгота",
  ...
}
```

---

### POST /benefits/commercial-offers
Создать новое коммерческое предложение (только для администраторов).

**Request Body:**
```json
{
  "offerId": "new-offer-2025",
  "title": "Новое предложение",
  "type": "pharmacy",
  "targetGroupIds": [1],
  "regions": ["14"],
  "validFrom": "2025-01-01",
  "validTo": "2025-12-31",
  "requirements": "Требования",
  "howToGet": "Как получить",
  "sourceUrl": "https://example.com",
  "partner": "Партнер",
  "description": "Описание",
  "popularity": 0,
  "requiresConfirmation": false
}
```

**Response (201):**
```json
{
  "id": 1,
  "offerId": "new-offer-2025",
  "title": "Новое предложение",
  ...
}
```

---

### POST /benefits/seed
Заполнить базу данных льготами и коммерческими предложениями (только для разработки).

**Response (201):**
```json
{
  "message": "Benefits and commercial offers seeded successfully",
  "benefitsCount": 15,
  "offersCount": 10
}
```

---

## 5. Общие эндпоинты

### GET /
Информация об API.

**Response (200):**
```json
{
  "message": "SupportPlus API",
  "version": "1.0",
  "documentation": "/api",
  "endpoints": {
    "auth": "/auth",
    "users": "/users",
    "beneficiaryCategories": "/beneficiary-categories",
    "benefits": "/benefits"
  }
}
```

---

### GET /health
Проверка работоспособности сервиса.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Модели данных

### Benefit (Льгота)
```typescript
{
  id: number;
  benefitId: string;
  title: string;
  type: "federal" | "regional" | "municipal";
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
}
```

### CommercialOffer (Коммерческое предложение)
```typescript
{
  id: number;
  offerId: string;
  title: string;
  type: "pharmacy" | "store" | "housing" | "other";
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
}
```

### User (Пользователь)
```typescript
{
  id: number;
  email: string;
  snils?: string;
  region?: string;
  beneficiaryCategories: BeneficiaryCategory[];
  createdAt: string;
  updatedAt: string;
}
```

### BeneficiaryCategory (Категория льготника)
```typescript
{
  id: number;
  code: string;
  name: string;
  description?: string;
  createdAt: string;
}
```

### UserPreferences (Настройки пользователя)
```typescript
{
  id: number;
  userId: number;
  hiddenBenefits: Benefit[];
  hiddenOffers: CommercialOffer[];
  favoriteCategories: BeneficiaryCategory[];
  createdAt: string;
  updatedAt: string;
}
```

---

## Коды ошибок

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверные входные данные
- `401` - Не авторизован
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

---

## Примечания

1. Все даты в формате ISO 8601 (YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss.sssZ)
2. СНИЛС маскируется при экспорте (показываются только первые 3 и последние 2 цифры)
3. По умолчанию при поиске показываются только активные льготы (validFrom <= now <= validTo)
4. Льготы, истекающие в течение 30 дней, помечаются флагом `isExpiringSoon: true`
5. При поиске учитываются регион и категории пользователя (если пользователь авторизован)
6. Скрытые пользователем льготы автоматически исключаются из результатов `/benefits/my-benefits`

