import { Scooter } from "../entities/scooter";
import { UniqueId } from "../../../shared/domain/unique-id";

export interface IScooterRepository {
  save(scooter: Scooter): void;
  findById(id: UniqueId): Scooter | undefined;
  findAvailable(): Scooter[];
}
