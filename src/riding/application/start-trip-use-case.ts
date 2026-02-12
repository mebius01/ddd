import { Trip } from "../domain/aggregates/trip";
import { ITripRepository } from "../domain/repositories/i-trip-repository";
import { IScooterRepository } from "../domain/repositories/i-scooter-repository";
import { IRiderRepository } from "../domain/repositories/i-rider-repository";
import { UniqueId } from "../../shared/domain/unique-id";
import { EventBus } from "../../shared/infrastructure/event-bus";

/**
 * StartTripUseCase — Application Service (Use Case).
 * Оркеструє виклики доменних об'єктів, репозиторіїв та публікацію подій.
 * Не містить бізнес-логіки — вона вся в доменному шарі.
 */
export class StartTripUseCase {
  constructor(
    private readonly tripRepo: ITripRepository,
    private readonly scooterRepo: IScooterRepository,
    private readonly riderRepo: IRiderRepository
  ) {}

  execute(riderId: string, scooterId: string): Trip {
    const riderUid = new UniqueId(riderId);
    const scooterUid = new UniqueId(scooterId);

    // Перевіряємо існування райдера
    const rider = this.riderRepo.findById(riderUid);
    if (!rider) {
      throw new Error(`Rider ${riderId} not found`);
    }

    // Перевіряємо, чи немає активної поїздки
    const activeTrip = this.tripRepo.findActiveByRiderId(riderUid);
    if (activeTrip) {
      throw new Error(`Rider ${riderId} already has an active trip`);
    }

    // Знаходимо самокат
    const scooter = this.scooterRepo.findById(scooterUid);
    if (!scooter) {
      throw new Error(`Scooter ${scooterId} not found`);
    }

    // Доменна логіка — створення поїздки (unlock)
    const trip = Trip.start(riderUid, scooter);

    // Зберігаємо
    this.tripRepo.save(trip);
    this.scooterRepo.save(scooter);

    // Публікуємо доменні події
    EventBus.publishAll(trip.domainEvents);
    trip.clearEvents();

    return trip;
  }
}
