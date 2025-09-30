// app/drawer/_layout.tsx
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity } from "react-native";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#007bff",
        drawerType: "slide",
        swipeEnabled: true,
        drawerStyle: { width: 250 },
        // Left icon (3 lines comes automatically from drawer)
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 15 }}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=3" }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        options={{
          title: "Profile",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
