import { Navigate } from "react-router-dom";
import userStore from "../store/userStore";
import { useState } from "react";
import { getGroups } from "../api/api.ts";
import { Button } from "@/components/ui/button.tsx";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label.tsx";

const neighborhoodList = [
  "Quilmes",
  "Bernal",
  "Don Bosco",
  "Ezpeleta",
  "Avellaneda",
  "Lomas de Zamora",
  "Berazategui",
  "Wilde",
];

function Neighborhood() {
  const { neighborhood, setNeighborhood } = userStore();
  const [neighborhoodState, setNeighborhoodState] = useState<string>("");

  const handleOnClick = () => {
    setNeighborhood(neighborhoodState);
  };

  getGroups()
    .then((res) => console.log("Processed response from get groups:", res))
    .catch((err) => console.log("Error from get groups:", err));

  if (neighborhood) return <Navigate to="/" />;

  return (
    <section className="min-h-[calc(100vh-112px)] flex items-center justify-center">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-primary font-bold text-2xl">Welcome to Condor</h1>
          <p className="text-sm text-muted-foreground">
            Find the newest report on your neighborhood.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-primary">Choose your neighborhood</Label>
          <div className="flex items-center gap-2">
            <Select onValueChange={(value) => setNeighborhoodState(value)}>
              <SelectTrigger className="w-[250px] text-primary">
                <SelectValue placeholder="Neighborhood" />
              </SelectTrigger>
              <SelectContent>
                {neighborhoodList.map((neighborhood) => (
                  <SelectItem value={neighborhood} key={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleOnClick} className="font-extrabold rounded ">
              GO
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Neighborhood;
