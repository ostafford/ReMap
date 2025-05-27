import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

// Import your layout components
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// Import components
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';

// Import colors
import { ReMapColors } from '@/constants/Colors';

export default function OnboardingScreen() {
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);

  const toggleLoginModal = () => setIsLoginModalVisible(!isLoginModalVisible);
  const toggleSignupModal = () => setIsSignupModalVisible(!isSignupModalVisible);

  const goBack = () => {
    router.back();
  };

  const navigateToWorldMap = () => {
    // After login/signup, go to world map
    router.navigate('/worldmap');
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Welcome to ReMap" 
        subtitle="Join the community of memory makers" 
      />
      
      <MainContent>
        <View style={styles.content}>
          <Text style={styles.description}>
            Create an account to start pinning your memories and discover 
            authentic stories from others around the world.
          </Text>
          
          <Text style={styles.orText}>
            Choose how you'd like to get started:
          </Text>
        </View>
      </MainContent>
      
      <Footer>
        <View style={styles.buttonContainer}>
          <Button 
            style={styles.primaryButton}
            onPress={toggleSignupModal}
          >
            🚀 Create Account
          </Button>
          
          <Button 
            style={styles.secondaryButton}
            onPress={toggleLoginModal}
          >
            🔑 Sign In
          </Button>
          
          <Button 
            style={styles.tertiaryButton}
            onPress={goBack}
          >
            ← Back to Home
          </Button>
        </View>
      </Footer>

      {/* Login Modal */}
      <Modal isVisible={isLoginModalVisible} onBackdropPress={toggleLoginModal}>
        <Modal.Container>
          <Modal.Header title="Welcome Back!" />
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
            <Button style={styles.modalButton} onPress={navigateToWorldMap}>
              Sign In
            </Button>
            <Button style={[styles.modalButton, styles.cancelButton]} onPress={toggleLoginModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal.Container>
      </Modal>

      {/* Signup Modal */}
      <Modal isVisible={isSignupModalVisible} onBackdropPress={toggleSignupModal}>
        <Modal.Container>
          <Modal.Header title="Join ReMap Community" />
          <Modal.Body>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
            />
            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            <Input
              label="Password"
              placeholder="Create a password"
              secureTextEntry
              secureToggle
            />
          </Modal.Body>
          <Modal.Footer>
            <Button style={[styles.modalButton, styles.signUpButton]} onPress={navigateToWorldMap}>
              Create Account
            </Button>
            <Button style={[styles.modalButton, styles.cancelButton]} onPress={toggleSignupModal}>
              Cancel
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
    backgroundColor: ReMapColors.ui.background,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: ReMapColors.ui.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  orText: {
    fontSize: 14,
    color: ReMapColors.ui.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: ReMapColors.primary.violet,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: ReMapColors.primary.blue,
    width: '100%',
  },
  tertiaryButton: {
    backgroundColor: ReMapColors.ui.textSecondary,
    width: '100%',
  },
  modalButton: {
    width: 150,
  },
  signUpButton: {
    backgroundColor: ReMapColors.primary.violet,
  },
  cancelButton: {
    backgroundColor: ReMapColors.ui.textSecondary,
  },
});