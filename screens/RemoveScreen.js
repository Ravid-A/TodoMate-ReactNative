import React, { useState, useEffect } from "react";
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
  doc,
  where,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

import AppHeader from "../components/AppHeader";
import dismissKeyboard from "../helpers/dismissKeyboard";

const RemoveScreen = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const fetchInvitedUsers = async (queryText) => {
    setIsLoading(true);
    const tasksUsersRef = collection(db, "tasks_users");
    const usersRef = collection(db, "users");
    const tasksUsersQuery = query(tasksUsersRef, where("task", "==", taskId));

    try {
      const tasksUsersSnapshot = await getDocs(tasksUsersQuery);
      const invitedUserIds = tasksUsersSnapshot.docs.map(
        (doc) => doc.data().user
      );

      if (invitedUserIds.length === 0) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      const users = [];
      for (const userId of invitedUserIds) {
        const userDoc = await getDoc(doc(usersRef, userId));
        if (userDoc.exists()) {
          users.push({ id: userDoc.id, ...userDoc.data() });
        }
      }

      if (queryText) {
        const filteredUsers = users.filter((user) =>
          user.email.toLowerCase().includes(queryText.toLowerCase())
        );
        setSearchResults(filteredUsers);
      } else {
        setSearchResults(users);
      }
    } catch (error) {
      console.error("Error fetching invited users:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch invited users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitedUsers("");
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    fetchInvitedUsers(text);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemove = async () => {
    if (selectedUser) {
      try {
        const tasksUsersRef = collection(db, "tasks_users");
        const tasksUsersQuery = query(
          tasksUsersRef,
          where("task", "==", taskId),
          where("user", "==", selectedUser.id)
        );
        const tasksUsersSnapshot = await getDocs(tasksUsersQuery);
        tasksUsersSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Removed ${selectedUser.email} from the task`,
        });

        setSelectedUser(null);
        fetchInvitedUsers("");

        navigation.goBack();
      } catch (error) {
        console.error("Error removing user:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to remove user",
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

  return (
    <>
      <AppHeader
        title="Remove User"
        navigation={navigation}
        showActions={false}
        addGoBack={true}
      />
      <View style={styles.content}>
        <Paragraph style={styles.subtitle}>
          Search for a user to remove from this task.
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
          onPress={handleRemove}
          style={styles.button}
          disabled={!selectedUser}
        >
          Remove
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
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

export default RemoveScreen;
