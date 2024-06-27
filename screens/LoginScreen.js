import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  TextInput as PaperTextInput,
  Button,
  Text,
  Modal,
  Portal,
} from "react-native-paper";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";

import dismissKeyboard from "../helpers/dismissKeyboard";

import AppHeader from "../components/AppHeader";
import ForgotPasswordDialog from "../components/ForgotPasswordDialog";

const LoginScreen = ({ navigation }) => {
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(() => {
    // Check if user is authenticated
    // auth.onAuthStateChanged((user) => {
    //   if (user) {
    //     setIsLoading(true);
    //     user
    //       .reload()
    //       .then(() => {
    //         if (user.email) {
    //           navigation.replace("Main");
    //         }
    //       })
    //       .catch((error) => {
    //         auth.signOut();
    //         console.error(error);
    //       })
    //       .finally(() => {
    //         setIsLoading(false);
    //       });
    //   }
    // });
  });

  const handleLoginPress = () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.replace("Main");
      })
      .catch((error) => {
        if (error.code === "auth/invalid-credential") {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Invalid credentials, please check your email and password",
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

  const handleRegisterPress = () => {
    navigation.replace("Register");
  };

  const handleForgotPasswordPress = () => {
    setIsForgotPasswordVisible(true);
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
          onSubmitEditing={() => dismissKeyboard(handleLoginPress)}
          disabled={isLoading}
        />
        <PaperTextInput
          label="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          onSubmitEditing={() => dismissKeyboard(handleLoginPress)}
          disabled={isLoading}
        />

        <TouchableOpacity
          onPress={handleForgotPasswordPress}
          disabled={isLoading}
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={() => dismissKeyboard(handleLoginPress)}
          style={styles.button}
          loading={isLoading}
        >
          Login
        </Button>
        <TouchableOpacity onPress={handleRegisterPress} disabled={isLoading}>
          <Text style={styles.register}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>

      <Portal>
        <Modal
          visible={isForgotPasswordVisible}
          onDismiss={() => setIsForgotPasswordVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ForgotPasswordDialog
            onDismiss={() => setIsForgotPasswordVisible(false)}
          />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  forgotPassword: {
    textAlign: "center",
    color: "#6200ee",
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
  register: {
    textAlign: "center",
    color: "#6200ee",
    marginTop: 24,
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 5,
  },
});

export default LoginScreen;
