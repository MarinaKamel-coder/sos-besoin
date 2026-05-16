import { JwtPayload } from "@clerk/types";

declare global {
  interface CustomJwtSessionClaims extends JwtPayload {
    email?: string;
    name?: string;
  }
}