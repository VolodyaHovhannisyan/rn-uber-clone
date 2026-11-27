import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { icons } from "../constants";
import { GoogleInputProps } from "../types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;
const autocompleteUrl = "https://places.googleapis.com/v1/places:autocomplete";

type PlacePrediction = {
  placeId: string;
  text: {
    text: string;
  };
};

type AutocompleteResponse = {
  suggestions?: {
    placePrediction?: PlacePrediction;
  }[];
};

type PlaceDetailsResponse = {
  formattedAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
};

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [input, setInput] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipNextSearch = useRef(false);

  const handleInputChange = (value: string) => {
    setInput(value);
    setError(null);
    if (!value.trim()) {
      setPredictions([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const search = input.trim();
    if (!search || !googlePlacesApiKey) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(autocompleteUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": googlePlacesApiKey,
            "X-Goog-FieldMask":
              "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
          },
          body: JSON.stringify({ input: search, languageCode: "en" }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Places autocomplete request failed: ${response.status}`,
          );
        }

        const data = (await response.json()) as AutocompleteResponse;
        if (!controller.signal.aborted) {
          setPredictions(
            data.suggestions?.flatMap((suggestion) =>
              suggestion.placePrediction ? [suggestion.placePrediction] : [],
            ) ?? [],
          );
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          console.error("Places autocomplete failed:", requestError);
          setError(
            "Couldn't load places. Check your connection and try again.",
          );
          setPredictions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [input]);

  const visibleError =
    error ??
    (!googlePlacesApiKey && input.trim() ? "Places API key is missing." : null);

  const selectPlace = async (prediction: PlacePrediction) => {
    if (!googlePlacesApiKey) {
      setError("Places API key is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(prediction.placeId)}`,
        {
          headers: {
            "X-Goog-Api-Key": googlePlacesApiKey,
            "X-Goog-FieldMask": "location,formattedAddress",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Place details request failed: ${response.status}`);
      }

      const details = (await response.json()) as PlaceDetailsResponse;
      if (
        typeof details.location?.latitude !== "number" ||
        typeof details.location.longitude !== "number"
      ) {
        throw new Error("Place details response did not include coordinates.");
      }

      skipNextSearch.current = prediction.text.text !== input;
      setInput(prediction.text.text);
      setPredictions([]);
      handlePress({
        latitude: details.location.latitude,
        longitude: details.location.longitude,
        address: details.formattedAddress ?? prediction.text.text,
      });
    } catch (requestError) {
      console.error("Place details request failed:", requestError);
      setError("Couldn't load this place. Please select it again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl mb-5 ${containerStyle}`}
    >
      <View className="relative w-full">
        <View
          className="flex-row items-center rounded-full px-4"
          style={{
            backgroundColor: textInputBackgroundColor ?? "white",
            marginHorizontal: 20,
            shadowColor: "#d4d4d4",
          }}
        >
          <View className="mr-2 h-6 w-6 items-center justify-center">
            <Image
              source={icon ?? icons.search}
              className="h-6 w-6"
              resizeMode="contain"
            />
          </View>
          <TextInput
            value={input}
            onChangeText={handleInputChange}
            placeholder={initialLocation ?? "Where do you want to go?"}
            placeholderTextColor="gray"
            className="mt-[5px] h-12 flex-1 text-base font-semibold"
          />
          {isLoading && <ActivityIndicator className="ml-2" />}
        </View>
        {(predictions.length > 0 || visibleError) && (
          <View
            className="mt-1 rounded-xl"
            style={{
              backgroundColor: textInputBackgroundColor ?? "white",
              marginHorizontal: 20,
            }}
          >
            {visibleError ? (
              <Text className="px-4 py-3 text-sm text-red-600">
                {visibleError}
              </Text>
            ) : (
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={predictions}
                keyExtractor={(item) => item.placeId}
                renderItem={({ item }) => (
                  <Pressable
                    className="px-4 py-3"
                    onPress={() => void selectPlace(item)}
                  >
                    <Text>{item.text.text}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default GoogleTextInput;
