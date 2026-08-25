ALTER TABLE "check-ins" DROP CONSTRAINT "check-ins_gym_id_fkey";

ALTER TABLE "check-ins"
ADD CONSTRAINT "check-ins_gym_id_fkey"
FOREIGN KEY ("gym_id") REFERENCES "gyms"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
