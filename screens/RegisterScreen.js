import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { TextInput as PaperTextInput, Button } from "react-native-paper";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";

import dismissKeyboard from "../helpers/dismissKeyboard";

import AppHeader from "../components/AppHeader";

const RegisterScreen = ({ navigation }) => {
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(() => {
    // Check if user is not authenticated
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    user
      .reload()
      .then(() => {
        navigation.replace("Main");
      })
      .catch(() => {
        return;
      });
  });

  const handleRegisterPress = () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password should be at least 6 characters",
      });
      return;
    }

    if (!password.match(".*[a-zA-Z].*") || !password.match(".*[0-9].*")) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password should contain at least one letter and one number",
      });
      return;
    }

    if (password.includes(" ")) {
      Toast.makeText(
        this,
        "Password should not contain spaces",
        Toast.LENGTH_SHORT
      ).show();
      return;
    }

    if (!password.match(".*[A-Z].*")) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password should contain at least one uppercase letter",
      });
      return;
    }

    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Account created successfully",
        });
        navigation.replace("Main");
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Email address is already in use",
          });
          return;
        }

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
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLoginPress = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <AppHeader showActions={false} />

      <View style={styles.content}>
        <PaperTextInput
          label="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
          onSubmitEditing={() => dismissKeyboard(handleRegisterPress)}
          disabled={isLoading}
        />
        <PaperTextInput
          label="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          onSubmitEditing={() => dismissKeyboard(handleRegisterPress)}
          disabled={isLoading}
        />
        <PaperTextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          onSubmitEditing={() => dismissKeyboard(handleRegisterPress)}
          disabled={isLoading}
        />

        <Button
          mode="contained"
          onPress={() => dismissKeyboard(handleRegisterPress)}
          style={styles.button}
          disabled={isLoading}
        >
          Register
        </Button>
        <TouchableOpacity onPress={handleLoginPress} disabled={isLoading}>
          <Text style={styles.register}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 40,
  },
  register: {
    textAlign: "right",
    color: "#6200ee",
    textAlign: "center",
    marginTop: 24,
  },
});

export default RegisterScreen;
