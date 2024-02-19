import http from "../utils/httpFullcountPlayer";

export const AUTH_URL = `https://auth.bugout.dev`;

export const loginService = ({
  username,
  password,
  token_note,
}: {
  username: string;
  password: string;
  token_note?: string;
}) => {
  const data = new FormData();
  data.append("username", username);
  data.append("password", password);
  data.append("application_id", "6a97c2fa-e485-4073-9b5f-a533f4718837");
  if (token_note) {
    data.append("token_note", token_note);
  }
  return http({
    method: "POST",
    url: `${AUTH_URL}/token`,
    data,
  });
};

export const revokeService = () => {
  console.log("revoke");
  return http({
    method: "DELETE",
    url: `${AUTH_URL}/token`,
  });
};

export const registerService =
  () =>
  ({ username, email, password }: { username: string; email: string; password: string }) => {
    const data = new FormData();
    data.append("username", username);
    data.append("email", email);
    data.append("password", password);

    return http({
      method: "POST",
      url: `${AUTH_URL}/`,
      data,
    }).then(() =>
      http({
        method: "POST",
        url: `${AUTH_URL}/token`,
        data,
      }),
    );
  };

export const forgotPasswordService = ({ email }: { email: string }) => {
  const data = new FormData();
  data.append("email", email);
  return http({
    method: "POST",
    url: `${AUTH_URL}/password/reset_initiate`,
    data,
  });
};

export const resetPassword = ({
  newPassword,
  resetId,
}: {
  newPassword: string;
  resetId: string;
}) => {
  const data = new FormData();
  data.append("reset_id", resetId);
  data.append("new_password", newPassword);
  return http({
    method: "POST",
    url: `${AUTH_URL}/password/reset_complete`,
    data,
  });
};

export const changePassword = ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) => {
  const data = new FormData();
  data.append("current_password", currentPassword);
  data.append("new_password", newPassword);
  return http({
    method: "POST",
    url: `${AUTH_URL}/profile/password`,
    data,
  });
};

export const getTokenList = () => {
  return http({
    method: "GET",
    url: `${AUTH_URL}/tokens`,
  });
};

export const updateToken = ({ note, token }: { note: string; token: string }) => {
  const data = new FormData();
  data.append("token_note", note);
  data.append("access_token", token);
  return http({
    method: "PUT",
    url: `${AUTH_URL}/token`,
    data,
  });
};

export const revokeToken = (token: string) => {
  return http({
    method: "POST",
    url: `${AUTH_URL}/revoke/${token}`,
  });
};
