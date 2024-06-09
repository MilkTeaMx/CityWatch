import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image
} from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-paper";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const IconButton = ({ icon = "eye-off", color = "#C4C4C4", onPress }) => (
  <TextInput.Icon icon={icon} color={color} onPress={onPress} />
);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const auth = FIREBASE_AUTH;

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
      alert("Sign In Failed: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.logoContainer, {marginBottom: 0}]}>
        <Image style={styles.logo} source={require('../assets/logo.png')}/>
      </View>
      <View style={styles.logoContainer}>
        <Text style={styles.loginText}>Login</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.textInput}
          placeholderTextColor="#aaa"
          theme={{ colors: { primary: "#000" } }}
        />
        <TextInput
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.textInput}
          placeholder="Password"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          right={
            <IconButton
              icon={showPassword ? "eye" : "eye-off"}
              color="#C4C4C4"
              onPress={toggleShowPassword}
            />
          }
          theme={{ colors: { primary: "#000" } }}
        />
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={() => login()}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => {
          navigation.navigate("Register");
        }}
      >
        <Text style={styles.linkText}>Have an Account? Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  loginText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
    alignItems: "center",
  },
  textInput: {
    width: "90%",
    height: 50,
    borderRadius: 10,
    backgroundColor: "#FFF",
    marginBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    borderColor: "#ddd",
    borderWidth: 1,
    fontSize: 16,
    color: "#333",
  },
  loginButton: {
    width: "90%",
    height: 50,
    backgroundColor: "#16247d",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginBottom: 16,
  },
  linkText: {
    color: "#1E88E5",
    textDecorationLine: "underline",
    fontSize: 16,
  },
});

export default LoginScreen;
