import { create } from "zustand";

interface userState {
  token: string | null;
  email: string | null;
  neighborhood: string | null;
  setToken: (token: string) => void;
  cleanToken: () => void;
  setEmail: (email: string) => void;
  cleanEmail: () => void;
  setNeighborhood: (neighborhood: string) => void;
  cleanNeighborhood: () => void;
}

function getToken(): string | null {
  const token = localStorage.getItem("token");
  if (token) {
    return token;
  }
  return null;
}

function getNeighborhood(): string | null {
  const neighborhood = localStorage.getItem("neighborhood");
  if (neighborhood) {
    return neighborhood;
  }
  return null;
}

function getEmail(): string | null {
  const email = localStorage.getItem("email");
  if (email) {
    return email;
  }
  return null;
}

const userStore = create<userState>()((set) => ({
  token: getToken(),
  email: getEmail(),
  neighborhood: getNeighborhood(),
  setToken: (token: string) => {
    localStorage.setItem("token", token);
    set({ token: token });
  },
  cleanToken: () => {
    localStorage.removeItem("token");
    set({ token: "" });
  },

  setEmail: (email: string) => {
    localStorage.setItem("email", email);
    set({ email: email });
  },

  cleanEmail: () => {
    localStorage.removeItem("email");
    set({ email: "" });
  },

  setNeighborhood: (neighborhood: string) => {
    localStorage.setItem("neighborhood", neighborhood);
    set({ neighborhood: neighborhood });
  },

  cleanNeighborhood: () => {
    localStorage.removeItem("neighborhood");
    set({ neighborhood: "" });
  },
}));

export default userStore;
