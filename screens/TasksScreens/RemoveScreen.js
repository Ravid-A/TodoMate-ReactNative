import { useState, useEffect, useCallback } from "react";
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
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../../components/AppHeader";
import dismissKeyboard from "../../helpers/dismissKeyboard";
import Loading from "../../components/Loading";

const RemoveScreen = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const db = getFirestore();
  const auth = getAuth();

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
    fetchInvitedUsers("");
  }, []);

  const fetchInvitedUsers = async (queryText) => {
    setIsLoading(true);
    const tasksUsersRef = collection(db, "tasks_users");
    const usersRef = collection(db, "users");
    const tasksUsersQuery = query(tasksUsersRef, where("task", "==", taskId));

    try {
      const tasksUsersSnapshot = await getDocs(tasksUsersQuery);
      const userIds = tasksUsersSnapshot.docs.map((doc) => doc.data().user);

      // Fetch user data for each invited user
      const usersPromises = userIds.map(async (userId) => {
        const userDoc = await getDoc(doc(usersRef, userId));
        return { id: userDoc.id, ...userDoc.data() };
      });

      const users = await Promise.all(usersPromises);

      // Filter users based on query text
      const filteredUsers = users.filter(
        (user) =>
          user.email.toLowerCase().includes(queryText.toLowerCase()) ||
          user.username.toLowerCase().includes(queryText.toLowerCase())
      );

      setSearchResults(filteredUsers);
    } catch (error) {
      console.log("Error fetching invited users:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch invited users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    fetchInvitedUsers(text);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
  };

  const handleDiselectUser = () => {
    setSelectedUser(null);
    handleSearch("");
  };

  const handleRemove = async () => {
    if (selectedUser) {
      try {
        // Find the task user document to delete
        const tasksUsersRef = collection(db, "tasks_users");
        const q = query(
          tasksUsersRef,
          where("task", "==", taskId),
          where("user", "==", selectedUser.id)
        );
        const querySnapshot = await getDocs(q);

        // Delete the task user document
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });

        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Removed ${selectedUser.email} from the task`,
        });
        setSelectedUser(null);
        fetchInvitedUsers(searchQuery);
      } catch (error) {
        console.log("Error removing user from task:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to remove user from task",
        });
      }
    }
  };

  const renderUserItem = ({ item }) => (
    <List.Item
      key={item.id}
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
              onPress={handleDiselectUser}
              style={styles.clearSelection}
            />
          </View>
        ) : isLoading ? (
          <Paragraph>Fetching...</Paragraph>
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
