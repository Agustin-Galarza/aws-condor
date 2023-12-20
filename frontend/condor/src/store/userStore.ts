import { create } from "zustand";

interface userState {
  token: string | null;
  setToken: (token: string) => void;
  cleanToken: () => void;
}

function getToken(): string | null {
  const token = localStorage.getItem("token");
  if (token) {
    return token;
  }
  return null;
}

const userStore = create<userState>()((set) => ({
  token: getToken(),
  setToken: (token: string) => {
    localStorage.setItem("token", token);
    set({ token: token });
  },
  cleanToken: () => {
    localStorage.removeItem("token");
    set({ token: "" });
  },
}));

export default userStore;
