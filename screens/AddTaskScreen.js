import React, { useState } from "react";
import { View, StyleSheet, ScrollView, FlatList, Text } from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";

import AppHeader from "../components/AppHeader";

const AddTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [tasks, setTasks] = useState([{ id: 0, text: "", completed: false }]);
  const [nextId, setNextId] = useState(1);

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
    // Implement save functionality
    // dueDate as a unix timestamp
    console.log("Saving task:", { title, tasks, dueDate: dueDate.getTime() });
    return;

    navigation.goBack();
  };

  const removeTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));

    if (!tasks.length) {
      setTasks([{ id: 0, text: "", completed: false }]);
      setNextId(1);
      return;
    }

    setTasks((tasks) => {
      tasks = tasks.map((task, index) => {
        task.id = index;
        return task;
      });

      setNextId(tasks.length);
      return tasks;
    });
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
    <View style={styles.container}>
      <AppHeader
        navigation={navigation}
        showActions={false}
        addGoBack={true}
        hasPreviousScreen={true}
      />
      <ScrollView style={styles.content}>
        <TextInput
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
          renderItem={({ item }) => (
            <View style={styles.taskContainer}>
              <TextInput
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
                icon="close"
                size={20}
                onPress={() => removeTask(item.id)}
                style={styles.removeButton}
              />
            </View>
          )}
        />
        <Button
          mode="contained"
          onPress={() => {
            setTasks([...tasks, { id: nextId, text: "", completed: false }]);
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
        <Button mode="contained" onPress={showDatePicker} style={styles.button}>
          Select Due Date
        </Button>
        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Save Task
        </Button>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          date={dueDate ? dueDate : tomorrow}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={tomorrow}
          maximumDate={maxDate}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
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
