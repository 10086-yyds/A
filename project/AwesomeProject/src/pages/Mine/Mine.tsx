import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Mine = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的</Text>
      <Text style={styles.subtitle}>个人中心</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default Mine; 