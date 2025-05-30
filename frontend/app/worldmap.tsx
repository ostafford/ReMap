import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { ReMapColors } from '@/constants/Colors';

import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import { IconButton } from '@/components/ui/IconButton';
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';


export default function WorldMapScreen() {
  // Page Navigation
  const goBack = () => {
    router.back();
  };
  const navigateToWorldMap = () => {
    router.navigate('/worldmap');
  };
  const navigateToCreatePin = () => {
    router.navigate('/createPin');
  };
  
  // Modals
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'login' | 'signup'>('login');

  const openLoginModal = () => {
  setModalMode('login');
  setIsModalVisible(true);
};

  // Setting up MAP
  const INITIAL_REGION = {
    // Holberton coordinates
    latitude: -37.817979,     
    longitude: 144.960408,     
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  };


  return (
    <View style={styles.container}>
      
      {/* <Header title="World Map" /> */}
      <MainContent>
        <Text style={styles.title}>🗺️ World Map</Text>

        <Input
          label="Search Location"
          placeholder="Search Location"
        />


        <View>
          <MapView 
            style={styles.map}
            provider={PROVIDER_GOOGLE}  
            initialRegion={INITIAL_REGION}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker
              title="Holberton School"
              description="Holberton Campus - Collins Street"
              coordinate={{latitude: -37.817979, longitude: 144.960408 }}
            >
              <Image
                source={require('../assets/images/holberton_logo.jpg')}
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
            </Marker>
          </MapView>
        </View>




      </MainContent>


      <Footer>
        <View style={styles.footerContainer}>
          <IconButton
            icon="plus"
            onPress={navigateToCreatePin}>
          </IconButton>
          <Button onPress={openLoginModal}>
            Login
          </Button>
          <Button onPress={goBack} style={styles.backButton}>
            Back
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
                    onPress={() => setModalMode(modalMode === 'login' ? 'signup' : 'login')}
                    style={[styles.modalButton, styles.cancelButton]}
                  >
                    {modalMode === 'login' ? 'New User' : 'Back to Login'}
                  </Button>
                  <Button
                    style={[styles.modalButton, modalMode === 'signup' && styles.signUpButton]}
                    onPress={navigateToWorldMap}
                  >
                    {modalMode === 'login' ? 'Sign In' : 'Create Account'}
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
  },
  footerContainer: {
    flexDirection: 'row',
  },

  map: {
      width: '100%',
      height: 500,
      borderRadius: 12,
  }


});