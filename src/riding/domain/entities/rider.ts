import { Entity } from "../../../shared/domain/entity";
import { UniqueId } from "../../../shared/domain/unique-id";

interface RiderProps {
  name: string;
  email: string;
}

/**
 * Rider — Entity. Той, хто орендує самокат.
 */
export class Rider extends Entity<RiderProps> {
  private constructor(props: RiderProps, id?: UniqueId) {
    super(props, id);
  }

  static create(name: string, email: string, id?: UniqueId): Rider {
    if (!name || name.trim().length === 0) {
      throw new Error("Rider name cannot be empty");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email");
    }
    return new Rider({ name, email }, id);
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }
}
