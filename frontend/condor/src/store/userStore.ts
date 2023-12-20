import { create } from "zustand";

interface userState {
  token: string | null;
  neighborhood: string | null;
  setToken: (token: string) => void;
  cleanToken: () => void;
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

const userStore = create<userState>()((set) => ({
  token: getToken(),
  neighborhood: getNeighborhood(),
  setToken: (token: string) => {
    localStorage.setItem("token", token);
    set({ token: token });
  },
  cleanToken: () => {
    localStorage.removeItem("token");
    set({ token: "" });
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
