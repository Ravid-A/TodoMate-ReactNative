import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Title, Paragraph } from "react-native-paper";
import Toast from "react-native-toast-message";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";

import dismissKeyboard from "../../helpers/dismissKeyboard";

const ChangePasswordDialog = ({ onDismiss }) => {
  const auth = getAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill out all fields",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password should be at least 6 characters",
      });
      return;
    }

    if (!newPassword.match(".*[a-zA-Z].*") || !newPassword.match(".*[0-9].*")) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password should contain at least one letter and one number",
      });
      return;
    }

    if (newPassword.includes(" ")) {
      Toast.makeText(
        this,
        "Password should not contain spaces",
        Toast.LENGTH_SHORT
      ).show();
      return;
    }

    if (!newPassword.match(".*[A-Z].*")) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password should contain at least one uppercase letter",
      });
      return;
    }

    const user = auth.currentUser;
    if (user) {
      let credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      setIsLoading(true);
      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPassword)
            .then(() => {
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "Password changed successfully",
              });
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setIsLoading(false);
              onDismiss();
            })
            .catch((error) => {
              if (error.code === "auth/weak-password") {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Password should be at least 6 characters",
                });
                setIsLoading(false);
                return;
              }

              Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occurred, please try again later",
              });
              console.log(error);
              setIsLoading(false);
            });
        })
        .catch((error) => {
          if (error.code === "auth/invalid-credential") {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "The current password is incorrect",
            });
            setIsLoading(false);
            return;
          }

          Toast.show({
            type: "error",
            text1: "Error",
            text2: "An error occurred, please try again later",
          });
          console.log(error);
          setIsLoading(false);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Change Password</Title>

      <Paragraph style={styles.subtitle}>
        Enter your current and new password below.
      </Paragraph>

      <TextInput
        label="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        onSubmitEditing={() => dismissKeyboard(handleChangePassword)}
        disabled={isLoading}
      />

      <TextInput
        label="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        onSubmitEditing={() => dismissKeyboard(handleChangePassword)}
        disabled={isLoading}
      />

      <TextInput
        label="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
        onSubmitEditing={() => dismissKeyboard(handleChangePassword)}
        disabled={isLoading}
      />

      <Button
        mode="contained"
        onPress={() => dismissKeyboard(handleChangePassword)}
        style={styles.button}
        disabled={isLoading}
      >
        Change Password
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

export default ChangePasswordDialog;
