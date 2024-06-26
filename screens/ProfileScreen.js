import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text, Portal, Modal } from "react-native-paper";
import { getAuth, deleteUser } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../components/AppHeader";
import ChangePasswordDialog from "../components/ChangePasswordDialog";

import Toast from "react-native-toast-message";

const ProfileScreen = ({ navigation }) => {
  const auth = getAuth();

  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);

  useFocusEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log("User is not authenticated");
        navigation.replace("Login");
      } else {
        user
          .reload()
          .then(() => {
            if (!user.email) {
              navigation.replace("Login");
            }
          })
          .catch(() => {
            navigation.replace("Login");
          });
      }
    });
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: deleteAccount,
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const deleteAccount = () => {
    deleteUser(auth.currentUser)
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Account deleted successfully",
        });

        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      })
      .catch((error) => {
        if (error.code === "auth/requires-recent-login") {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please reauthenticate before deleting your account",
          });
          return;
        }

        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occurred while deleting your account",
        });
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} />
      <View style={styles.mainContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Connected as:</Text>
          <Text style={styles.subtitle}>{auth.currentUser.email}</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleDeleteAccount}
          style={styles.button}
        >
          Delete Account
        </Button>

        <Button
          mode="contained"
          onPress={() => setIsChangePasswordVisible(true)}
          style={styles.button}
        >
          Change Password
        </Button>
      </View>

      <Portal>
        <Modal
          visible={isChangePasswordVisible}
          onDismiss={() => setIsChangePasswordVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ChangePasswordDialog
            onDismiss={() => setIsChangePasswordVisible(false)}
          />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Match your app's theme
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 32,
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    width: "100%",
  },
  modalContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 5,
  },
});

export default ProfileScreen;
