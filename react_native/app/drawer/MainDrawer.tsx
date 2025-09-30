// app/drawer/MainDrawer.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Dashboard from "./Dashboard";
import Employee from "./Employee";
import MusterWrapper from "./MusterStack"; // Nested drawer
import Profile from "./Profile";

const Drawer = createDrawerNavigator();

export default function MainDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        drawerStyle: { width: 250 },
      }}
    >
    
      <Drawer.Screen name="Muster" component={MusterWrapper} />
      
    </Drawer.Navigator>
  );
}
