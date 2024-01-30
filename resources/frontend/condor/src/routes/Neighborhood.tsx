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
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-bold text-2xl">Select your Neighborhood</h1>
        <div className="flex items-center gap-2">
          <Select onValueChange={(value) => setNeighborhoodState(value)}>
            <SelectTrigger className="w-[250px] text-primary">
              <SelectValue placeholder="Select your neighborhood" />
            </SelectTrigger>
            <SelectContent>
              {neighborhoodList.map((neighborhood) => (
                <SelectItem value={neighborhood} key={neighborhood}>
                  {neighborhood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleOnClick}
            className="font-extrabold rounded h-12"
          >
            GO
          </Button>
        </div>
      </div>
    </section>
  );
}
export default Neighborhood;
