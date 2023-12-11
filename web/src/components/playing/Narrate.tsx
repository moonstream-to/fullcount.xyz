import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { Text } from "@chakra-ui/react";

const Narrate = ({
  sessionID,
  speed = 30,
  isComplete,
}: {
  sessionID: number;
  speed?: number;
  isComplete: boolean;
}) => {
  const [length, setLength] = useState(0);
  const intervalIDRef = useRef<NodeJS.Timer | undefined>();
  const [isCompleteFetched, setIsCompleteFetched] = useState(false);

  useEffect(() => {
    if (isComplete && !isCompleteFetched) {
      setLength(0);
      narrate.refetch();
      return;
    } else {
      if (!narrate.data) {
        narrate.refetch();
      }
      setIsCompleteFetched(false);
    }
  }, [isComplete]);

  const narrate = useQuery(
    ["narrate", sessionID],
    () => {
      const API_URL = "https://api.fullcount.xyz/throws";
      return axios.get(`${API_URL}/${sessionID}/narrate`).then((res) => res.data.narration);
    },
    {
      enabled: false,
      onSuccess: (data) => {
        if (speed === 0) {
          setLength(data.length);
        } else {
          intervalIDRef.current = setInterval(() => {
            setLength((prevLength) => {
              if (prevLength >= data.length) {
                if (intervalIDRef.current) {
                  clearInterval(intervalIDRef.current);
                }
              }
              return prevLength + 1;
            });
          }, 35);
        }
      },
    },
  );

  return (
    <>
      {narrate.data && (
        <Text fontSize={"18px"} fontWeight={700}>
          {narrate.data.slice(0, length)}
        </Text>
      )}
    </>
  );
};

export default Narrate;
