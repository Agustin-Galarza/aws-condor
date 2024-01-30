import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
function ReportForm({ classname }: { classname?: string }) {
  const [error, setError] = useState("");

  const handleSendReport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = (e.target as HTMLFormElement).file_input.files[0];

    if (!file) return setError("No file selected");
    if (file.size > 8000000) return setError("File too large");
    if (!file.type.includes("image") && !file.type.includes("video"))
      return setError("Invalid file type");

    console.log(file);
    // Post to API
  };

  return (
    <form
      className={cn(
        "flex flex-col items-center gap-4 min-w-[15rem]",
        classname
      )}
      onSubmit={handleSendReport}
    >
      <div className="w-full">
        <Input value="" id="file_input" type="file" />

        <p className="mt-1 text-sm text-muted-foreground" id="file_input_help">
          Only supports PNG, JPG, Mp4
        </p>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
      <Button type="submit" className="w-full">
        Send
      </Button>
    </form>
  );
}

export default ReportForm;
