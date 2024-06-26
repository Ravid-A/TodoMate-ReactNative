import { TouchableWithoutFeedback, Keyboard, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";

import Toast from "react-native-toast-message";

// inialize firebase
import "./helpers/firebase";

import MainScreen from "./screens/MainScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ProfileScreen from "./screens/ProfileScreen";
//import AddTaskScreen from "./screens/AddTaskScreen";

import toastConfig from "./helpers/toastConfig";

const Stack = createStackNavigator();

function App() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <PaperProvider>
            <SafeAreaProvider>
              <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="Main" component={MainScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                {/* <Stack.Screen name="AddTask" component={AddTaskScreen} /> */}
              </Stack.Navigator>
            </SafeAreaProvider>
          </PaperProvider>
        </NavigationContainer>
        <Toast
          config={toastConfig}
          style={{ zIndex: 100000000 }}
          position="bottom"
          visibilityTime={2000}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default App;
