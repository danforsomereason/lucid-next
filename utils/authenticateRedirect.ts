import authenticate from "./authenticate";
import { redirect } from "next/navigation";

export default async function authenticateRedirect(
  debug?: boolean
) {
  try {
    const user = await authenticate(debug);
    if (!user) {
      redirect('/signin')
    }
    return user
  } catch (error) {
    if (debug) {
      console.error(error);
    }
    redirect('/signin')
  }
}
