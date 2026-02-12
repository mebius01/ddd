import { v4 as uuidv4 } from "uuid";

export class UniqueId {
  private readonly value: string;

  constructor(id?: string) {
    this.value = id ?? uuidv4();
  }

  equals(other: UniqueId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
