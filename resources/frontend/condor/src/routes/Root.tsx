import { Navigate } from "react-router-dom";
import userStore from "../store/userStore";
import ReportList from "@/components/ReportList";
import ReportDrawer from "@/components/ReportDrawer";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";

function Root() {
  const { neighborhood } = userStore();
  // const navigate = useNavigate();

  if (!neighborhood) return <Navigate to="/neighborhood" />;

  // const handleLeaveNeighborhood = () => {
  //   console.log("Leave neighborhood");
  //   cleanNeighborhood();
  //   navigate("/neighborhood");
  // };

  return (
    <section className="grid grid-cols-1 grid-rows-[auto_1fr] gap-10 py-10">
      <div className="sm:flex-row flex flex-col items-center gap-10 sm:gap-4 row-start-1">
        <h1 className="text-primary text-2xl font-semibold">
          Alerts in {neighborhood}
        </h1>
        {/* <div className="sm:flex-row flex flex-col items-center w-full sm:w-auto gap-2 sm:gap-4"> */}
        <ReportDrawer />
        {/* <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => handleLeaveNeighborhood()}
          >
            Leave neighborhood
          </Button> */}
        {/* </div> */}
      </div>
      <ReportList className=" row-start-2" />
    </section>
  );
}

export default Root;
