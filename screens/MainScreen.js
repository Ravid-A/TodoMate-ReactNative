import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { FAB } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";

const MainScreen = () => {
  const [tasks, setTasks] = useState([]);

  const renderTask = ({ item }) => {
    // Implement your task item component here
    return <View style={styles.taskItem} />;
  };

  const handleProfilePress = () => {
    // Handle profile action
    console.log("Profile pressed");
  };

  const handleSignOutPress = () => {
    // Handle sign out action
    console.log("Sign out pressed");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <AppHeader
          onProfilePress={handleProfilePress}
          onSignOutPress={handleSignOutPress}
        />

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
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tasksList: {
    flex: 1,
  },
  taskItem: {
    // Style your task item here
  },
  fabRefresh: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 80,
  },
  fabAddTask: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default MainScreen;
