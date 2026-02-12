import { Rider } from "../domain/entities/rider";
import { IRiderRepository } from "../domain/repositories/i-rider-repository";
import { UniqueId } from "../../shared/domain/unique-id";

export class InMemoryRiderRepository implements IRiderRepository {
  private riders: Map<string, Rider> = new Map();

  save(rider: Rider): void {
    this.riders.set(rider.id.toString(), rider);
  }

  findById(id: UniqueId): Rider | undefined {
    return this.riders.get(id.toString());
  }
}
