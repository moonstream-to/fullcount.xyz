import React, { useState } from "react";

import {
  FormControl,
  InputGroup,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Flex,
  Text,
} from "@chakra-ui/react";
import useForgotPassword from "../../hooks/useForgotPassword";
import { CloseIcon } from "@chakra-ui/icons";

const ForgotPassword = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const { forgotPassword, isLoading } = useForgotPassword();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    forgotPassword({ email });
  };

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
              <Flex justifyContent="space-between" w="100%">
                <Text>Forgot Password</Text>
                <CloseIcon
                  cursor="pointer"
                  onClick={() => {
                    onClose();
                  }}
                />
              </Flex>
              <FormControl my={4}>
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Enter your email"
                    name="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </InputGroup>
              </FormControl>
              <Button
                fontSize="lg"
                h="46px"
                type="submit"
                width="100%"
                variant="plainOrange"
                isLoading={isLoading}
              >
                Send
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </form>
    </Modal>
  );
};

export default ForgotPassword;
