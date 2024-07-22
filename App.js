import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
  listAll,
  getDownloadURL,
} from "firebase/storage";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAVnJdRmTffPfllQBrHrOqNm33bOcspClA",
  authDomain: "reactnative-ea0b9.firebaseapp.com",
  projectId: "reactnative-ea0b9",
  storageBucket: "reactnative-ea0b9.appspot.com",
  messagingSenderId: "431470681215",
  appId: "1:431470681215:web:c3d3fa6e0a48727619334a",
  measurementId: "G-F81HGXVR02",
};

const app = initializeApp(firebaseConfig);

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  const storage = getStorage(app);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const listRef = ref(storage, "images/");
    const res = await listAll(listRef);
    const urls = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { uri: url, path: itemRef.fullPath };
      })
    );
    setImages(urls);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      const source = { uri: result.assets[0].uri };
      setImage(source);
    }
  };

  const uploadImage = async () => {
    setUploading(true);
    const response = await fetch(image.uri);
    const blob = await response.blob();
    const filename = image.uri.substring(image.uri.lastIndexOf("/") + 1);
    const imageRef = ref(storage, `images/${filename}`);
    try {
      await uploadBytes(imageRef, blob);
      Alert.alert("Photo uploaded!");
      setImage(null);
      fetchImages();
    } catch (e) {
      console.log(e);
    }
    setUploading(false);
  };

  const deleteImage = async (imagePath) => {
    const imageRef = ref(storage, imagePath);
    try {
      await deleteObject(imageRef);
      Alert.alert("Photo deleted!");
      fetchImages();
    } catch (e) {
      console.log(e);
    }
  };

  const renderImage = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item.uri }} style={styles.image} />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteImage(item.path)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick an image</Text>
      </TouchableOpacity>
      {image && (
        <View>
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.button} onPress={uploadImage}>
            <Text style={styles.buttonText}>
              {uploading ? "Uploading..." : "Upload Image"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={images}
        renderItem={renderImage}
        keyExtractor={(item) => item.uri}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    margin: 20,
  },
  imageContainer: {
    margin: 10,
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 5,
    marginTop: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default ImageUploader;
