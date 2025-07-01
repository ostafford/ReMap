import { Stack } from "expo-router";

export default function StackLayout() {
    return (
        <Stack>
            <Stack.Screen name="[pinId]" options={{headerShown: true}}/>
        </Stack>
    );
}
