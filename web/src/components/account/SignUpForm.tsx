import React, { useEffect, useState } from "react";

import { Spinner } from "@chakra-ui/react";

import useSignUp from "../../hooks/useSignUp";
import styles from "./Account.module.css";

const SignUpForm = ({ setIsSuccess }: { setIsSuccess: (isSuccess: boolean) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const { signUp, isLoading, isSuccess } = useSignUp();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username && password && email) {
      signUp({ username, email, password });
    } else {
      setShowErrors(true);
    }
  };
  useEffect(() => {
    setShowErrors(false);
  }, [username, email, password]);

  useEffect(() => {
    setIsSuccess(isSuccess);
  }, [isSuccess]);

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <div className={`${styles.container} ${isSuccess ? styles.fadeOut : ""}`}>
        <div className={styles.header}>Welcome!</div>
        <label className={styles.label}>Username</label>
        <input
          type="text"
          placeholder="Enter your username"
          name="username"
          value={username}
          className={showErrors && !username ? "inputError" : ""}
          onChange={(event) => setUsername(event.target.value)}
          style={{ marginBottom: "10px" }}
          spellCheck={false}
        />

        <div className={styles.label}>Email</div>
        <input
          type="text"
          placeholder="Enter your email"
          name="email"
          value={email}
          className={showErrors && !email ? "inputError" : ""}
          style={{ marginBottom: "10px" }}
          onChange={(event) => setEmail(event.target.value)}
          spellCheck={false}
        />

        <div className={styles.label}>Password</div>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          name="password"
          className={showErrors && !password ? "inputError" : ""}
          style={{ marginBottom: "10px" }}
          onChange={(event) => setPassword(event.target.value)}
          spellCheck={false}
        />
      </div>
      <button className={styles.button}>
        {isLoading ? <Spinner /> : isSuccess ? <div>Success</div> : <div>Create account</div>}
      </button>
    </form>
  );
};

export default SignUpForm;
