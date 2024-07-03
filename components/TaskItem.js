import { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Card, ProgressBar } from "react-native-paper";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const TaskItem = ({ title, dueDate, tasks, user }) => {
  const auth = getAuth();
  const db = getFirestore();

  const [owner, setOwner] = useState(null);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const completionRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;

  const currentDate = new Date();

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    getDoc(doc(db, "users", user))
      .then((doc) => {
        if (doc.exists()) {
          setOwner(doc.data());
        }
      })
      .catch((error) => {
        console.log("Error getting user:", error);
      });
  }, [user]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>
          {title}
          {dueDate < currentDate.getTime() && (
            <Text style={{ color: "red", marginLeft: 8 }}> (Overdue)</Text>
          )}
        </Text>
        {user != auth.currentUser?.uid && owner && (
          <Text style={styles.dueDate}>{owner.username}'s task</Text>
        )}
        <Text style={styles.dueDate}>Due: {formatDate(dueDate)}</Text>
        <Text style={styles.progressText}>
          {completedTasks}/{totalTasks} completed
        </Text>
        <ProgressBar progress={completionRatio} style={styles.progressBar} />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    marginRight: 8,
    height: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
});

export default TaskItem;
