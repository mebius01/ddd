import { Rider } from "../entities/rider";
import { UniqueId } from "../../../shared/domain/unique-id";

export interface IRiderRepository {
  save(rider: Rider): void;
  findById(id: UniqueId): Rider | undefined;
}
