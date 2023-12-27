import { create } from "zustand";
function getToken() {
    const token = localStorage.getItem("token");
    if (token) {
        return token;
    }
    return null;
}
function getNeighborhood() {
    const neighborhood = localStorage.getItem("neighborhood");
    if (neighborhood) {
        return neighborhood;
    }
    return null;
}
const userStore = create()((set) => ({
    token: getToken(),
    neighborhood: getNeighborhood(),
    setToken: (token) => {
        localStorage.setItem("token", token);
        set({ token: token });
    },
    cleanToken: () => {
        localStorage.removeItem("token");
        set({ token: "" });
    },
    setNeighborhood: (neighborhood) => {
        localStorage.setItem("neighborhood", neighborhood);
        set({ neighborhood: neighborhood });
    },
    cleanNeighborhood: () => {
        localStorage.removeItem("neighborhood");
        set({ neighborhood: "" });
    },
}));
export default userStore;
