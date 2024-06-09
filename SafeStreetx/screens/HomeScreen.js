import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, StyleSheet, View, Dimensions, Text, Image, ActivityIndicator } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { FIREBASE_AUTH, FIREBASE_STORAGE, FIRESTORE_DB } from "../FirebaseConfig";
import { Icon } from "react-native-elements";
import MapView, { Heatmap, Marker, Callout } from 'react-native-maps';
import Papa from 'papaparse';
import { Picker } from '@react-native-picker/picker';
import Carousel from "react-native-reanimated-carousel";
import { collection, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref } from "firebase/storage";
import { useSharedValue } from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";

import * as Location from 'expo-location';
import personLocationIcon from '../assets/personLocationIcon.png'
import WebView from "react-native-webview";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {

  const [userLocation, setUserLocation] = useState(null);

  const [crimeWtd, setCrimeWtd] = useState([]);
  const [crime28d, setCrime28d] = useState([]);
  const [crimeYtd, setCrimeYtd] = useState([]);
  const [selectedTime, setSelectedTime] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState([]);
  const [heatMapRadius, setHeatMapRadius] = useState(25);
  const [newEvent, setEvent] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const progress = useSharedValue(0);
  const carouselRef = useRef(null);

  const db = FIRESTORE_DB;
  const storage = FIREBASE_STORAGE;

  const handleSignOut = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      navigation.replace("Login"); // Ensure navigation back to login
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const crime_wtd = `
  Brooklyn North,Bronx,Manhattan South,Queens North,Queens South,Staten Island
  2373,2373,529,300,202,68
  `;

  const crime_28d = `
  Brooklyn North,Bronx,Manhattan South,Queens North,Queens South,Staten Island
  9586,9586,2315,1232,825,280
  `;

  const crime_ytd = `
  Brooklyn North,Bronx,Manhattan South,Queens North,Queens South,Staten Island
  43714,43714,10262,5693,3701,1311
  `;

  const parseCrimeString = (content, setCrimeData) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const valuesArray = [];
        result.data.forEach((d) => {
          valuesArray.push(Object.values(d));
        });
        setCrimeData(valuesArray);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };

  useEffect(() => {
    
    //MAX ADDED THIS: GETTING USER LOCATION ON RENDER TO DISPLAY
    getUserLocation().then(location => setUserLocation(location));
    
    parseCrimeString(crime_wtd, setCrimeWtd);
    parseCrimeString(crime_28d, setCrime28d);
    parseCrimeString(crime_ytd, setCrimeYtd);

    const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
      const newEvents = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        newEvents.push({
          id: doc.id, // Ensure each event has a unique id
          coords: [data.latlng.latitude, data.latlng.longitude],
          address: data.address,
          time: data.time,
          description: data.description,
          imagePath: data.image,
          imageUrl: '', // Initialize imageUrl as an empty string
          isLoading: true // Add loading state
        });
      });
      setEvent(newEvents); // Setting the entire array of newEvents
      console.log("Updated markerCoords:", newEvents); // Logging the updated coordinates
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const fetchImageUrls = async (events) => {
    const eventsWithUrls = await Promise.all(events.map(async (event) => {
      if (event.imagePath) {
        const imageRef = ref(storage, event.imagePath);
        try {
          const url = await getDownloadURL(imageRef);
          return { ...event, imageUrl: url, isLoading: false }; // Update loading state
        } catch (error) {
          console.error('Error fetching image URL:', error);
          return { ...event, isLoading: false }; // Update loading state even if there's an error
        }
      }
      return { ...event, isLoading: false }; // Update loading state
    }));
    setEvent(eventsWithUrls);
  };

  useEffect(() => {
    if (newEvent.length > 0) {
      fetchImageUrls(newEvent);
    }
  }, [newEvent]);

  useEffect(() => {
    if (crimeWtd.length > 0) {
      setSelectedTime(crimeWtd);
    }
  }, [crimeWtd]);

  useEffect(() => {
    if (selectedTime.length > 0 && selectedTime[0].length > 0) {
      var total = 0;
      for (var i = 0; i < selectedTime[0].length; i++) {
        total += parseInt(selectedTime[0][i].trim(), 10);
      }

      var weights = [];
      for (var i = 0; i < selectedTime[0].length; i++) {
        weights.push((1 - parseInt(selectedTime[0][i].trim(), 10) / total));
      }
      setSelectedWeights(weights);

      if (selectedTime === crimeWtd) {
        setHeatMapRadius(150);
      } else if (selectedTime === crime28d) {
        setHeatMapRadius(190);
      } else {
        setHeatMapRadius(215);
      }
    }
  }, [selectedTime]);

  const initialRegion = {
    latitude: 40.7194,
    longitude: -73.9232,
    latitudeDelta: 0.258,
    longitudeDelta: 0.3539,
  };

  const points = [
    { latitude: 40.6943, longitude: -73.9167, weight: selectedWeights[0] }, // Brooklyn North
    { latitude: 40.8370, longitude: -73.8654, weight: selectedWeights[1] }, // Bronx
    { latitude: 40.7767, longitude: -73.9713, weight: selectedWeights[2] }, // Manhattan South
    { latitude: 40.7498, longitude: -73.7976, weight: selectedWeights[3] }, // Queens North
    { latitude: 40.6794, longitude: -73.8365, weight: selectedWeights[4] }, // Queens South
    { latitude: 40.5790, longitude: -74.1515, weight: selectedWeights[5] }  // Staten Island
  ];

  const handleValueChange = (value) => {
    switch (value) {
      case 'wtd':
        setSelectedTime(crimeWtd);
        break;
      case '28d':
        setSelectedTime(crime28d);
        break;
      case 'ytd':
        setSelectedTime(crimeYtd);
        break;
      default:
        break;
    }
  };

  const handleMarkerPress = (index) => {
    setCurrentSlideIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });
  };


  const getUserLocation = async () => {
    try {
      //GETTING THE LATLNG
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status)
      if (status !== 'granted') {
          console.log("Permission Not Granted")
          return;
      }
      let location = await Location.getCurrentPositionAsync({});

      const latitude = location.coords.latitude
      const longitude = location.coords.longitude
   
      return {"latitude": latitude, "longitude": longitude}
    } catch (error) {
      console.error('Error writing document:', error);
    }
  }
  


  return (
    <MenuProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Picker
            style={styles.picker}
            onValueChange={(selectedValue) => handleValueChange(selectedValue)}
          >
            <Picker.Item label="Week to Date" value="wtd" />
            <Picker.Item label="Past Month" value="28d" />
            <Picker.Item label="Year to Date" value="ytd" />
          </Picker>
          <Menu style={styles.menuStyles}>
            <MenuTrigger>
              <Icon
                name={"dots-three-vertical"}
                type={"entypo"}
                size={20}
                color="black" // Color of the icon
              />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={handleSignOut} text="Sign Out" />
            </MenuOptions>
          </Menu>
        </View>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
          >
            <Heatmap points={points} radius={heatMapRadius} />
            {newEvent.map((event, index) => (
              <Marker
                key={`${event.id}-${currentSlideIndex}`} // Use a combination of unique id and currentSlideIndex as the key
                coordinate={{ latitude: event.coords[0], longitude: event.coords[1] }}
                pinColor={index === currentSlideIndex ? 'red' : 'blue'} // Keep the color consistent
                onPress={() => handleMarkerPress(index)}
              >
                <Callout style={styles.image}>
                                {event.imageUrl ? (
                  <Text>
                    <WebView source={{ uri: event.imageUrl }} style={styles.image} />
                  </Text>
                ) : (
                  <ActivityIndicator size="large" color="#0000ff" />
                )}
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>
        <View style={styles.carouselContainer}>
          <Carousel
            ref={carouselRef}
            width={width}
            height={width / 2}
            data={newEvent}
            onSnapToItem={(index) => {
              setCurrentSlideIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text style={styles.itemText}>{`Latitude and Longitude: ${item.coords}`}</Text>
                <Text style={styles.itemText}>{`Address: ${item.address}`}</Text>
                <Text style={styles.itemText}>{`Time: ${new Date(item.time.seconds * 1000).toLocaleString()}`}</Text>
                <Text style={styles.itemText}>{`Description: ${item.description}`}</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff', // Add background color to header
    zIndex: 1, // Ensure the header stays above the map
  },
  menuStyles: {
    flexDirection: "row",
    justifyContent: "flex-end", // This aligns items to the right
  },
  mapContainer: {
    flex: 1, // Take the remaining space after the header
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  picker: {
    height: 50,
    width: 150,
  },
  carouselContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
  },
  carouselItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  carouselText: {
    fontSize: 30,
    textAlign: "center",
  },
  itemContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  itemText: {
    fontSize: 16,
    textAlign: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default HomeScreen;