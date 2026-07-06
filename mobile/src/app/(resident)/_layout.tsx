import { Stack, router } from "expo-router";
import { TouchableOpacity, Platform } from "react-native";
import { SymbolView } from "expo-symbols";
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
        options={{
          title: "Collier Township",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(resident)/dashboard" as any);
                }
              }}
              style={{
                marginLeft: Platform.OS === "web" ? 0 : 8,
                marginRight: Platform.OS === "web" ? 12 : 0,
                padding: 4,
              }}
            >
              <SymbolView
                name={{ ios: "chevron.left", android: "arrow_back", web: "arrow_back" }}
                size={24}
                tintColor="#ffffff"
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
