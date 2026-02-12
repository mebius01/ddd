import { EventBus } from "./shared/infrastructure/event-bus";

// --- Riding Context: Infrastructure ---
import { InMemoryRiderRepository } from "./riding/infrastructure/in-memory-rider-repository";
import { InMemoryScooterRepository } from "./riding/infrastructure/in-memory-scooter-repository";
import { InMemoryTripRepository } from "./riding/infrastructure/in-memory-trip-repository";

// --- Riding Context: Domain ---
import { Rider } from "./riding/domain/entities/rider";
import { Scooter } from "./riding/domain/entities/scooter";
import { Location } from "./riding/domain/valueObjects/location";

// --- Riding Context: Application (Use Cases) ---
import { StartTripUseCase } from "./riding/application/start-trip-use-case";
import { AddLocationUseCase } from "./riding/application/add-location-use-case";
import { FinishTripUseCase } from "./riding/application/finish-trip-use-case";

// --- Billing Context ---
import { BillingAccount } from "./billing/domain/entities/billing-account";
import { InMemoryBillingAccountRepository } from "./billing/infrastructure/in-memory-billing-account-repository";
import { TripFinishedHandler } from "./billing/application/trip-finished-handler";

// ============================================================
//  DEMO: Сервіс оренди самокатів (DDD)
// ============================================================

function main() {
  console.log("=".repeat(60));
  console.log("  🛴 Scooter Rental Service — DDD Demo");
  console.log("=".repeat(60));
  console.log();

  // ---- 1. Створюємо інфраструктуру (Repositories) ----
  const riderRepo = new InMemoryRiderRepository();
  const scooterRepo = new InMemoryScooterRepository();
  const tripRepo = new InMemoryTripRepository();
  const billingRepo = new InMemoryBillingAccountRepository();

  // ---- 2. Підписуємо Billing на подію TripFinished ----
  //   Контекст Riding публікує подію, Billing "чує" і списує гроші.
  //   Контексти не знають один про одного напряму!
  const tripFinishedHandler = new TripFinishedHandler(billingRepo);
  EventBus.subscribe("TripFinished", (event) =>
    tripFinishedHandler.handle(event),
  );

  EventBus.subscribe("TripStarted", (event) => {
    console.log(
      `[Event] TripStarted: rider=${event.payload.riderId}, scooter=${event.payload.scooterId}`,
    );
  });

  // ---- 3. Створюємо доменні об'єкти ----
  console.log("--- Step 1: Creating domain objects ---\n");

  // Rider (Райдер)
  const rider = Rider.create("Oleksandr", "oleksandr@example.com");
  riderRepo.save(rider);
  console.log(`Rider created: ${rider.name} (${rider.id})`);

  // Scooter (Самокат) — Entity з унікальним ID
  const scooterLocation = Location.create(50.4501, 30.5234); // Київ
  const scooter = Scooter.create("SC-001", scooterLocation, 85);
  scooterRepo.save(scooter);
  console.log(
    `Scooter created: ${scooter.serialNumber}, battery: ${scooter.batteryLevel}%, location: ${scooter.location}`,
  );

  // BillingAccount — в контексті Billing самокат — це просто ID з тарифом
  const billingAccount = BillingAccount.create(
    rider.id.toString(),
    500, // 500 грн на рахунку
    "UAH",
  );
  billingRepo.save(billingAccount);
  console.log(
    `Billing account created: balance = ${billingAccount.balance} ${billingAccount.currency}`,
  );

  // ---- 4. Use Case: Розблокувати самокат (Start Trip) ----
  console.log("\n--- Step 2: Unlock scooter (Start Trip) ---\n");

  const startTrip = new StartTripUseCase(tripRepo, scooterRepo, riderRepo);
  const trip = startTrip.execute(rider.id.toString(), scooter.id.toString());

  console.log(`Trip started: ${trip.id}`);
  console.log(`Scooter status: ${scooter.status}`);
  console.log(`Trip status: ${trip.status}`);

  // ---- 5. Симулюємо рух — додаємо GPS-точки ----
  console.log("\n--- Step 3: Riding (adding GPS locations) ---\n");

  const addLocation = new AddLocationUseCase(tripRepo);

  const waypoints = [
    { lat: 50.4505, lng: 30.524 },
    { lat: 50.4515, lng: 30.5255 },
    { lat: 50.453, lng: 30.527 },
  ];

  for (const wp of waypoints) {
    addLocation.execute(trip.id.toString(), wp.lat, wp.lng);
    console.log(`  GPS point added: (${wp.lat}, ${wp.lng})`);
  }

  console.log(`Route points: ${trip.route.length}`);

  // ---- 6. Use Case: Завершити поїздку (Finish Trip) ----
  console.log("\n--- Step 4: Park scooter (Finish Trip) ---\n");

  // Невелика затримка для демонстрації тривалості
  const finishTrip = new FinishTripUseCase(tripRepo, scooterRepo);

  // Паркуємо на Хрещатику
  finishTrip.execute(trip.id.toString(), 50.4535, 30.528);

  console.log(`\nTrip status: ${trip.status}`);
  console.log(`Scooter status: ${scooter.status}`);
  console.log(`Scooter location: ${scooter.location}`);

  // ---- 7. Перевіряємо Billing ----
  console.log("\n--- Step 5: Check billing ---\n");

  const updatedAccount = billingRepo.findByRiderId(rider.id.toString());
  if (updatedAccount) {
    console.log(
      `Balance: ${updatedAccount.balance.toFixed(2)} ${updatedAccount.currency}`,
    );
    console.log(`Transactions:`);
    for (const tx of updatedAccount.transactions) {
      console.log(
        `  - ${tx.amount.toFixed(2)} ${tx.currency}: ${tx.description}`,
      );
    }
  }

  // ---- 8. Демонструємо бізнес-правила ----
  console.log("\n--- Step 6: Business rules enforcement ---\n");

  // Спроба розблокувати зайнятий самокат
  try {
    console.log("Trying to start another trip with the same scooter...");
    const scooter2 = scooterRepo.findById(scooter.id);
    // Самокат вже IN_USE (але ми його запаркували, тому він AVAILABLE)
    // Спробуємо додати точку до завершеної поїздки
    console.log("Trying to add location to a finished trip...");
    addLocation.execute(trip.id.toString(), 50.46, 30.53);
  } catch (error: any) {
    console.log(`  Business rule enforced: ${error.message}`);
  }

  // Демонструємо Value Object рівність
  console.log("\n--- Step 7: Value Object equality ---\n");

  const loc1 = Location.create(50.4501, 30.5234);
  const loc2 = Location.create(50.4501, 30.5234);
  const loc3 = Location.create(50.4502, 30.5234);

  console.log(`loc1 equals loc2: ${loc1.equals(loc2)}`); // true — однакові координати
  console.log(`loc1 equals loc3: ${loc3.equals(loc1)}`); // false — різні координати

  console.log("\n" + "=".repeat(60));
  console.log("  Demo completed successfully!");
  console.log("=".repeat(60));
}

main();
