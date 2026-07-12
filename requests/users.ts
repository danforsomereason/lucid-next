import { LicenseType, loginInputSchema, loginOutputSchema, registerInputSchema, registerOutputSchema, RegisterTeamInput, registerTeamInputSchema } from '@/types';
import axios from 'axios'

export async function checkUserExists(email: string) {
  const response = await axios.get(
    `http://localhost:3000/api/v1/users/check-exists/${email}`
  );
  return response.data;
}

export async function login(
  email: string,
  password: string
) {
  const inputData = { email, password };
  const input = loginInputSchema.parse(inputData);
  const response = await axios.post(
    `http://localhost:3000/api/v1/users/login`,
    input
  );
  if (response.data.message) {
    throw new Error(response.data.message);
  }
  const output = loginOutputSchema.parse(response.data);
  return output;
}

export async function registerIndividual(
  firstName: string,
  lastName: string,
  email: string,
  licenseType: LicenseType,
  password: string
) {
  const inputData = {
    firstName,
    lastName,
    email,
    licenseType,
    password,
  };
  const input = registerInputSchema.parse(inputData);
  const body = JSON.stringify(input);
  const headers = {
    "Content-Type": "application/json",
  };
  const init = {
    method: "POST",
    body,
    headers,
  };
  const response = await fetch(
    "http://localhost:3000/api/v1/users/signup",
    init
  );
  const outputData = await response.json();
  const output = registerOutputSchema.parse(outputData);
  return output
}

export async function registerJoin(
  firstName: string,
  lastName: string,
  email: string,
  licenseType: LicenseType,
  password: string
) {
  const inputData = {
    firstName,
    lastName,
    email,
    licenseType,
    password,
  };
  const input = registerInputSchema.parse(inputData);
  const body = JSON.stringify(input);
  const headers = {
    "Content-Type": "application/json",
  };
  const init = {
    method: "POST",
    body,
    headers,
  };
  const response = await fetch(
    "http://localhost:3000/api/v1/users/signup/join",
    init
  );
  const outputData = await response.json();
  const output = registerOutputSchema.parse(outputData);
  return output
}

export async function registerTeam(
  firstName: string,
  lastName: string,
  email: string,
  licenseType: LicenseType,
  organization: string,
  password: string,
  verifiedUsers: string[]
) {
  const inputData: RegisterTeamInput = {
    firstName,
    lastName,
    email,
    licenseType,
    organization,
    password,
    verifiedUsers,
  };
  const parsed = registerTeamInputSchema.parse(inputData);
  const body = JSON.stringify(parsed);
  const headers = {
    "Content-Type": "application/json",
  };
  const init = {
    method: "POST",
    body,
    headers,
  };
  const response = await fetch(
    "http://localhost:3000/api/v1/users/signup/team",
    init
  );
  const outputData = await response.json();
  const output = registerOutputSchema.parse(outputData);
  return output
}