import { useState } from "react";
import UserPool from "../UserPool.js";
import { Form, useNavigate } from "react-router-dom";
import Label from "../components/Label.js";
import { CognitoUser } from "amazon-cognito-identity-js";
import { Button } from "@/components/ui/button.js";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [user, setUser] = useState<CognitoUser | null>(null);

  const [signed, setSigned] = useState(false);

  const [confirmationCode, setConfirmationCode] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    UserPool.signUp(email, password, [], [], (err, data) => {
      if (err) {
        console.log(err);
        setError(err.message);
        return;
      }
      console.log(data);
      setUser(data!.user);
      setSigned(true);
    });
  };

  const handleConfirm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Event", confirmationCode);
    const res = user!.confirmRegistration(
      confirmationCode,
      false,
      () => {},
      {}
    );
    console.log(res);

    if (!res) {
      setError("There was a problem while confirming the account");
      return;
    }

    navigate("/login");
  };

  return (
    <section className="flex flex-col w-full mx-auto max-w-sm  items-center justify-center min-h-[calc(100vh-112px)] gap-6">
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-primary text-4xl font-bold">Sign up</h1>
        <p className="text-muted-foreground text-sm">
          Create an account to be able to see and provide reports
        </p>
      </div>
      <Form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
        <Label
          value={email}
          onChange={setEmail}
          id="email"
          type="text"
          label="Email"
        />
        <Label
          value={password}
          onChange={setPassword}
          id="password"
          type="password"
          label="Password"
        />
        <Button type="submit">Sign up with email</Button>
        <div className="w-full flex justify-end">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-blue-500 hover:underline"
          >
            I already have an account
          </button>
        </div>
      </Form>
      {error && <p className="text-red-500">{error}</p>}
      {signed ? (
        <Form onSubmit={handleConfirm} className="flex flex-col gap-4">
          <Label
            value=""
            onChange={(e) => setConfirmationCode(e.target.value)}
            id="confirmation"
            type="text"
            label="Confirmation code"
          />
          <Button type="submit">Submit</Button>
        </Form>
      ) : (
        <></>
      )}
    </section>
  );
};

export default Signup;
