import { useState } from "react";
import UserPool from "../UserPool.js";
import { Form, useNavigate } from "react-router-dom";
import Label from "../components/Label.js";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    UserPool.signUp(email, password, [], null, (err, data) => {
      if (err) {
        console.log(err);
        setError(err.message);
      }
      console.log(data);
      navigate("/");
    });
  };

  return (
    <section className="flex flex-col w-full items-center justify-center min-h-[calc(100vh-112px)] gap-10">
      <h1 className="text-4xl font-bold">Signup</h1>
      <Form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Label
          email={email}
          onChange={setEmail}
          id="email"
          type="email"
          label="Email"
        />
        <Label
          email={password}
          onChange={setPassword}
          id="password"
          type="password"
          label="Password"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-red-500 font-extrabold rounded"
        >
          Signup
        </button>
        <div className="w-full flex justify-end">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-red-500 "
          >
            I already have an account
          </button>
        </div>
      </Form>
      {error && <p className="text-red-500">{error}</p>}
    </section>
  );
};

export default Signup;
