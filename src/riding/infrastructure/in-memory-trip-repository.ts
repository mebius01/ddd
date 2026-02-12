import { Trip } from "../domain/aggregates/trip";
import { TripStatus } from "../domain/aggregates/trip";
import { ITripRepository } from "../domain/repositories/i-trip-repository";
import { UniqueId } from "../../shared/domain/unique-id";

/**
 * InMemoryTripRepository — реалізація репозиторію в пам'яті.
 * У реальному проекті тут був би TypeORM, Prisma, Sequelize тощо.
 */
export class InMemoryTripRepository implements ITripRepository {
  private trips: Map<string, Trip> = new Map();

  save(trip: Trip): void {
    this.trips.set(trip.id.toString(), trip);
  }

  findById(id: UniqueId): Trip | undefined {
    return this.trips.get(id.toString());
  }

  findActiveByRiderId(riderId: UniqueId): Trip | undefined {
    for (const trip of this.trips.values()) {
      if (
        trip.riderId.equals(riderId) &&
        trip.status === TripStatus.IN_PROGRESS
      ) {
        return trip;
      }
    }
    return undefined;
  }
}
