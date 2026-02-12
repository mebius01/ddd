import { ITripRepository } from "../domain/repositories/i-trip-repository";
import { UniqueId } from "../../shared/domain/unique-id";
import { Location } from "../domain/valueObjects/location";

/**
 * AddLocationUseCase — додає GPS-точку до активної поїздки.
 */
export class AddLocationUseCase {
  constructor(private readonly tripRepo: ITripRepository) {}

  execute(tripId: string, latitude: number, longitude: number): void {
    const trip = this.tripRepo.findById(new UniqueId(tripId));
    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    const location = Location.create(latitude, longitude);

    // Доменна логіка — перевірка та додавання точки
    trip.addLocation(location);

    this.tripRepo.save(trip);
  }
}
