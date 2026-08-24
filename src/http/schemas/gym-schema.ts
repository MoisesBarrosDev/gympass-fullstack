import { z } from "zod";

export const gymTitleSchema = z
  .string()
  .trim()
  .min(3)
  .max(100)
  .regex(/\p{L}/u, "Gym name must contain at least one letter.");

export const gymDescriptionSchema = z.string().trim().min(10).max(500);

export const gymPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^\(\d{2}\)\s?9\d{4}-\d{4}$/,
    "Phone must be a mobile number with area code, e.g. (99) 99999-9999.",
  );

export const latitudeSchema = z.number().finite().min(-90).max(90);
export const longitudeSchema = z.number().finite().min(-180).max(180);
