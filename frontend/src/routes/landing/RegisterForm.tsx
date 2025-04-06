import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ROUTES, post } from "../../util/api";
import React from "react";

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
    } else {
      post(ROUTES.register, { name: `${firstName} ${lastName}`, email, password })
        .then((res) => {
          if (res.error) {
            setError(res.error);
            return;
          }
          localStorage.setItem("token", res.token);
          navigate("/dashboard");
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center p-4 space-y-4 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register here.</h2>

      <Input
        id="firstName"
        type="text"
        placeholder="Enter your first name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />

      <Input
        id="lastName"
        type="text"
        placeholder="Enter your last name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />

      <Input
        id="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        id="password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Input
        id="confirm-password"
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {error && <p className="text-red-500">{error}</p>}

      <Button type="submit" className="w-full mt-4">
      Register
      </Button>
    </form>
  )
};

export default RegisterForm;