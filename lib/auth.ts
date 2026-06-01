// Auth placeholder — will be replaced with Better Auth in a later phase
// This file exists to keep the build passing until Better Auth is properly installed.

import { db } from "@/lib/db";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string | null;
};

export type Session = {
  user: SessionUser;
} | null;

export const auth = {
  api: {
    getSession: async (): Promise<Session> => {
      return null; // No session until Better Auth is set up
    },
  },
};
