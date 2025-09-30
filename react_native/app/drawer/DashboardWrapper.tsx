import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Dashboard from "./Dashboard";
import Employee from "./Employee";
import MusterStack from "./MusterStack"; // ✅ stack
import Profile from "./Profile";
import Muster from "./Muster";

const Drawer = createDrawerNavigator();

export default function DashboardWrapper() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Employee" component={Employee} />
      {/* <Drawer.Screen name="Muster" component={Muster} /> ✅ stack instead of drawer */}
      <Drawer.Screen name="Muster" component={Muster}/>
    </Drawer.Navigator>
  );
}
