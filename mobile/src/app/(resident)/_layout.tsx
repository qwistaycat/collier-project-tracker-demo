import { Stack } from "expo-router";

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
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: "Collier Township" }}
      />
    </Stack>
  );
}
