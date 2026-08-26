import { GympassApplication } from "@/features/application/gympass-application";
import { connection } from "next/server";

export default async function Page() {
  await connection();

  return <GympassApplication />;
}
