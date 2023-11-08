import styles from './Playing.module.css'
import {Flex, Text} from "@chakra-ui/react";

const Playing = () => {
  return (
      <Flex className={styles.container}>
        <Text className={styles.title}>Playing</Text>
        <Text className={styles.prompt}>Soon...</Text>
      </Flex>
      )
}

export default Playing