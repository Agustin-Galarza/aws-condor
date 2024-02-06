import { useState } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import UserPool from "../UserPool.js";
import { Form, useNavigate } from "react-router-dom";
import Label from "../components/Label.js";
import userStore from "../store/userStore.js";
import { Button } from "@/components/ui/button.js";
const Login = () => {
  const [email, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setToken, setEmail } = userStore();

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const onSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        setToken(data.getIdToken().getJwtToken());
        setEmail(email);
        navigate("/");
      },
      onFailure: (err) => {
        console.error("onFailure: ", err);
        setError(err.message);
      },
      newPasswordRequired: (data) => {
        console.log("newPasswordRequired: ", data);
        setError("Please reset your password.");
      },
    });
  };

  return (
    <section className="flex flex-col w-full items-center justify-center mx-auto max-w-sm min-h-[calc(100vh-112px)] gap-6">
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-primary text-4xl font-bold">Login</h1>
        <p className="text-muted-foreground text-sm">
          Log into your account to be able to see and provide reports
        </p>
      </div>
      <Form onSubmit={onSubmit} className="flex flex-col gap-4 w-full">
        <Label
          value={email}
          onChange={setUserEmail}
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
        <Button type="submit">Login with email</Button>
        <div className="w-full flex justify-end">
          <button
            onClick={() => navigate("/signup")}
            className="text-sm text-blue-500 hover:underline"
          >
            I do not have an account
          </button>
        </div>
      </Form>
      {error && <p className="text-red-500">{error}</p>}
    </section>
  );
};

export default Login;
