import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";

import dismissKeyboard from "../helpers/dismissKeyboard";

import AppHeader from "../components/AppHeader";
import Loading from "../components/Loading";

const RegisterScreen = ({ navigation }) => {
  const auth = getAuth();
  const db = getFirestore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const isUsernameValid = (username) => {
    return (
      username.length >= 3 &&
      username.length <= 20 &&
      /^[a-zA-Z0-9_]+$/.test(username) &&
      !username.includes(" ")
    );
  };

  // Handle user state changes
  const onAuthStateChanged = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!initializing) {
        if (user) {
          user
            .reload()
            .then(() => {
              if (user.email && !isLoading) {
                navigation.replace("Main");
              }
            })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    }, [user, initializing, navigation])
  );

  if (initializing)
    return <Loading addGoBack={true} style={styles.container} />;

  const handleRegisterPress = () => {
    if (!username || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    if (!isUsernameValid(username)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Username cannot contain spaces",
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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password should not contain spaces",
      });
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
      .then((userCredentials) => {
        const user = userCredentials.user;

        setDoc(doc(db, "users", user.uid), {
          email: user.email,
          username,
        });

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
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleLoginPress = () => {
    navigation.replace("Login");
  };

  return (
    <>
      <AppHeader showActions={false} />

      <View style={styles.content}>
        <TextInput
          label="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
          style={styles.input}
          mode="outlined"
          onSubmitEditing={() => dismissKeyboard(handleRegisterPress)}
          disabled={isLoading}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
          onSubmitEditing={() => dismissKeyboard(handleRegisterPress)}
          disabled={isLoading}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          style={styles.input}
          mode="outlined"
          onSubmitEditing={() => dismissKeyboard(handleRegisterPress)}
          disabled={isLoading}
        />
        <TextInput
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
    </>
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
    textAlign: "center",
    color: "#6200ee",
    marginTop: 24,
  },
});

export default RegisterScreen;
