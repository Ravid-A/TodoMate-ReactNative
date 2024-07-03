import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList, Text } from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";

import AppHeader from "../../components/AppHeader";

const AddTaskScreen = ({ navigation }) => {
  const db = getFirestore();
  const auth = getAuth();

  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 0, text: "", completed: false, completedBy: "" },
  ]);
  const [nextId, setNextId] = useState(1);
  const [loading, setLoading] = useState(false);
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

  if (initializing) return null;

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setDueDate(date);
    hideDatePicker();
  };

  const handleSave = () => {
    if (!title) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a title",
      });
      return;
    }
    if (tasks.some((task) => !task.text)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all tasks",
      });
      return;
    }
    if (!dueDate) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a due date",
      });
      return;
    }

    setLoading(true);
    addDoc(collection(db, "tasks"), {
      user: auth.currentUser.uid,
      title,
      tasks,
      dueDate: dueDate.getTime(),
    })
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Task saved successfully",
        });

        navigation.goBack();
      })
      .catch((error) => {
        console.log("Error adding document: ", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occurred while saving the task",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const removeTask = (id) => {
    setTasks((tasks) => {
      tasks = tasks.filter((task) => task.id !== id);

      tasks = tasks.map((task, index) => {
        task.id = index;
        return task;
      });

      setNextId(tasks.length);
      return tasks;
    });
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.taskContainer} key={item.id}>
        <TextInput
          disabled={loading}
          label="Task"
          value={item.text}
          onChangeText={(text) =>
            setTasks(
              tasks.map((task) =>
                task.id === item.id ? { ...task, text } : task
              )
            )
          }
          mode="outlined"
          style={styles.taskInput}
        />
        <IconButton
          disabled={loading || tasks.length === 1}
          icon="close"
          size={20}
          onPress={() => removeTask(item.id)}
          style={styles.removeButton}
        />
      </View>
    );
  };

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Max date is 1 year from now
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  maxDate.setHours(0, 0, 0, 0);

  return (
    <>
      <AppHeader navigation={navigation} showActions={false} addGoBack={true} />

      <View style={styles.content}>
        <TextInput
          disabled={loading}
          label="Task Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <Text>Tasks</Text>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          style={styles.tasksList}
          renderItem={renderItem}
        />

        <Button
          disabled={loading}
          mode="contained"
          onPress={() => {
            setTasks([
              ...tasks,
              { id: nextId, text: "", completed: false, completedBy: "" },
            ]);
            setNextId(nextId + 1);
          }}
          style={styles.button}
        >
          Add a new task
        </Button>
        <TextInput
          label="Due Date"
          value={dueDate?.toDateString()}
          mode="outlined"
          editable={false}
          style={styles.input}
        />
        <Button
          disabled={loading}
          mode="contained"
          onPress={showDatePicker}
          style={styles.button}
        >
          Select Due Date
        </Button>
        <Button
          disabled={loading}
          mode="contained"
          onPress={handleSave}
          style={styles.button}
        >
          Save Task
        </Button>
        <DateTimePickerModal
          disabled={loading}
          isVisible={isDatePickerVisible}
          date={dueDate ? dueDate : tomorrow}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={tomorrow}
          maximumDate={maxDate}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  },
  tasksList: {
    maxHeight: 200,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  taskInput: {
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    marginLeft: 8,
  },
});

export default AddTaskScreen;
