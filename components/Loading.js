import AppHeader from "./AppHeader";
import { View } from "react-native";

const Loading = ({ style, addGoBack = false, showActions = true }) => {
  return (
    <>
      <AppHeader showActions={showActions} addGoBack={addGoBack} />
      <View style={style} />
    </>
  );
};

export default Loading;
