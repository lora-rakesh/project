// app/types.ts
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { StackNavigationProp } from "@react-navigation/stack";

export type DrawerParamList = {
  Dashboard: undefined;
  Employee: undefined;
  Muster: undefined;
  Profile: undefined;
};

export type MusterDrawerParamList = {
  MusterList: undefined;
  MusterUpdate: undefined;
};

// Add this for Muster stack navigation
export type MusterStackParamList = {
  MusterList: undefined;
  MusterUpdate: undefined;
};

export type MusterNavigationProp = StackNavigationProp<MusterStackParamList>;