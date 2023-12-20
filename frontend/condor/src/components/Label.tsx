interface LabelProps {
  email: string;
  onChange: (value: string) => void;
  id: string;
  type: string;
  label: string;
}

function Label({ email, onChange, id, type, label }: LabelProps) {
  return (
    <label htmlFor="email" className="flex flex-col gap-2">
      <span className="text-zinc-300 text-sm font-bold">{label}</span>
      <input
        value={email}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent border-zinc-600 border-[1px] rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
        id={id}
        type={type}
      />
    </label>
  );
}

export default Label;
