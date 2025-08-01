import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Drug = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>药品页面</Text>
      <Text style={styles.subtitle}>浏览和购买药品</Text>
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

export default Drug; 