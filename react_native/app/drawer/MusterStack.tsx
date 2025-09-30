import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MusterList from "./MusterList";
import MusterUpdate from "./MusterUpdate";

const Stack = createStackNavigator();

export default function MusterStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MusterList" component={MusterList} />
      <Stack.Screen name="MusterUpdate" component={MusterUpdate} />
    </Stack.Navigator>
  );
}
