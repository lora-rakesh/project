import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MusterList from "./MusterList";
import MusterUpdate from "./MusterUpdate";

const Drawer = createDrawerNavigator();

export default function MusterMain() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: "left"
      }}
      defaultStatus="open"
    >
      <Drawer.Screen name="MusterList" component={MusterList} />
      <Drawer.Screen name="MusterUpdate" component={MusterUpdate} />
    </Drawer.Navigator>
  );
}