import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";

// inialize firebase
import "./helpers/firebase";

import MainScreen from "./screens/MainScreen";
//import LoginScreen from "./screens/LoginScreen";
//import ProfileScreen from "./screens/ProfileScreen";
//import AddTaskScreen from "./screens/AddTaskScreen";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <PaperProvider>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Main" component={MainScreen} />
          {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
          {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
          {/* <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="AddTask" component={AddTaskScreen} /> */}
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
}

export default App;
