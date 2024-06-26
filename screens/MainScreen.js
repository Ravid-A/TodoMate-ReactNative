import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, FlatList } from "react-native";
import { FAB } from "react-native-paper";
import { getAuth } from "firebase/auth";

import AppHeader from "../components/AppHeader";

const MainScreen = ({ navigation }) => {
  const auth = getAuth();

  const [tasks, setTasks] = useState([]);

  useFocusEffect(() => {
    // Fetch tasks

    // Check if user is authenticated
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
          .catch((error) => {
            navigation.replace("Login");
          });
      }
    });
  });

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
          /* Handle add task */
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
    right: 0,
    bottom: 100,
  },
  fabAddTask: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 25,
  },
});

export default MainScreen;
