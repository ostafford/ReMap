import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
	View,
	Text,
	TouchableOpacity,
	SafeAreaView,
	Pressable
} from 'react-native';
import { useRouter, useGlobalSearchParams, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/ui/Button';

import RemapClient from '../../services/remap';
import { customStyles } from '../customStyles';


type CircleData = {
    id: string;
    name: string;
    members: string[];
}

export default function Circle() {
    const { circleId } = useLocalSearchParams<{circleId: string}>();

    console.log(circleId);

    const [data, setData] = useState<CircleData | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const _data = await new RemapClient().getUserCircle(circleId.toString());
                
                const formatted = {
                    Circle: {
                        id: _data.id,
                        name: _data.name,
                        members: _data.members || []
                    }
                };
                console.log(formatted);
                setData(_data);	
           
            } catch (error) {
                console.error('Error fetching single circle:', error);
            }
        };

        loadData();
    }, []);

    return (
        <SafeAreaView>
            <View>
                <Text>Circle</Text>
                <Text>Title: {data?.name}</Text>
                <Text>
                    Members: {data?.members?.length ? data.members.join(', ') : 'None'}
                </Text>
            </View>
        </SafeAreaView>
    );
}
