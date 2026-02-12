import { Trip } from "../aggregates/trip";
import { UniqueId } from "../../../shared/domain/unique-id";

/**
 * ITripRepository — інтерфейс репозиторію.
 * Domain Layer описує ЩО потрібно, а Infrastructure Layer реалізує ЯК.
 */
export interface ITripRepository {
  save(trip: Trip): void;
  findById(id: UniqueId): Trip | undefined;
  findActiveByRiderId(riderId: UniqueId): Trip | undefined;
}
