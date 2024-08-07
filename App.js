import { useState } from "react";
import { TouchableWithoutFeedback, Keyboard, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";

import Toast from "react-native-toast-message";

import NetInfo from "@react-native-community/netinfo";

// inialize firebase
import "./helpers/firebase";

import NoInternet from "./components/NoInternet";

import MainScreen from "./screens/MainScreen";
import LoginScreen from "./screens/UserScreens/LoginScreen";
import RegisterScreen from "./screens/UserScreens/RegisterScreen";
import ProfileScreen from "./screens/UserScreens/ProfileScreen";
import AddTaskScreen from "./screens/TasksScreens/AddTaskScreen";
import EditTaskScreen from "./screens/TasksScreens/EditTaskScreen";
import TaskDetailsScreen from "./screens/TasksScreens/TaskDetailsScreen";
import InviteScreen from "./screens/TasksScreens/InviteScreen";
import RemoveScreen from "./screens/TasksScreens/RemoveScreen";

import toastConfig from "./helpers/toastConfig";

const Stack = createStackNavigator();

const App = () => {
  const [isConnected, setIsConnected] = useState(false);

  // Check if device have internet connection
  NetInfo.addEventListener((state) => {
    if (state.isConnected != isConnected) {
      setIsConnected(state.isConnected);
    }
  });

  if (!isConnected) {
    return <NoInternet />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <PaperProvider>
            <SafeAreaProvider>
              <Stack.Navigator
                initialRouteName="Main"
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="AddTask" component={AddTaskScreen} />
                <Stack.Screen
                  name="TaskDetails"
                  component={TaskDetailsScreen}
                />
                <Stack.Screen name="EditTask" component={EditTaskScreen} />
                <Stack.Screen name="Invite" component={InviteScreen} />
                <Stack.Screen name="Remove" component={RemoveScreen} />
              </Stack.Navigator>
            </SafeAreaProvider>
          </PaperProvider>
        </NavigationContainer>
        <Toast config={toastConfig} position="bottom" visibilityTime={2000} />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default App;
