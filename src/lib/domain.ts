export type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  created_at: string;
};

export type Gym = {
  id: string;
  title: string;
  description: string | null;
  phone: string | null;
  latitude: string | number;
  longitude: string | number;
  deleted_at: string | null;
};

export type CheckIn = {
  id: string;
  user_id: string;
  gym_id: string;
  created_at: string;
  validated_at: string | null;
  status?: "VALIDATED" | "PENDING" | "EXPIRED";
  user?: Pick<User, "name" | "email">;
  gym?: Pick<Gym, "title">;
};

export type DashboardView = "discover" | "history" | "manage";
