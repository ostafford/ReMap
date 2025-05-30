import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ReMapColors } from '@/constants/Colors';


import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

export default function WorldMapScreen() {
  const goBack = () => {
    router.back();
  };

  const navigateToWorldMap = () => {
    // After login/signup, go to world map
    router.navigate('/worldmap');
  };
  
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'login' | 'signup'>('login');


  const openLoginModal = () => {
  setModalMode('login');
  setIsModalVisible(true);
};

const openSignupModal = () => {
  setModalMode('signup');
  setIsModalVisible(true);
};



  return (
    <View style={styles.container}>
      <Header title="World Map" />
      <MainContent>
        <Text style={styles.title}>🗺️ World Map</Text>
        <Text style={styles.subtitle}>Coming Soon!</Text>
        
        <Button onPress={goBack}>
          Expand Map
        </Button>





      </MainContent>

      <Footer>
        <View>
          <Button onPress={openLoginModal} style={styles.backButton}>
            Login
          </Button>

          <Button onPress={goBack} style={styles.backButton}>
            ← Back to Home
          </Button>

          <Modal isVisible={isModalVisible} onBackdropPress={() => setIsModalVisible(false)}>
            <Modal.Container>
              <Modal.Header title={modalMode === 'login' ? "Welcome Back!" : "Join ReMap Community"} />
              <Modal.Body>
                {modalMode === 'signup' && (
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                  />
                )}
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
                <Input
                  label="Password"
                  placeholder={modalMode === 'login' ? "Enter password" : "Create a password"}
                  secureTextEntry
                  secureToggle
                />
              </Modal.Body>
              <Modal.Footer>
                <View style={styles.modalButtonContainer}>
                  <Button
                    style={[styles.modalButton, modalMode === 'signup' && styles.signUpButton]}
                    onPress={navigateToWorldMap}
                  >
                    {modalMode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
                <Button
                  onPress={() => setModalMode(modalMode === 'login' ? 'signup' : 'login')}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  {modalMode === 'login' ? 'New User' : 'Back to Login'}
                </Button>

                </View>
                
              </Modal.Footer>
            </Modal.Container>
          </Modal>


        </View>
      </Footer>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ReMapColors.ui.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ReMapColors.ui.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: ReMapColors.ui.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: ReMapColors.primary.violet,
    marginTop: 20,
  },

  modalButton: {
    width: 150
  },
  signUpButton: {
    backgroundColor: "#2900E2",
  },
  cancelButton: {
    backgroundColor: ReMapColors.ui.textSecondary,
  },
  modalButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  }


});