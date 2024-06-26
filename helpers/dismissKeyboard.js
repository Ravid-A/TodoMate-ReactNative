import { Keyboard, Platform } from "react-native";

const dismissKeyboard = (func) => {
  Keyboard.dismiss();

  setTimeout(
    () => {
      func();
    },
    Platform.OS === "ios" ? 500 : 0
  );
};

export default dismissKeyboard;
