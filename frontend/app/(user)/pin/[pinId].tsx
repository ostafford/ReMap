import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	Image,
	Pressable
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/ui/Button';

import RemapClient from '../../services/remap';
import { styles } from '../customStyles';


export default function Pin() {
    const { pinId } = useLocalSearchParams<{ pinId: string}>();

    console.log(pinId);

    const [data, setData] = useState<Awaited<ReturnType<RemapClient['getPin']>> | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const _data = await new RemapClient().getPin(pinId.toString());

                console.log(_data);
                setData(_data);
 
            } catch (error) {
                console.error('Error fetching single pin:', error);
            }
        };

        loadData();
    }, []);


    // Handle Audio
        const soundRef = useRef<Audio.Sound | null>(null);
        const [lastAudio, setLastAudio] = useState<string | null>(null);
        const [isPaused, setIsPaused] = useState(false);
    
    // Play Audio
    async function PlaySound(audio_url: string | undefined | null) {
        if (!audio_url) {
            console.warn("No audio url.");
            return;
        }

        // Check Pause Audio at a specific time.
        if (soundRef.current && isPaused && lastAudio === audio_url) {
            try {
                await soundRef.current.playAsync();
                setIsPaused(false);
                return;
            } catch (error) {
                console.error("Error resuming audio", error);
            }
        }

        // Stop Audio and press again = reset.
        try {
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: audio_url },
                { shouldPlay: true }
            );
            soundRef.current = sound;
            setLastAudio(audio_url);
            setIsPaused(false);

            // Track Audio
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish && !status.isLooping) {
                    console.log("Audio Finished.");
                    setLastAudio(null);
                    setIsPaused(false);
                }
            })

        } catch (error) {
            console.error("Error playing audio", error);
        }
    }

    // Pause Audio
    const pauseSound = async () => {
        try {
            if (soundRef.current) {
                await soundRef.current.pauseAsync();
                setIsPaused(true);
            }
        } catch (error) {
            console.error("Error pausing audio", error);
        }
    };

    // Stop Audio
    const stopSound = async () => {
        try {
            if (soundRef.current) {
                await soundRef.current.stopAsync();
                setLastAudio(null);
            }
        } catch (error) {
            console.error("Error stopping audio", error);
        }
    };

    // Prevent memory leaks by unloading the audio when the component unmounts.
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current?.unloadAsync();
                soundRef.current.setOnPlaybackStatusUpdate(null);
                soundRef.current = null;
                setLastAudio(null);
                setIsPaused(false);
            }
        };
    }, []);

    // Stop Audio from playing if not on page
    useFocusEffect(
        useCallback(() => {
            return () => {
                if (soundRef.current) {
                    soundRef.current.unloadAsync();
                    soundRef.current = null;
                    setLastAudio(null); // reset audio state
                    setIsPaused(false); // reset pause state
                }
            };
        }, [])
    );

    return (
        <SafeAreaView>
            <View>
                <Text>Pin: {data?.name}</Text>
                <Text>Description: {data?.description}</Text>
                <Text>Image</Text>
                {Array.isArray(data?.image_urls) && data.image_urls.length > 0 ? (
                    <Image source={{uri: data?.image_urls[0]}}
                    style={{ width: 300, height: 300, resizeMode: 'contain'}}
                    />
                ) : (
                    <Text>No image available</Text>
                )}
                <Button onPress={() => PlaySound(data?.audio_url)}>
                    Play
                </Button>
                <Button onPress={pauseSound}>
                    Pause
                </Button>
                <Button onPress={stopSound}>
                    Stop
                </Button>
            </View>
        </SafeAreaView>
    );
}
