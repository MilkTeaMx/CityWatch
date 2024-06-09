import { FlatList, SafeAreaView, Text, StyleSheet, StatusBar, View, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { onSnapshot, collection } from 'firebase/firestore';
import { FIRESTORE_DB } from '../FirebaseConfig';
import { List } from 'react-native-paper';

const ArchivesScreen = () => {
    // Firebase States
    const [newEvent, setEvent] = useState([]);

    const db = FIRESTORE_DB;

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "reports"), (snapshot) => {
            const newEvents = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                const formattedTime = data.time.toDate().toLocaleString(); // Convert timestamp to string
                newEvents.push({
                    id: doc.id, // Ensure each event has a unique id
                    coords: [data.latlng.latitude, data.latlng.longitude],
                    address: data.address,
                    time: formattedTime, // Use formatted time
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

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={newEvent}
                keyExtractor={item => item.id}
                renderItem={({ item }) =>
                    <View style={styles.card}>
                        <View style={styles.item}>
                            <Text style={styles.timestamp}>{item.time}</Text>
                            <Text style={styles.concentration}>Latitude, Longitude: {item.coords.join(', ')}</Text>
                            <Text style={styles.concentration}>Address: {item.address}</Text>
                        </View>
                        <View style={styles.gptAnalysisContainer}>
                            <List.Accordion
                                title="Description"
                                titleStyle={styles.accordionTitle}
                                left={props => <List.Icon {...props} icon="information" />}
                            >
                                <List.Item title={item.description} titleStyle={styles.analysisText} />
                            </List.Accordion>
                        </View>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingTop: StatusBar.currentHeight || 0,
    },
    card: {
        backgroundColor: '#ffffff',
        margin: 10,
        borderRadius: 10,
        borderColor: '#dcdcdc',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    item: {
        padding: 20,
        borderBottomColor: '#dcdcdc',
        borderBottomWidth: 1,
    },
    timestamp: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    concentration: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    gptAnalysisContainer: {
        padding: 10,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    analysisText: {
        fontSize: 14,
        color: '#666',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
});

export default ArchivesScreen;
