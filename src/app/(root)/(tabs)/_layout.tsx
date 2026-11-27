import { icons } from '@/constants/index';
import { Tabs } from 'expo-router';
import { Image, ImageSourcePropType, Platform, View } from 'react-native';

export const unstable_settings = {
    // Ensure any route can link back to `/`
    // anchor: 'home',
};

type TTabIcon = {
    focused: boolean
    source: ImageSourcePropType
}

const TabIcon = (
    {
        source,
        focused
    }
        :
        TTabIcon
) => {

    return (
        <View className={`flex flex-row justify-center items-center rounded-full ${focused ? '**bg-general-300' : ''}`}>
            <View className={`rounded-full w-12 h-12 items-center justify-center ${focused ? 'bg-primary-500' : ''}`}>
                <Image
                    source={source}
                    tintColor={'white'}
                    resizeMode='contain'
                    className='w-7 h-7'
                />
            </View>
        </View>
    )
}

export default function TabLayout() {

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: 'red',
                tabBarInactiveTintColor: 'lightblue',
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#333333',
                    borderRadius: 50,
                    paddingBottom: 28,
                    overflow: 'hidden',
                    marginHorizontal: 20,
                    marginBottom: Platform.OS === 'android' ? 60 : 20,
                    // paddingTop: 10,
                    height: 60,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                    position: 'absolute'
                }
            }}
        >
            <Tabs.Screen
                name='home'
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.home} />
                }}
            />
            <Tabs.Screen
                name='rides'
                options={{
                    title: 'Rides',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.list} />
                }}
            />
            <Tabs.Screen
                name='chat'
                options={{
                    title: 'Chat',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.chat} />
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.profile} />
                }}
            />
        </Tabs>
    )

}
