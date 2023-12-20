import { Outlet, useNavigate } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();

  return (
    <main className="bg-zinc-800 min-h-screen flex flex-col justify-between items-center">
      <div className="w-full">
        <nav className="flex h-16 gap-4 justify-between w-full border-b-[1px] border-zinc-700 px-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1"
          >
            <img src="/condor.svg" alt="logo" className="h-10" />
            <span className="text-xl font-bold font-logo">Condor</span>
          </button>
          <div className="flex gap-4">
            <button onClick={() => navigate("login")}>Login</button>
            <button onClick={() => navigate("signup")}>Signup</button>
          </div>
        </nav>
        <div className="h-full">
          <Outlet />
        </div>
      </div>
      <footer className="bg-zinc-900 text-zinc-500 text-sm flex h-12 w-full items-center justify-center">
        Condor 2023 ITBA
      </footer>
    </main>
  );
}

export default Layout;
