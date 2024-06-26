import { FlatList } from "react-native";

import TodoItem from "../components/todo_item";

const Todos = () => {
  const arr = [1, 2, 3, 4, 5];

  return (
    <FlatList
      data={arr}
      renderItem={({ item }) => <TodoItem item={item} />}
      keyExtractor={(item) => item.toString()}
    />
  );
};

export default Todos;
