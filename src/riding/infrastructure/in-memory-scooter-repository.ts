import { Scooter, ScooterStatus } from "../domain/entities/scooter";
import { IScooterRepository } from "../domain/repositories/i-scooter-repository";
import { UniqueId } from "../../shared/domain/unique-id";

export class InMemoryScooterRepository implements IScooterRepository {
  private scooters: Map<string, Scooter> = new Map();

  save(scooter: Scooter): void {
    this.scooters.set(scooter.id.toString(), scooter);
  }

  findById(id: UniqueId): Scooter | undefined {
    return this.scooters.get(id.toString());
  }

  findAvailable(): Scooter[] {
    return Array.from(this.scooters.values()).filter(
      (s) => s.status === ScooterStatus.AVAILABLE
    );
  }
}
