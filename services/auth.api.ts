import http from "../services/http";
import { User } from "@/types/user";

export async function login(
	email: string,
	password: string,
	role?: string
): Promise<{ user: User; token: string }> {
	const res = await http.post("/auth/login", { email, password, role });
	return res.data;
}
export async function register(
	firstName: string,
	lastName: string,
	email: string,
	password: string,
	role: string
): Promise<{ user: User; token: string }> {
	const res = await http.post("/auth/register", {
		firstName,
		lastName,
		email,
		password,
		role,
	});
	return res.data;
}

export async function getProfile(): Promise<{ user: User }> {
  const res = await http.get("/auth/profile");
  return res.data;
}

