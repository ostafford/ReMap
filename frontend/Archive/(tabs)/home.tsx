import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Canvas } from '@react-three/fiber/native';

import { signIn, signUp } from '@/services/auth';


// importing components
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, TextInput } from "@/components/ui/TextInput";
import { SpinningGlobe } from "@/components/ui/Globe";

export default function ExploreScreen() {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const toggleModal = () => setIsModalVisible(() => !isModalVisible);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧭 ReMap Your Journey</Text>
      <Text style={styles.subtitle}>Discover authentic stories from others</Text>
      <Text style={styles.status}>✅ Memory discovery features coming soon!</Text>
      
      <View style={styles.globeContainer}>
        <Canvas style={{ flex: 1 }}>
          <ambientLight intensity={3} />
          <SpinningGlobe position={[0, 0, 0]} scale={1.5} />
        </Canvas>
      </View>
      
      {/* implementing custom components ! ! ! */}
      <Button style={styles.button} onPress={toggleModal}>
        Sign in
      </Button>

      {/* im wondering if we can hide this until system recognises user is logged in */}
      <Button style={[styles.button]} onPress={() => router.navigate('/home')}>
        Add Pin
      </Button>
      
      <Modal isVisible={isModalVisible} onBackdropPress={toggleModal}>
        <Modal.Container>
          <Modal.Header title={`Discover\n Yesterday · Today · Tomorrow`}/>
          <Modal.Body>
              <Input
                value={email}
                onChangeText={(value) => setEmail(value)}
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              <Input
                value={password}
                onChangeText={(value) => setPassword(value)}
                label="Password"
                placeholder="Enter password"
                secureTextEntry
                secureToggle
              />
          </Modal.Body>
          <Modal.Footer>
            <Button
              onPress={async () => {
                try {
                  await signUp({ email, password });

                  Alert.alert("Signed up");
                } catch (e) {
                  console.error(e);
                  Alert.alert("Error signing up");
                }
              }}
              style={[styles.modalButton, styles.signUpButton]}
            >
              Sign Up
            </Button>
            <Button
                onPress={async () => {
                try {
                  await signIn({ email, password });

                  Alert.alert("Signed in");
                } catch (e) {
                  console.error(e);
                  Alert.alert("Error signing in");
                }
              }}
              style={styles.modalButton}
            >
              Login
            </Button>
          </Modal.Footer>
        </Modal.Container>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },

  globeContainer: {
    height: 200,
    width: '100%',
  },

  button: {
    width: 325
  },
  modalButton: {
    width: 150
  },
  signUpButton: {
    backgroundColor: "#2900E2",
  }

  


});