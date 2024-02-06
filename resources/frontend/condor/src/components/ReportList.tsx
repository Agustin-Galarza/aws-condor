import React from "react";
import { useQuery } from "@tanstack/react-query";
import CustomMasonry from "./Masonry";
import { getImage, getReportsFromGroup, Report } from "@/api/api";
import userStore from "@/store/userStore";

const LoadingMessage = ({ className }: { className: string }) => (
  <div className={className}>
    <div className="w-full flex items-center justify-center">
      <span className="text-muted-foreground text-sm">Loading...</span>
    </div>
  </div>
);

const NoReportsMessage = ({ className }: { className: string }) => (
  <div className={className}>
    <div className="w-full flex items-center justify-center">
      <span className="text-muted-foreground text-sm">No reports</span>
    </div>
  </div>
);

const ReportItem = React.memo(
  ({ report }: { report: { imageUrl: string } & Report }) => (
    <div className="w-full flex items-center flex-col" key={report.id}>
      <img
        title={report.id}
        alt={report.id}
        src={report.imageUrl || ""}
        className="rounded-md w-full"
      />
      <div className="flex flex-col gap-1 w-full">
        <span className="text-secondary-foreground text-sm">
          {report.message}
        </span>
        <span className="text-secondary-foreground text-sm opacity-75">
          {new Date(report.sentAt).toLocaleDateString("en-BR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  )
);

function ReportList({ className }: { className: string }) {
  const { neighborhood } = userStore();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      if (!neighborhood) return [];
      const res = await getReportsFromGroup(neighborhood);
      console.log("Processed response from get reports from group:", res);

      const reportPromises = res.data.map(async (report: Report) => {
        const imageUrl = await getImage(report.imageId ?? "");
        return {
          imageUrl,
          ...report,
        };
      });

      const reportsWithImage = await Promise.all(reportPromises);

      return reportsWithImage;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingMessage className={className} />;
  }

  return (
    <div className={className}>
      {reports === undefined || reports.length === 0 ? (
        <NoReportsMessage className={className} />
      ) : (
        <CustomMasonry>
          {reports.map((report) => (
            <ReportItem key={report.id} report={report} />
          ))}
        </CustomMasonry>
      )}
    </div>
  );
}

export default ReportList;
