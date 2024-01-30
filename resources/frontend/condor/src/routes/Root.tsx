import { Navigate } from "react-router-dom";
import userStore from "../store/userStore";
import ReportList from "@/components/ReportList";
import ReportDrawer from "@/components/ReportDrawer";

function Root() {
  const { neighborhood } = userStore();

  if (!neighborhood) return <Navigate to="/neighborhood" />;

  return (
    <section className="grid grid-cols-1 grid-rows-[auto_auto_1fr] sm:grid-rows-[1fr_auto] gap-10 py-10">
      <div className="flex items-center gap-4">
        <h1 className="text-primary col-start-1 row-start-1 text-2xl font-bold">
          Alertas de {neighborhood}
        </h1>
        <ReportDrawer />
      </div>
      <ReportList className="col-start-1 sm:row-start-2 row-start-3" />
    </section>
  );
}

export default Root;
