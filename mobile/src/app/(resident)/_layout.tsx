import { Stack } from "expo-router";
import HeaderRight from "../../components/HeaderRight";

export default function ResidentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0d2240" },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontSize: 16,
        },
        headerRight: () => <HeaderRight />,
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: "Collier Township" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: "Collier Township" }}
      />
    </Stack>
  );
}
