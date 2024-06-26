import { BaseToast, ErrorToast } from "react-native-toast-message";

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "green", marginBottom: 40 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 17,
        fontWeight: "400",
      }}
      text1NumberOfLines={1}
      text2Style={{
        fontSize: 15,
      }}
      text2NumberOfLines={2}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "red",
        marginBottom: 40,
      }}
      text1Style={{
        fontSize: 17,
      }}
      text1NumberOfLines={1}
      text2Style={{
        fontSize: 15,
      }}
      text2NumberOfLines={2}
    />
  ),
};

export default toastConfig;
