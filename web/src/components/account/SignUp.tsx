import React, { useEffect, useState } from "react";

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
  Image,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

import useSignUp from "../../hooks/useSignUp";

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username && password && email) {
      signUp({ username, email, password });
    } else {
      setShowErrors(true);
    }
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
              <Button w="100%" h="54px" type="submit" variant="plainOrange" p="10px 30px">
                {isLoading ? <Spinner /> : <Text lineHeight="26px">Create account</Text>}
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default SignUp;
