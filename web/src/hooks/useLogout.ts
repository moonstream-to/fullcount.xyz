import { useMutation, useQueryClient } from "react-query";
import useUser from "../contexts/UserContext";
import { revokeService } from "../services/auth.service";

const useLogout = () => {
  // const router = useRouter()
  const cache = useQueryClient();
  const { mutate: logout, isLoading } = useMutation(revokeService, {
    onSuccess: () => {
      // router.push("/")
      setUser(null);
      localStorage.removeItem("FULLCOUNT_ACCESS_TOKEN");
      cache.clear();
    },
  });
  const { setUser } = useUser();

  return {
    logout,
    isLoading,
  };
};

export default useLogout;
