import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputField';
import OAuth from '@/components/OAuth';
import { icons, images } from '@/constants/index';
import { useSignIn } from '@clerk/expo';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';


export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [customErrors, setCustomErrors] = useState({
    email: '',
    password: ''
  })

  const onSignInPress = async () => {
    const { error } = await signIn.password({
      emailAddress: form.email,
      password: form.password,
    })
    
    if (error) {
      console.error(JSON.stringify(error, null, 2))

      // if (error?.status === 400) {
      //   Alert.alert('Sessions already exists')
      // }

      console.log({ form })
      console.log(errors, fetchStatus)

      let newCustomErrors = {}

      // if (!!errors.fields?.emailAddress?.['longMessage']) {
      //   customErrors.email = errors.fields?.emailAddress?.['longMessage']
      // }
      if (!!errors.fields?.password?.['longMessage']) {
        customErrors.password = errors.fields?.password?.['longMessage']
      }

      setCustomErrors({ ...customErrors, ...newCustomErrors })
      return
    }

    console.log({ signIn });


    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask)
            return
          }

          const url = decorateUrl('/(root)/(auth)/home')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url as Href)
          }
        },
      })
    } else if (signIn.status === 'needs_second_factor') {
      // See https://clerk.com/docs/guides/development/custom-flows/authentication/multi-factor-authentication
    } else if (signIn.status === 'needs_client_trust') {
      // For other second factor strategies,
      // see https://clerk.com/docs/guides/development/custom-flows/authentication/device-trust
      const emailCodeFactor = signIn.supportedSecondFactors.find((factor) => factor.strategy === 'email_code')

      if (emailCodeFactor) {
        // await signIn.mfa.sendEmailCode()
      }
    } else {
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn)
    }

  }

  return (
    <ScrollView className='flex-1 bg-white overflow-y-auto'>
      <View className='flex-1 bg-white'>
        <View className='relative w-full h-[250px]'>
          <Image source={images.signUpCar} className='z-0 w-full h-[250px]' />
          <Text className='text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5'>
            Sign in to continue
          </Text>
        </View>
        <View className='p-5'>

          <InputField
            label='Email'
            placeholder='Enter your email'
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => {
              setForm((prev) => ({ ...prev, email: value }))
              setCustomErrors({ ...customErrors, email: '' })
            }}
            autoCapitalize='none'
            error={customErrors.email}
          />
          <InputField
            label='Password'
            placeholder='Enter your password'
            icon={icons.lock}
            value={form.password}
            onChangeText={(value) => {
              setForm((prev) => ({ ...prev, password: value }))
              setCustomErrors({ ...customErrors, password: '' })
            }}
            secureTextEntry
            autoCapitalize='none'
            error={customErrors.password}
          />
          <CustomButton
            title='Sign In'
            className='mt-6'
            onPress={onSignInPress}
            disabled={!form.email || !form.password || fetchStatus === 'fetching'}
          />

          <OAuth />

          <View
            className='flex-row items-center justify-center text-lg text-center text-general-200 mt-10'
          >
            <Text>Don't have an account? </Text>
            <Pressable
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Text className='text-primary-500'> Sign up</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}


