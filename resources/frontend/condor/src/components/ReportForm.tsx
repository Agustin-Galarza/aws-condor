import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import Label from "./Label";
import { createNewReport } from "@/api/api";
import userStore from "@/store/userStore";

function ReportForm({
  classname,
  onFinish,
}: {
  classname?: string;
  onFinish: () => void;
}) {
  const [error, setError] = useState("");
  const { email } = userStore();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSendReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const file = (e.target as HTMLFormElement).file_input.files[0];

    if (!file) return setError("No file selected");
    if (file.size > 8000000) return setError("File too large");
    if (!file.type.includes("image") && !file.type.includes("video"))
      return setError("Invalid file type");

    console.log("Sending report with file:", file);

    const res = await createNewReport(email ?? "", message, file);
    console.log("Processed response from create new report:", res);
    onFinish();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    console.log(file);
    setFile(file);
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
        <Input
          id="file_input"
          type="file"
          onChange={(e) => handleFileChange(e)}
        />

        <p className="mt-1 text-sm text-muted-foreground" id="file_input_help">
          Only supports png, jpg, mp4
        </p>

        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div className="w-full">
        <Label
          value={message}
          onChange={setMessage}
          id="Message"
          type="text"
          label="Message"
        />
      </div>
      <Button type="submit" className="w-full">
        Send
      </Button>
    </form>
  );
}

export default ReportForm;
