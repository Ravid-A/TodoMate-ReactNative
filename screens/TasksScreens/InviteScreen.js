import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import {
  TextInput,
  Button,
  Paragraph,
  List,
  IconButton,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../../components/AppHeader";
import dismissKeyboard from "../../helpers/dismissKeyboard";
import Loading from "../../components/Loading";

const InviteScreen = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Handle user state changes
  const onAuthStateChanged = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // Redirect to login if not initialized or user is not authenticated
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

  useEffect(() => {
    handleSearch("");
  }, []);

  const handleSearch = async (text) => {
    setSearchQuery(text);

    setIsLoading(true);
    const usersRef = collection(db, "users");
    const tasksUsersRef = collection(db, "tasks_users");

    try {
      // Query users based on search text
      const q = query(
        usersRef,
        where("email", ">=", text.toLowerCase()),
        where("email", "<=", text.toLowerCase() + "\uf8ff"),
        where("username", ">=", text.toLowerCase()),
        where("username", "<=", text.toLowerCase() + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);

      // Get list of invited user IDs for the task
      const tasksUsersQuery = query(tasksUsersRef, where("task", "==", taskId));
      const tasksUsersSnapshot = await getDocs(tasksUsersQuery);
      const invitedUserIds = tasksUsersSnapshot.docs.map(
        (doc) => doc.data().user
      );

      // Filter out users who are already invited
      const users = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (user) =>
            !invitedUserIds.includes(user.id) && user.id !== currentUser.uid
        );

      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to search users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleInvite = async () => {
    if (selectedUser) {
      try {
        await addDoc(collection(db, "tasks_users"), {
          task: taskId,
          user: selectedUser.id,
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Invited ${selectedUser.email} to the task`,
        });
        navigation.goBack();
      } catch (error) {
        console.error("Error inviting user:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to invite user",
        });
      }
    }
  };

  const renderUserItem = ({ item }) => (
    <List.Item
      title={item.username || item.email}
      description={item.email}
      onPress={() => handleSelectUser(item)}
      left={(props) => <List.Icon {...props} icon="account" />}
    />
  );

  if (initializing)
    return (
      <Loading showActions={false} addGoBack={true} style={styles.content} />
    );

  return (
    <>
      <AppHeader
        title="Invite User"
        navigation={navigation}
        showActions={false}
        addGoBack={true}
      />
      <View style={styles.content}>
        <Paragraph style={styles.subtitle}>
          Search for a user to invite to this task.
        </Paragraph>

        <TextInput
          label="Search by email or username"
          value={searchQuery}
          onChangeText={handleSearch}
          mode="outlined"
          style={styles.input}
          onSubmitEditing={dismissKeyboard}
          left={<TextInput.Icon icon="magnify" />}
          disabled={!!selectedUser}
        />

        {selectedUser ? (
          <View style={styles.selectedUserContainer}>
            <Paragraph style={styles.data}>Selected User:</Paragraph>
            <Paragraph style={styles.selectedUserInfo}>
              <Text style={styles.data_title}>Username: </Text>
              {selectedUser.username}
            </Paragraph>
            <Paragraph style={styles.selectedUserInfo}>
              <Text style={styles.data_title}>Email: </Text>
              {selectedUser.email}
            </Paragraph>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setSelectedUser(null)}
              style={styles.clearSelection}
            />
          </View>
        ) : isLoading ? (
          <Paragraph>Searching...</Paragraph>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            style={styles.searchResults}
            ListEmptyComponent={() => (
              <Paragraph style={styles.emptyResult}>No users found</Paragraph>
            )}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleInvite}
          style={styles.button}
          disabled={!selectedUser}
        >
          Invite
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  searchResults: {
    flex: 1,
  },
  emptyResult: {
    textAlign: "center",
    marginTop: 20,
  },
  selectedUserContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  selectedUserInfo: {
    fontWeight: "bold",
    marginTop: 4,
    fontSize: 20,
  },
  clearSelection: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 25,
  },
  button: {
    width: "100%",
  },
  data: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    fontSize: 22,
  },
  data_title: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default InviteScreen;
