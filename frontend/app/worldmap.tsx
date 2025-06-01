import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { ReMapColors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// Components imports
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/TextInput';
import { IconButton } from '@/components/ui/IconButton';
import { Header } from '@/components/layout/Header';
import { MainContent } from '@/components/layout/MainContent';
import { Footer } from '@/components/layout/Footer';

// Map imports
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';

// Fancy schmancy modal library imports 
import BottomSheet from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


export default function WorldMapScreen() {
  // to make sure page isnt going over status bar region
  const insets = useSafeAreaInsets();


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

  // BottomSheet 
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  const [bottomSheetIndex, setBottomSheetIndex] = React.useState(-1);

  const openBottomSheet = () => setBottomSheetIndex(0);
  const closeBottomSheet = () => setBottomSheetIndex(-1);


  // Setting up MAP
  const INITIAL_REGION = {
    // Holberton coordinates
    latitude: -37.817979,     
    longitude: 144.960408,     
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  };


  return (
    //this bottom sheet honestly isn't working and im miserable
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>

        <Header
          title='World Map'
          subtitle='Click on a pin and see what happens'
        >
        </Header>

          {/**********************************************/}
          {/**************** MAIN CONTENT ****************/}
          {/* *********************************************/}
        <MainContent>

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

          {/* =========================================== */}
          {/* ============= UNDER MAP ================== */}
          {/* =========================================== */}
          <View style={styles.scrollContent}>
            <View style={styles.search}>
            <Input style={styles.searchInput}
              label="Search Location"
              placeholder="Search Location"
            />
          </View>

          </View>

          
        </MainContent>


        <Footer>
          <View style={styles.footerContainer}>
            <IconButton
              icon="chevron-left"
              onPress={goBack}>
            </IconButton>
            <IconButton
              icon="map-pin"
              onPress={navigateToCreatePin}>
            </IconButton>

            <IconButton
              icon="user"
              onPress={openLoginModal}>
            </IconButton>

            {/* <Button onPress={openLoginModal}>
              Login
            </Button> */}

            {/* <Button onPress={goBack} style={styles.backButton}>
              Back
            </Button> */}
            <IconButton
              icon="cog"
              onPress={navigateToCreatePin}>
            </IconButton>
            {/* <Button onPress={openBottomSheet}>
              open
            </Button> */}




            {/* this is for the login / sign up modal */}
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

        {/* this is for the gorham bottomsheet for location&pin data */}
        <BottomSheet
          ref={bottomSheetRef}
          index={bottomSheetIndex}
          snapPoints={snapPoints}
          onChange={(index) => setBottomSheetIndex(index)}
        >
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'white' }}>
            <Text>Bottom Sheet Content</Text>
            <Button onPress={closeBottomSheet}>Close Sheet</Button>
          </View>
        </BottomSheet>

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  scrollContent: {
    padding: 20,
  },

  search: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchInput: {
    width: '100%',
  },
  backButton: {
    backgroundColor: ReMapColors.primary.black,
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
  },




});