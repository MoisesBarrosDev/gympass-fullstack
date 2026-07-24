import type { CheckIn } from "../generated/prisma/client.js";
import type { CheckInUncheckedCreateInput } from "../generated/prisma/models.js";

export interface CheckInsRepository {
  create(data: CheckInUncheckedCreateInput): Promise<CheckIn>;
}
 