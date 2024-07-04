import { useState } from "react";
import { Appbar } from "react-native-paper";
import { StyleSheet, Platform } from "react-native";
import { getAuth } from "firebase/auth";

const AppHeader = ({
  navigation,
  showActions = true,
  addGoBack = false,
  onProfilePress,
}) => {
  const styles = CreateStyleSheet(showActions, addGoBack);
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
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  return (
    <Appbar.Header style={styles.header}>
      {addGoBack && (
        <Appbar.BackAction onPress={handleGoBack} disabled={isLoading} />
      )}
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
            disabled={isLoading || !onProfilePress}
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

const CreateStyleSheet = (showActions, addGoBack) => {
  const calculateRight = () => {
    if (addGoBack) {
      if (showActions) {
        return -25;
      } else {
        return Platform.OS === "ios" ? 0 : 25;
      }
    }

    if (!showActions) {
      return Platform.OS === "ios" ? 0 : 7.5;
    }

    return Platform.OS === "ios" ? -25 : -45;
  };

  const styles = StyleSheet.create({
    header: {
      justifyContent: "center",
    },
    title: {
      alignItems: "center",
      flex: 1,
      right: calculateRight(),
    },
    titleText: {
      fontWeight: "bold",
    },
  });

  return styles;
};

export default AppHeader;
