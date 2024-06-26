import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Menu } from "react-native-paper";

const AppHeader = ({ onProfilePress, onSignOutPress }) => {
  const [isMenuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <Appbar.Header>
      <Appbar.Content title="Tasks" />
      <Menu
        visible={isMenuVisible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon="dots-vertical" onPress={openMenu} />}
      >
        <Menu.Item
          onPress={() => {
            closeMenu();
            onProfilePress();
          }}
          title="Profile"
        />
        <Menu.Item
          onPress={() => {
            closeMenu();
            onSignOutPress();
          }}
          title="Sign Out"
        />
      </Menu>
    </Appbar.Header>
  );
};

export default AppHeader;
