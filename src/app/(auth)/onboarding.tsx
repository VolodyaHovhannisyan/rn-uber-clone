import { router } from 'expo-router';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '@/components/CustomButton';
import { ONBOARDING_SCREENS } from '@/constants/index';
import Swiper from 'react-native-swiper';
import { useUser } from '@clerk/expo';

export default function Onboarding() {

  const swiperREf = useRef<Swiper>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const isLastSlide = activeIndex === ONBOARDING_SCREENS.length - 1

  const {isSignedIn} = useUser()

  useLayoutEffect(() => {
    if (isSignedIn) {
      router.replace('/(root)/(tabs)/home')
    }
  }, [isSignedIn])
  


  return (
    <SafeAreaView className="flex-1 items-center justify-between bg-white ">
      <TouchableOpacity
        onPress={(e) => {
          router.replace('/(auth)/sign-up')
        }}
        className='w-full flex justify-end items-end p-5'
      >
        <Text
          className='text-black text-sm font-JakartaBold'
        >
          Skip
        </Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperREf}
        loop={false}
        dot={<View className='w-8 h-1 mx-1 bg-[#e2e8f0] rounded-full' />}
        activeDot={<View className='w-8 h-1 mx-1 bg-[#0286ff] rounded-full' />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {
          ONBOARDING_SCREENS.map((item, i) => {
            return <View
              key={i}
              className='flex items-center justify-center p-5'
            >
              <Image
                source={item.image}
                className='w-full h-[300px]'
                resizeMode='contain'
              />
              <View className='flex flex-row items-center justify-center w-full mt-10'>
                <Text className='text-black text-3xl font-bold mx-10 text-center'>
                  {item.title}
                </Text>
              </View>
              <Text className='text-lg font-JakartaSemiBold text-center text-general-200 mx-10 mt-10'>
                {item.description}
              </Text>
            </View>
          })
        }
      </Swiper>
      <CustomButton
        title={isLastSlide ? 'Get Started':'Next'}
        className={'!w-11/12 mt-10'}
        onPress={() => isLastSlide ? router.replace('/(auth)/sign-up') : swiperREf.current?.scrollBy(1)}
      />
    </SafeAreaView>
  );
}


