import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { FAB } from "react-native-paper";
import { getAuth } from "firebase/auth";
import { getFirestore, getDocs, collection } from "firebase/firestore";

import AppHeader from "../components/AppHeader";
import TaskItem from "../components/TaskItem";
import Loading from "../components/Loading";

const MainScreen = ({ navigation }) => {
  const auth = getAuth();
  const db = getFirestore();

  const [tasks, setTasks] = useState([]);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);

  const currentDate = new Date();

  const fetchTasks = () => {
    const getCompleteRatio = (tasks) => {
      const completedTasks = tasks.filter((task) => task.completed).length;
      const totalTasks = tasks.length;
      return totalTasks > 0 ? completedTasks / totalTasks : 0;
    };

    const isOverdue = (dueDate) => {
      return dueDate < currentDate.getTime();
    };

    if (!user || !auth.currentUser) {
      return;
    }

    setLoading(true);
    getDocs(collection(db, "tasks"))
      .then((querySnapshot) => {
        const tasks = [];
        const not_user_tasks = [];
        querySnapshot.forEach((doc) => {
          const taskData = doc.data();

          if (taskData.user != user.uid) {
            not_user_tasks.push({ id: doc.id, ...taskData });
            return;
          }

          tasks.push({ id: doc.id, ...taskData });
        });

        getDocs(collection(db, "tasks_users")).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const taskUser = doc.data();

            const task = not_user_tasks.find(
              (task) => task.id === taskUser.task && taskUser.user === user.uid
            );

            if (task) {
              tasks.push({ id: task.id, ...task });
            }
          });

          tasks.sort((a, b) => {
            return getCompleteRatio(a.tasks) - getCompleteRatio(b.tasks);
          });

          tasks.sort((a, b) => {
            if (isOverdue(a.dueDate) && !isOverdue(b.dueDate)) {
              return 1;
            }
            if (isOverdue(b.dueDate) && !isOverdue(a.dueDate)) {
              return -1;
            }
            return 0;
          });

          setTasks(tasks);
        });
      })
      .catch((error) => {
        console.log("Error fetching tasks: ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
      fetchTasks();

      if (!initializing) {
        if (!user) {
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
              console.log(error);
              navigation.replace("Login");
            });
        }
      }
    }, [user, initializing, navigation])
  );

  if (initializing)
    return <Loading showActions={true} style={styles.container} />;

  const renderTask = ({ item }) => {
    // Implement your task item component here
    return (
      <TouchableOpacity
        disabled={loading}
        onPress={() => {
          navigation.navigate("TaskDetails", { taskId: item.id });
        }}
      >
        <TaskItem {...item} />
      </TouchableOpacity>
    );
  };

  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  return (
    <>
      <AppHeader navigation={navigation} onProfilePress={handleProfilePress} />

      <FlatList data={tasks} renderItem={renderTask} style={styles.tasksList} />

      <FAB
        disabled={loading}
        style={styles.fabRefresh}
        icon="refresh"
        onPress={() => {
          fetchTasks();
        }}
      />

      <FAB
        disabled={loading}
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
  container: {
    flex: 1,
    padding: 16,
  },
  tasksList: {
    flex: 1,
    marginTop: 16,
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
