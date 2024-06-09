import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';

const NEWS_API_KEY = 'vz1gAl2FAjfXgh3Aif66eAOKwNiY1O3r'; // Replace with your NewsAPI key

const NewsScreen = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=crime&fq=glocations:("NEW YORK CITY")&begin_date=2024-05-24&api-key=${NEWS_API_KEY}`);
      const data = await response.json();

      if (data.response && data.response.docs) {
        setArticles(data.response.docs);
      } else {
        setArticles([]);
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const openArticleUrl = (url) => {
    Linking.openURL(url);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openArticleUrl(item.web_url)} style={styles.articleContainer}>
      <Image style={styles.image} source={{ uri: getImageUrl(item) }} />
      <View style={styles.textContainer}>
        <Text style={styles.headline}>{item.headline.main}</Text>
        <Text style={styles.description}>{truncateDescription(item.snippet)}</Text>
        <Text style={styles.pubDate}>{formatDate(item.pub_date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const getImageUrl = (item) => {
    if (item.multimedia && item.multimedia.length > 0) {
      return `https://www.nytimes.com/${item.multimedia[0].url}`;
    }
    // Return a placeholder image URL if no image found
    return 'https://via.placeholder.com/150';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Format to local time
  };

  const truncateDescription = (description) => {
    const maxLength = 100;
    if (description.length > maxLength) {
      return `${description.substring(0, maxLength)}...`;
    }
    return description;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Latest Relevant News</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={articles}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16247d',
    marginBottom: 20,
  },
  articleContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
  },
  headline: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#16247d',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  pubDate: {
    fontSize: 12,
    color: '#666',
  },
  flatListContainer: {
    paddingBottom: 20,
  },
});

export default NewsScreen;
