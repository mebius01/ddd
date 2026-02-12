import { UniqueId } from "./unique-id";

/**
 * Entity — доменний об'єкт з унікальною ідентичністю.
 * Дві сутності рівні, якщо їхні ID збігаються.
 */
export abstract class Entity<T> {
  protected readonly _id: UniqueId;
  protected props: T;

  constructor(props: T, id?: UniqueId) {
    this._id = id ?? new UniqueId();
    this.props = props;
  }

  get id(): UniqueId {
    return this._id;
  }

  equals(other: Entity<T>): boolean {
    return this._id.equals(other._id);
  }
}
