import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import React from "react";

import { Canvas } from '@react-three/fiber/native';


// importing components
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input, TextInput } from "../../components/ui/TextInput";
import { SpinningGlobe } from "../../components/ui/Globe";

export default function ExploreScreen() {

  const [isModalVisible, setIsModalVisible] = React.useState(false);
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
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              <Input
                label="Password"
                placeholder="Enter password"
                secureTextEntry
                secureToggle
              />
          </Modal.Body>
          <Modal.Footer>
            <Button style={[styles.modalButton, styles.signUpButton]}>
              Sign Up
            </Button>
            <Button style={styles.modalButton}>
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