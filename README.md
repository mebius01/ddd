# 🛴 Scooter Rental Service — DDD Example

Навчальний проект, що демонструє основні концепції **Domain-Driven Design** на прикладі сервісу оренди самокатів.

## Запуск

```bash
npm install
npm start
```

## Архітектура

```
src/
├── shared/                          # Спільні будівельні блоки DDD
│   ├── domain/
│   │   ├── entity.ts                # Базовий клас сутності (порівняння за ID)
│   │   ├── value-object.ts          # Базовий клас Value Object (порівняння за значенням)
│   │   ├── aggregate-root.ts        # Корінь агрегату (накопичує доменні події)
│   │   ├── domain-event.ts          # Інтерфейс доменної події
│   │   └── unique-id.ts             # Унікальний ідентифікатор
│   └── infrastructure/
│       └── event-bus.ts             # In-memory шина подій (pub/sub)
│
├── riding/                          # Bounded Context: Riding (Поїздки)
│   ├── domain/
│   │   ├── aggregates/
│   │   │   └── trip.ts              # Aggregate Root — поїздка
│   │   ├── entities/
│   │   │   ├── scooter.ts           # Entity — самокат (ID, заряд, GPS)
│   │   │   └── rider.ts             # Entity — райдер
│   │   ├── valueObjects/
│   │   │   ├── location.ts          # Value Object — GPS-координати
│   │   │   ├── money.ts             # Value Object — гроші
│   │   │   └── route-point.ts       # Value Object — точка маршруту
│   │   ├── events/
│   │   │   ├── trip-started.ts      # Domain Event
│   │   │   └── trip-finished.ts     # Domain Event → летить в Billing
│   │   └── repositories/
│   │       ├── i-trip-repository.ts    # Інтерфейс (Domain Layer)
│   │       ├── i-scooter-repository.ts
│   │       └── i-rider-repository.ts
│   ├── application/
│   │   ├── start-trip-use-case.ts      # Use Case: розблокувати самокат
│   │   ├── add-location-use-case.ts    # Use Case: додати GPS-точку
│   │   └── finish-trip-use-case.ts     # Use Case: завершити поїздку
│   └── infrastructure/
│       ├── in-memory-trip-repository.ts      # Реалізація (Infrastructure Layer)
│       ├── in-memory-scooter-repository.ts
│       └── in-memory-rider-repository.ts
│
├── billing/                         # Bounded Context: Billing (Оплата)
│   ├── domain/
│   │   ├── entities/
│   │   │   └── billing-account.ts   # Entity — рахунок райдера
│   │   ├── services/
│   │   │   └── pricing-service.ts   # Domain Service — розрахунок вартості
│   │   └── repositories/
│   │       └── i-billing-account-repository.ts
│   ├── application/
│   │   └── trip-finished-handler.ts # Обробник події з контексту Riding
│   └── infrastructure/
│       └── in-memory-billing-account-repository.ts
│
└── main.ts                          # Demo — запуск сценарію
```

## З чого почати читати проєкт (для вивчення DDD)

- **`src/main.ts`** — демо-сценарій: як збираються залежності, як викликаються use case'и, як підписується Billing на події.
- **`src/riding/application/*`** — application layer: orchestration (use case'и), які показують «як домен використовується».
- **`src/riding/domain/aggregates/trip.ts`** — Aggregate Root: основні інваріанти поїздки + генерація доменних подій.
- **`src/riding/domain/entities/*`** і **`src/riding/domain/valueObjects/*`** — сутності та value objects (стан vs значення).
- **`src/riding/domain/events/*`** — Domain Events, через які Riding інтегрується з Billing.
- **`src/shared/domain/*`** — базові DDD-блоки (`Entity`, `ValueObject`, `AggregateRoot`, `UniqueId`, `DomainEvent`).
- **`src/billing/application/trip-finished-handler.ts`** + **`src/billing/domain/*`** — приклад іншого bounded context, що реагує на подію (`PricingService`, `BillingAccount`).
- **`src/*/infrastructure/*`** і **`src/shared/infrastructure/event-bus.ts`** — інфраструктура (in-memory репозиторії, pub/sub), яку зручно читати після домену.

## Концепції DDD у проекті

### 1. Ubiquitous Language (Всюдисуща мова)
Всі класи та методи названі бізнес-термінами:
- `trip.finish(parkingLocation)`, а не `service.endRental()`
- `scooter.unlock()`, а не `vehicle.changeState()`
- `Rider`, `Scooter`, `Trip` — терміни зрозумілі бізнесу

### 2. Bounded Contexts (Обмежені контексти)
- **Riding** — поїздки, маршрути, GPS. Самокат тут має заряд, координати, статус.
- **Billing** — оплата. Самокат тут — просто ID. Billing знає лише про тривалість та тариф.

Контексти комунікують через **Domain Events**, не знаючи один про одного.

### 3. Entity vs Value Object
- **Entity (Scooter, Rider)** — мають унікальний ID. Два самокати з однаковим зарядом — різні об'єкти.
- **Value Object (Location, Money, RoutePoint)** — не мають ID. Дві локації з однаковими координатами — рівні.

### 4. Aggregate Root (Trip)
`Trip` — корінь агрегату. Всі зміни внутрішніх об'єктів (RoutePoint) проходять через нього:
```typescript
trip.addLocation(location)  // ✅ Правильно — через Aggregate Root
routePoints.push(point)     // ❌ Неправильно — обхід бізнес-правил
```

### 5. Domain Events
- `TripStarted` — публікується при розблокуванні самоката
- `TripFinished` — публікується при завершенні. Billing підписаний і списує гроші.

### 6. Repository Pattern
- **Domain Layer** описує інтерфейс: `ITripRepository { save(trip) }`
- **Infrastructure Layer** реалізує: `InMemoryTripRepository`
- Бізнес-логіка не залежить від БД. Можна замінити In-Memory на PostgreSQL без зміни домену.

### 7. Application Services (Use Cases)
- `StartTripUseCase` — оркеструє створення поїздки
- `FinishTripUseCase` — оркеструє завершення
- Не містять бізнес-логіки — лише координують виклики доменних об'єктів

### 8. Domain Services
- `PricingService` — розрахунок вартості поїздки. Ця логіка не належить жодній сутності.
