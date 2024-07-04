import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Title, Paragraph } from "react-native-paper";
import Toast from "react-native-toast-message";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import dismissKeyboard from "../../helpers/dismissKeyboard";

const ChangeUsernameDialog = ({ onDismiss }) => {
  const auth = getAuth();
  const db = getFirestore();

  const [newUsername, setNewUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isUsernameValid = (username) => {
    return (
      username.length >= 3 &&
      username.length <= 20 &&
      /^[a-zA-Z0-9_]+$/.test(username) &&
      !username.includes(" ")
    );
  };

  const isUsernameTaken = async (username) => {
    const querySnapshot = await getDocs(collection(db, "users"));
    let isTaken = false;

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.username === username) {
        isTaken = true;
      }
    });

    return isTaken;
  };

  const handleChangeUsername = async () => {
    if (!newUsername) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a new username",
      });
      return;
    }

    if (!isUsernameValid(newUsername)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          "Username should be 3-20 characters long and contain only letters, numbers, and underscores",
      });
      return;
    }

    const user = auth.currentUser;
    if (user) {
      setIsLoading(true);
      try {
        const isTaken = await isUsernameTaken(newUsername);
        if (isTaken) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "This username is already taken",
          });
          setIsLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { username: newUsername });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Username changed successfully",
        });
        setNewUsername("");
        setIsLoading(false);
        onDismiss();
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occurred, please try again later",
        });
        console.log(error);
        setIsLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Change Username</Title>

      <Paragraph style={styles.subtitle}>
        Enter your new username below.
      </Paragraph>

      <TextInput
        label="New Username"
        value={newUsername}
        onChangeText={setNewUsername}
        mode="outlined"
        style={styles.input}
        onSubmitEditing={() => dismissKeyboard(handleChangeUsername)}
        disabled={isLoading}
      />

      <Button
        mode="contained"
        onPress={() => dismissKeyboard(handleChangeUsername)}
        style={styles.button}
        disabled={isLoading}
      >
        Change Username
      </Button>

      <Button
        mode="text"
        onPress={onDismiss}
        style={styles.cancelButton}
        disabled={isLoading}
      >
        Cancel
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
});

export default ChangeUsernameDialog;
