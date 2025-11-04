import Snackbar from "react-native-snackbar";

interface action {
  text: string;
  textColor: "green" | "red";
  onPress: () => void;
}
interface snackbar {
  message: string;
  isSuccess?: boolean;
  marginBottom: number;
  action?: action;
}
const SnackBarToast = ({
  message,
  isSuccess,
  action,
  marginBottom,
}: snackbar) => {
  if (action) {
    return Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: isSuccess
        ? "rgba(105, 0, 0, 0.47)"
        : "rgba(0, 105, 25, 0.6)",
      marginBottom: marginBottom,
      action: {
        text: action?.text,
        textColor: action.textColor,
        onPress: action.onPress,
      },
    });
  } else {
    return Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_LONG,
      backgroundColor: !isSuccess
        ? "rgba(105, 0, 0, 0.47)"
        : "rgba(0, 67, 16, 1)",
      marginBottom: marginBottom,
    });
  }
};

export default SnackBarToast;
