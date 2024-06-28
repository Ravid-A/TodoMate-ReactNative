import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, FlatList } from "react-native";
import { FAB } from "react-native-paper";
import { getAuth } from "firebase/auth";

import AppHeader from "../components/AppHeader";

const MainScreen = ({ navigation }) => {
  const auth = getAuth();

  const [tasks, setTasks] = useState([]);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

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
              console.error(error);
              navigation.replace("Login");
            });
        }
      }
    }, [user, initializing, navigation])
  );

  if (initializing) return null;

  const renderTask = ({ item }) => {
    // Implement your task item component here
    return <View />;
  };

  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  return (
    <>
      <AppHeader navigation={navigation} onProfilePress={handleProfilePress} />

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.tasksList}
      />

      <FAB
        style={styles.fabRefresh}
        icon="refresh"
        onPress={() => {
          /* Handle refresh */
        }}
      />

      <FAB
        style={styles.fabAddTask}
        icon="plus"
        onPress={() => {
          navigation.navigate("AddTask");
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tasksList: {
    flex: 1,
  },
  fabRefresh: {
    position: "absolute",
    margin: 16,
    right: 5,
    bottom: 100,
  },
  fabAddTask: {
    position: "absolute",
    margin: 16,
    right: 5,
    bottom: 25,
  },
});

export default MainScreen;
