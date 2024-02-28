import React, { useContext, useEffect, useState } from "react";

import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

import useSignUp from "../../hooks/useSignUp";
import Web3Context from "../../contexts/Web3Context/context";
import { signWeb3AuthorizationMessage } from "../../utils/signAccount";
import { APPLICATION_ID, FULLCOUNT_PLAYER_API } from "../../constants";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignUp: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const { signUp, isLoading, isSuccess } = useSignUp();
  const web3ctx = useContext(Web3Context);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username && password && email) {
      signUp({ username, email, password });
    } else {
      setShowErrors(true);
    }
  };

  const createWeb3Account = async () => {
    const signedMessage = await signWeb3AuthorizationMessage(window.ethereum, web3ctx.account);
    const payload = {
      address: web3ctx.account,
      deadline: 1708523541,
      application: "FullcountPlayer",
      signed_message: signedMessage,
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64");

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        application_id: APPLICATION_ID,
        username: username,
        signature: encodedPayload,
      }),
    };

    fetch(`https://auth.bugout.dev/user`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create user");
        }
        console.log("User created successfully");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    console.log(signedMessage);
  };

  useEffect(() => {
    if (isSuccess) {
      onClose();
    }
  }, [isSuccess]);

  useEffect(() => {
    setShowErrors(false);
  }, [username, email, password]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <form onSubmit={handleSubmit}>
        <ModalContent p="0" borderRadius="20px" bg="transparent">
          <ModalBody bg="transparent">
            <Flex
              direction="column"
              bgColor="#1A1D22"
              borderRadius="20px"
              gap="30px"
              p="30px"
              alignItems="center"
              border="1px solid white"
            >
              <Flex justifyContent="end" w="100%">
                <CloseIcon
                  cursor="pointer"
                  onClick={() => {
                    onClose();
                  }}
                />
              </Flex>
              <Text fontSize="30px" fontWeight="700">
                Welcome!
              </Text>
              <FormControl>
                <FormLabel fontSize="16px">Username</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  name="username"
                  value={username}
                  borderColor={!username && showErrors ? "error.500" : "white"}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </FormControl>
              <FormControl mt="-20px">
                <FormLabel fontSize="16px">Email</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter your email"
                  name="email"
                  value={email}
                  borderColor={!email && showErrors ? "error.500" : "white"}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FormControl>

              <FormControl mt="-20px">
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  name="password"
                  borderColor={!password && showErrors ? "error.500" : "white"}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </FormControl>
              <Button
                w="100%"
                h="54px"
                type="submit"
                variant="plainGreen"
                bg="#00a341"
                p="10px 30px"
              >
                {isLoading ? <Spinner /> : <Text lineHeight="26px">Create account</Text>}
              </Button>
              {/*<button onClick={createWeb3Account}>web3</button>*/}
            </Flex>
          </ModalBody>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default SignUp;
