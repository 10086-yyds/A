import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Login = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>登录页面</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('MainApp')}
      >
        <Text style={styles.buttonText}>登录</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login; 