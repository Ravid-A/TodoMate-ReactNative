import { useState } from "react";
import { Appbar } from "react-native-paper";
import { StyleSheet, Platform } from "react-native";
import { getAuth } from "firebase/auth";
import { set } from "firebase/database";

const AppHeader = ({ navigation, showActions = true, onProfilePress }) => {
  const styles = CreateStyleSheet(showActions);
  const auth = getAuth();

  const [isLoading, setIsLoading] = useState(false);

  const handleSignOutPress = () => {
    setIsLoading(true);
    auth
      .signOut()
      .then(() => {
        // clear the navigation stack
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Appbar.Header style={styles.header}>
      <Appbar.Content
        title="TodoMate"
        style={styles.title}
        titleStyle={styles.titleText}
      />
      {showActions && (
        <>
          <Appbar.Action
            icon="account"
            onPress={onProfilePress}
            disabled={isLoading}
          />
          <Appbar.Action
            icon="logout"
            onPress={handleSignOutPress}
            disabled={isLoading}
          />
        </>
      )}
    </Appbar.Header>
  );
};

const CreateStyleSheet = (showActions) => {
  const styles = StyleSheet.create({
    header: {
      justifyContent: "center",
    },
    title: {
      alignItems: "center",
      flex: 1,
      right: !showActions
        ? Platform.OS === "ios"
          ? 0
          : 7.5
        : Platform.OS === "ios"
        ? -25
        : -45,
    },
    titleText: {
      fontWeight: "bold",
    },
  });

  return styles;
};

export default AppHeader;
