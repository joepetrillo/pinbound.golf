/** Minimal projection of the AuthKit user that the app actually renders. */
export interface SignedInUser {
  email: string | null;
  firstName: string | null;
  id: string;
}
