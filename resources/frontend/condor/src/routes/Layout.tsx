import { Outlet, useNavigate } from "react-router-dom";
import userStore from "../store/userStore.js";
import { Button } from "@/components/ui/button.js";

function Layout() {
  const navigate = useNavigate();

  const { token, cleanToken } = userStore();

  return (
    <main className="dark bg-background min-h-screen flex flex-col justify-between items-center">
      <div className="w-full">
        <nav className="flex h-16 gap-4 justify-between items-center w-full border-b-[1px] border-muted px-5 ">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1"
          >
            <img src="/condor.svg" alt="logo" className="h-10" />
            <span className="text-xl text-primary font-bold font-logo">
              Condor
            </span>
          </button>
          {token ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                cleanToken();
                navigate("/login");
              }}
            >
              Logout
            </Button>
          ) : (
            <div className="flex gap-2 items-center">
              <Button size="lg" onClick={() => navigate("login")}>
                Login
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("signup")}
              >
                Signup
              </Button>
            </div>
          )}
        </nav>
        <div className="h-full px-5 mx-auto">
          <Outlet />
        </div>
      </div>
      <footer className="border-[1px] border-muted text-muted-foreground text-sm flex h-12 w-full items-center justify-center">
        Condor 2023 ITBA
      </footer>
    </main>
  );
}

export default Layout;
