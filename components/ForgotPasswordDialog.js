import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Title, Paragraph } from "react-native-paper";
import Toast from "react-native-toast-message";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

import dismissKeyboard from "../helpers/dismissKeyboard";

const ForgotPasswordDialog = ({ onDismiss }) => {
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password reset email sent, check your inbox",
        });
        setEmail("");
        onDismiss();
      })
      .catch((error) => {
        if (error.code === "auth/invalid-email") {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Invalid email, please enter a valid email address",
          });
          return;
        }

        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occurred, please try again later",
        });
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Forgot Password</Title>

      <Paragraph style={styles.subtitle}>
        Enter your email address below to receive a password reset link.
      </Paragraph>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        style={styles.input}
        disabled={isLoading}
      />

      <Button
        mode="contained"
        onPress={() => dismissKeyboard(handleResetPassword)}
        style={styles.button}
        disabled={isLoading}
      >
        Reset Password
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

export default ForgotPasswordDialog;
