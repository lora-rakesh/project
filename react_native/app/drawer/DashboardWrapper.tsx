import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Dashboard from "./Dashboard";
import Employee from "./Employee";
import Profile from "./Profile";
import MusterMain from "./Muster/MUsterMain"; // Import the opener

const Drawer = createDrawerNavigator();

export default function DashboardWrapper() {
  return (
    <Drawer.Navigator 
      screenOptions={{ 
        headerShown: false,
        drawerPosition: "left"
      }}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Employee" component={Employee} />
      <Drawer.Screen name="Muster" component={MusterMain} />
      <Drawer.Screen name="Profile" component={Profile} />
    </Drawer.Navigator>
  );
}