import jwt from "jsonwebtoken";

export default function verify(token: string, debug?: boolean) {
  try {
    const decoded = jwt.verify(token, "TEST_SECRET");
    return decoded;
  } catch (error) {
    if (debug) {
      console.error(error);
    }
    return undefined;
  }
}
