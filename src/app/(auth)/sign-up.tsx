import CustomButton from '@/components/CustomButton';
import InputField from '@/components/InputField';
import OAuth from '@/components/OAuth';
import { icons, images } from '@/constants/index';
import { fetchAPI } from '@/lib/fetch';
import { useAuth, useSignUp } from '@clerk/expo';
import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';


export default function SignUp() {

  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()


  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })

  const [showModal, setShowModal] = useState(false)
  const [code, setCode] = useState('')
  const [customErrors, setCustomErrors] = useState({
    email: '',
    password: ''
  })


  const onSignUpPress = async () => {
    const { error } = await signUp.password({
      emailAddress: form.email,
      password: form.password,
    })
    if (error) {
      console.log({ form })
      console.log(errors, fetchStatus)

      let newCustomErrors = {}

      if (!!errors.fields?.emailAddress?.['longMessage']) {
        customErrors.email = errors.fields?.emailAddress?.['longMessage']
      }
      if (!!errors.fields?.password?.['longMessage']) {
        customErrors.password = errors.fields?.password?.['longMessage']
      }

      setCustomErrors({ ...customErrors, ...newCustomErrors })

      return
    }

    if (!error) {
      await signUp.verifications.sendEmailCode()
      setShowModal(true)
    }


  }

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    })
    if (signUp.status === 'complete') {
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: async ({ session, decorateUrl }) => {
          console.log({ session })
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            // console.log(session?.currentTask)
            console.log(session?.id,777)
            return
          }


          const userResp = await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              clerkId: session.user?.id,
            })
          })

          console.log('userResp ', userResp);


          const url = decorateUrl('/(root)/(tabs)/home')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url as Href)
          }
        },
      })
    } else {
      // Check why the sign-up is not complete
      console.error('Sign-up attempt not complete:', signUp)
      console.error({ 'errors': errors })
    }
  }



  return (
    <>
      {
        <Modal
          animationType="slide"
          visible={showModal}
          backdropColor={`#16161680`}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}
          statusBarTranslucent
          navigationBarTranslucent
        >
          <View className='flex items-center justify-center relative h-full '>
            <View className='bg-white px-7 py-9 rounded-2xl min-h-[300px] w-[90%] '>
              <Text className='text-2xl font-JakartaExtraBold mb-2'>
                Verification
              </Text>
              <Text className='font-Jakarta mb-5'>
                We've semt a verification code to {form.email}
              </Text>
              <InputField
                label='Code'
                icon={icons.lock}
                placeholder='123456'
                value={code}
                keyboardType='numeric'
                onChangeText={(txt) => setCode(txt)}
              />
              {
                errors.fields.code && (
                  <Text className='text-danger-600 text-sm mt-1'>
                    {errors.fields.code.message}
                  </Text>
                )
              }
              <CustomButton
                title='Verify email'
                onPress={handleVerify}
                bgVariant='success'
                className='mt-4'
              />
            </View>
          </View>
        </Modal>

      }
      <ScrollView className='flex-1 bg-white overflow-y-auto'>
        <View className='flex-1 bg-white'>
          <View className='relative w-full h-[250px]'>
            <Image source={images.signUpCar} className='z-0 w-full h-[250px]' />
            <Text className='text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5'>
              Create Your Account
            </Text>
          </View>
          <View className='p-5'>
            <InputField
              label='Name'
              placeholder='Enter your name'
              icon={icons.person}
              value={form.name}
              onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
            />
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
              title='Sign up'
              className='mt-6'
              onPress={onSignUpPress}
              disabled={!form.email || !form.password || fetchStatus === 'fetching'}
            />

            <OAuth handleGoogleSignIn={() => { }} />

            <View nativeID="clerk-captcha" />

            <View
              className='flex-row items-center justify-center text-lg text-center text-general-200 mt-10'
            >
              <Text>Already have an account? </Text>
              <Pressable
                onPress={() => router.push('/(auth)/sign-in')}
              >
                <Text className='text-primary-500'> Log in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}


