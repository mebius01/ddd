import { Trip } from "../domain/aggregates/trip";
import { ITripRepository } from "../domain/repositories/i-trip-repository";
import { IScooterRepository } from "../domain/repositories/i-scooter-repository";
import { UniqueId } from "../../shared/domain/unique-id";
import { Location } from "../domain/valueObjects/location";
import { EventBus } from "../../shared/infrastructure/event-bus";

/**
 * FinishTripUseCase — Application Service.
 * Завершує поїздку та публікує подію TripFinished,
 * яку "почує" контекст Billing.
 */
export class FinishTripUseCase {
  constructor(
    private readonly tripRepo: ITripRepository,
    private readonly scooterRepo: IScooterRepository
  ) {}

  execute(tripId: string, parkLatitude: number, parkLongitude: number): Trip {
    const tripUid = new UniqueId(tripId);
    const trip = this.tripRepo.findById(tripUid);
    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    const parkingLocation = Location.create(parkLatitude, parkLongitude);

    // Доменна логіка — завершення поїздки (park)
    trip.finish(parkingLocation);

    // Зберігаємо
    this.tripRepo.save(trip);
    this.scooterRepo.save(trip.scooter);

    // Публікуємо доменні події — Billing отримає TripFinished
    EventBus.publishAll(trip.domainEvents);
    trip.clearEvents();

    return trip;
  }
}
