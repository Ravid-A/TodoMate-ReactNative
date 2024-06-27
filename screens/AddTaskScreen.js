import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Appbar } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const AddTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setDueDate(date.toDateString());
    hideDatePicker();
  };

  const handleSave = () => {
    // Implement save functionality
    console.log("Saving task:", { title, description, dueDate });
    navigation.goBack();
  };

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Task" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <TextInput
          label="Task Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Task Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={10}
          style={styles.input}
        />

        <TextInput
          label="Due Date"
          value={dueDate}
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
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={tomorrow}
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
});

export default AddTaskScreen;
