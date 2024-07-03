import { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text, Portal, Modal } from "react-native-paper";
import { getAuth, deleteUser } from "firebase/auth";
import {
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  getFirestore,
  collection,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../components/AppHeader";
import ChangePasswordDialog from "../components/ChangePasswordDialog";
import ChangeUsernameDialog from "../components/ChangeUsernameDialog";
import Loading from "../components/Loading";

import Toast from "react-native-toast-message";

const ProfileScreen = ({ navigation }) => {
  const auth = getAuth();
  const db = getFirestore();

  const [visibleDialog, setVisibleDialog] = useState("none");
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  // Handle user state changes
  const onAuthStateChanged = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const fetchUserData = () => {
    if (!user) return;

    setInitializing(true);
    getDoc(doc(db, "users", user.uid))
      .then((doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      })
      .catch((error) => {
        console.log("Error getting user:", error);
      })
      .finally(() => {
        setInitializing(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (!initializing) {
        if (!user) {
          navigation.replace("Login");
        } else {
          // Fetch tasks
          user
            .reload()
            .then(() => {
              if (!user.email) {
                navigation.replace("Login");
              }
            })
            .catch((error) => {
              console.log("Error reloading user");
              console.log(error);
              navigation.replace("Login");
            });
        }
      }
    }, [user, initializing, navigation])
  );

  if (initializing)
    return <Loading addGoBack={true} style={styles.container} />;

  const dismissDialog = () => {
    setVisibleDialog("none");
    fetchUserData();
  };

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
    const uid = auth.currentUser.uid;

    deleteUser(auth.currentUser)
      .then(() => {
        // Delete user tasks
        getDocs(collection(db, "tasks")).then((querySnapshot) => {
          querySnapshot.forEach((document) => {
            if (document.data().user === uid) {
              deleteDoc(doc(db, "tasks", document.id));
            }
          });
        });

        // Delete user document
        deleteDoc(doc(db, "users", uid));

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
        console.log(error);
      });
  };

  return (
    <>
      <AppHeader navigation={navigation} addGoBack={true} />
      <View style={styles.mainContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.subtitle_prop}>Username:</Text>{" "}
            {userData && userData.username}
          </Text>
          <Text style={styles.subtitle}>
            <Text style={styles.subtitle_prop}>Email:</Text>{" "}
            {user && user.email}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={() => setVisibleDialog("changeUsername")}
          style={styles.button}
        >
          Change Username
        </Button>

        <Button
          mode="contained"
          onPress={handleDeleteAccount}
          style={styles.button}
        >
          Delete Account
        </Button>

        <Button
          mode="contained"
          onPress={() => setVisibleDialog("changePassword")}
          style={styles.button}
        >
          Change Password
        </Button>
      </View>

      <Portal>
        <Modal
          visible={visibleDialog === "changePassword"}
          onDismiss={dismissDialog}
          contentContainerStyle={styles.modalContainer}
        >
          <ChangePasswordDialog onDismiss={dismissDialog} />
        </Modal>

        <Modal
          visible={visibleDialog === "changeUsername"}
          onDismiss={dismissDialog}
          contentContainerStyle={styles.modalContainer}
        >
          <ChangeUsernameDialog onDismiss={dismissDialog} />
        </Modal>
      </Portal>
    </>
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
    fontSize: 36,
    marginBottom: 8,
    textDecorationLine: "underline",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  subtitle_prop: {
    fontWeight: "bold",
    textDecorationLine: "underline",
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
