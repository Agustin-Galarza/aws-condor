import { useQuery } from "@tanstack/react-query";
import CustomMasonry from "./Masonry";

function ReportList() {
  const reports = useQuery({
    queryKey: ["reports"],
    queryFn: () =>
      fetch("https://api.thecatapi.com/v1/images/search?limit=10").then((res) =>
        res.json()
      ),
    refetchOnWindowFocus: false,
  });
  return (
    <CustomMasonry>
      {reports.data?.map((report: { id: string; url: string }) => (
        <div className="w-full flex items-center flex-col" key={report.id}>
          <img
            title={report.id}
            alt={report.id}
            src={report.url}
            className="rounded-md w-full"
          />
          <span className="text-secondary text-sm">{report.id}</span>
        </div>
      ))}
    </CustomMasonry>
  );
}

export default ReportList;
