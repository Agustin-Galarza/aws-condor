import { Navigate } from "react-router-dom";
import userStore from "../store/userStore";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function Root() {
  const { neighborhood } = userStore();

  const [error, setError] = useState("");

  const reports = useQuery({
    queryKey: ["reports"],
    queryFn: () =>
      fetch("https://api.thecatapi.com/v1/images/search?limit=10").then((res) =>
        res.json()
      ),
  });

  const handleSendReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = (e.target as HTMLFormElement).file_input.files[0];

    if (!file) return setError("No file selected");
    if (file.size > 1000000) return setError("File too large");
    if (!file.type.includes("image") && !file.type.includes("video"))
      return setError("Invalid file type");

    console.log(file);
    // Post to API
  };

  if (!neighborhood) return <Navigate to="/neighborhood" />;

  return (
    <section className="min-h-[calc(100vh-112px)] flex flex-col gap-10 items-center py-10">
      <h1 className="text-zinc-500 text-4xl font-bold">
        Alertas de <span className="text-zinc-300">{neighborhood}</span>
      </h1>
      <form
        className="flex flex-col items-center gap-4 min-w-[15rem] w-1/2"
        onSubmit={handleSendReport}
      >
        <div className="w-full">
          <label
            className="block mb-2 text-sm font-medium text-zinc-200"
            htmlFor="file_input"
          >
            Report
          </label>
          <input
            className="appearance-none block w-full text-sm text-gray-300 border-gray-500 border-[1px] rounded-lg cursor-pointer bg-zinc-800 focus:outline-none"
            id="file_input"
            type="file"
          />
          <p
            className="mt-1 text-sm text-gray-500 dark:text-gray-300"
            id="file_input_help"
          >
            PNG, JPG, Mp4
          </p>
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-red-500 font-extrabold rounded w-full"
        >
          Send
        </button>
      </form>
      <div className="overflow-hidden h-full">
        <ul className="w-auto">
          {reports.data?.map((report: { id: string; url: string }) => (
            <li className="w-full flex items-center flex-col" key={report.id}>
              <img src={report.url} alt="cat" className="w-1/2 h-1/2" />
              {report.id}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Root;
