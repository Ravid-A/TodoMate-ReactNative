import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Title, Text, ProgressBar, FAB } from "react-native-paper";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import AppHeader from "../components/AppHeader";
import Loading from "../components/Loading";

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const db = getFirestore();
  const auth = getAuth();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const onAuthStateChanged = (user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const taskDoc = await getDoc(doc(db, "tasks", taskId));
      if (taskDoc.exists()) {
        const taskData = { id: taskDoc.id, ...taskDoc.data() };
        setTask(taskData);

        const userIds = taskData.tasks
          .filter((subtask) => subtask.completedBy)
          .map((subtask) => subtask.completedBy);
        const uniqueUserIds = [...new Set(userIds)];
        const userPromises = uniqueUserIds.map((userId) =>
          getDoc(doc(db, "users", userId))
        );
        const userDocs = await Promise.all(userPromises);
        const userMap = {};
        userDocs.forEach((userDoc) => {
          if (userDoc.exists()) {
            userMap[userDoc.id] = userDoc.data().username || "Unknown User";
          }
        });
        setUsers(userMap);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Task not found",
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load task details",
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTaskDetails();

      if (!initializing && user) {
        user
          .reload()
          .then(() => {
            if (!user.email) {
              navigation.replace("Login");
            }
          })
          .catch((error) => {
            console.log(error);
            navigation.replace("Login");
          });
      } else if (!initializing && !user) {
        navigation.replace("Login");
      }
    }, [user, initializing, navigation])
  );

  const handleRefresh = () => {
    fetchTaskDetails();
    Toast.show({
      type: "info",
      text1: "Refreshing",
      text2: "Updating task details...",
    });
  };

  const isOverdue = (dueDate) => {
    const currentDate = new Date();
    return dueDate < currentDate.getTime();
  };

  const handleSubtaskToggle = async (subtaskId) => {
    if (!task) return;

    try {
      // Fetch the latest task data from Firestore
      const taskDoc = await getDoc(doc(db, "tasks", taskId));
      if (!taskDoc.exists()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Task not found",
        });
        return;
      }

      const currentTaskData = taskDoc.data();
      const subtask = currentTaskData.tasks.find((st) => st.id === subtaskId);

      if (subtask.completed) {
        Toast.show({
          type: "info",
          text1: "Already Completed",
          text2: "This subtask has already been completed.",
        });
        return;
      }

      const updatedSubtasks = currentTaskData.tasks.map((st) =>
        st.id === subtaskId
          ? {
              ...st,
              completed: true,
              completedBy: auth.currentUser.uid,
            }
          : st
      );

      await updateDoc(doc(db, "tasks", taskId), { tasks: updatedSubtasks });

      // Update local state
      setTask({ ...currentTaskData, tasks: updatedSubtasks });

      if (!users[auth.currentUser.uid]) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const username = userDoc.data().username || "Unknown User";
          setUsers((prevUsers) => ({
            ...prevUsers,
            [auth.currentUser.uid]: username,
          }));
        }
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Subtask marked as completed",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update subtask",
      });
    }
  };

  const calculateProgress = () => {
    if (!task || task.tasks.length === 0) return 0;
    const completedTasks = task.tasks.filter(
      (subtask) => subtask.completed
    ).length;
    return completedTasks / task.tasks.length;
  };

  if (initializing) return <Loading showActions={true} addGoBack={true} />;

  if (loading) {
    return <Loading addGoBack={true} showActions={true} />;
  }

  if (!task) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} showActions={true} addGoBack={true} />
      <ScrollView style={styles.scrollView}>
        <Title style={styles.title}>{task.title}</Title>
        <Text style={styles.dueDate}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </Text>
        <ProgressBar
          progress={calculateProgress()}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {task.tasks.filter((subtask) => subtask.completed).length} of{" "}
          {task.tasks.length} completed
        </Text>
        <View style={styles.subtasksContainer}>
          {task.tasks.map((subtask) => (
            <View key={subtask.id} style={styles.subtaskItem}>
              <TouchableOpacity
                onPress={() => handleSubtaskToggle(subtask.id)}
                disabled={subtask.completed || isOverdue(task.dueDate)}
              >
                <MaterialCommunityIcons
                  name={
                    subtask.completed
                      ? "checkbox-marked"
                      : "checkbox-blank-outline"
                  }
                  size={32}
                  color={
                    subtask.completed || isOverdue(task.dueDate)
                      ? "#999"
                      : "#007AFF"
                  }
                  style={styles.checkbox}
                />
              </TouchableOpacity>
              <View style={styles.subtaskTextContainer}>
                <Text style={styles.subtaskText}>{subtask.text}</Text>
                <Text style={styles.completedByText}>
                  {subtask.completed && subtask.completedBy
                    ? `Completed by ${
                        users[subtask.completedBy] || "Unknown User"
                      }`
                    : subtask.completed
                    ? "Completed"
                    : "Not completed"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <FAB
        disabled={loading}
        style={styles.fab}
        icon="refresh"
        onPress={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  subtasksContainer: {
    marginTop: 16,
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  subtaskTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  subtaskText: {
    fontSize: 16,
  },
  completedByText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 5,
    bottom: 10,
  },
  checkbox: {
    marginTop: 4,
    marginRight: 4,
  },
});

export default TaskDetailsScreen;
