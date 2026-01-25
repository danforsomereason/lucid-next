import axios from 'axios'

export async function checkUserExists(email: string) {
  const response = await axios.get(
    `http://localhost:3000/api/v1/users/check-exists/${email}`
  );
  return response.data;
}

export async function login(email: string, password: string) {
  // Make a POST request to the login endpoint
  const response = await axios.post(
    `http://localhost:3000/api/v1/users/login`,
    { email, password }
  );
  if (response.data.message) {
    throw new Error(response.data.message);
  }
  return response.data;
}