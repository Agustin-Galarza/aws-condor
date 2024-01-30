import { Input } from "@/components/ui/input";
import { Label as ShadcnLabel } from "@/components/ui/label";

interface LabelProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  type: string;
  label: string;
}

function Label({ value, onChange, id, type, label }: LabelProps) {
  return (
    <ShadcnLabel htmlFor={id} className="flex flex-col gap-2 appearance-none">
      <span className="text-primary text-sm">{label}</span>

      <Input
        onChange={(e) => onChange(e.target.value)}
        value={value}
        id={id}
        type={type}
      />
    </ShadcnLabel>
  );
}

export default Label;
