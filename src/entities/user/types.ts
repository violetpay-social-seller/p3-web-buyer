export type UserRole = "BUYER" | "SELLER" | "OPERATOR";
export type UserStatus = "ACTIVE" | "BLOCKED" | "WITHDRAWN";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  storeId?: string;
};
