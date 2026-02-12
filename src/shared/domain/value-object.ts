/**
 * Value Object — об'єкт без ідентичності.
 * Два Value Objects рівні, якщо всі їхні властивості збігаються.
 */
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
