import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-[7rem] leading-[8rem] font-bold">404</h1>
        <span className="text-xl">Page not found</span>
      </div>
      <Button onClick={() => navigate("/")} variant="destructive">
        Go Home
      </Button>
    </div>
  );
}

export default NotFound;
