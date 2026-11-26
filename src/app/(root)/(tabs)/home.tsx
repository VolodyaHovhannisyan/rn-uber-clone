import { Show, useUser } from '@clerk/expo';
import { Link } from 'expo-router';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Home() {

  const { user } = useUser()
  console.log('user', user?.id)

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Show when={'signed-in'}>
        <Text className="text-xl font-bold text-blue-500">
          Welcome! {user?.emailAddresses?.[0].emailAddress}
        </Text>
      </Show>
      <Show when={'signed-out'}>
        <Link href={'/(auth)/sign-in'}>
          <Text>
            Sign in
          </Text>
        </Link>
        <Link href={'/(auth)/sign-up'}>
          <Text>
            Sign up
          </Text>
        </Link>
      </Show>
    </SafeAreaView>
  );
}


