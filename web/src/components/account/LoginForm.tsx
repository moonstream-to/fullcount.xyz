import React, { useEffect, useState } from "react";

import { Spinner } from "@chakra-ui/react";

import styles from "./Account.module.css";
import useLogin from "../../hooks/useLogin";

const LoginForm = ({ setIsSuccess }: { setIsSuccess: (isSuccess: boolean) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, isSuccess } = useLogin();
  const [showInvalid, setShowInvalid] = useState(false);

  const isUsernameValid = !!username;
  const isPasswordValid = !!password;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isUsernameValid || !isPasswordValid) {
      setShowInvalid(true);
      return;
    }
    login({ username, password });
  };

  useEffect(() => {
    setIsSuccess(isSuccess);
  }, [isSuccess]);

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <div className={`${styles.container} ${isSuccess ? styles.fadeOut : ""}`}>
        <div className={`${styles.header} ${isSuccess ? styles.fadeOut : ""}`}>Welcome back!</div>
        <label className={styles.label}>Username</label>
        <input
          type="text"
          placeholder="Enter your username"
          name="username"
          value={username}
          className={showInvalid && !isUsernameValid ? "inputError" : ""}
          style={{ marginBottom: "10px" }}
          spellCheck={false}
          onChange={(event) => {
            setShowInvalid(false);
            setUsername(event.target.value);
          }}
        />
        <div className={styles.label}>Password</div>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          name="password"
          className={showInvalid && !isPasswordValid ? "inputError" : ""}
          style={{ marginBottom: "10px" }}
          spellCheck={false}
          onChange={(event) => {
            setShowInvalid(false);
            setPassword(event.target.value);
          }}
        />
      </div>
      <button className={styles.button}>
        {isLoading ? <Spinner /> : isSuccess ? <div>Success</div> : <div>Login</div>}
      </button>
    </form>
  );
};

export default LoginForm;
