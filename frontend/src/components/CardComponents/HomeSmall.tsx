import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { ImageSourcePropType } from "react-native";
const { width, height } = Dimensions.get("window");

const HomeSmall: React.FC<{
  album: { title: string; singer: string; image: any };
}> = ({
  album = { title: "", singer: "", image: require("./assets/sample1.png") },
}) => {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Image source={album.image} style={styles.image} />
        <View style={styles.musicinfo}>
          <View style={styles.musictext}>
            <Text
              style={[styles.text, styles.title]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {album.title}
            </Text>
            <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
              {album.singer}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconbox}
            onPress={() => setLiked(!liked)}
          >
            {liked ? (
              <AntDesign name="heart" style={styles.icon} />
            ) : (
              <AntDesign name="hearto" style={styles.icon} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeSmall;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    width: width * 0.3,
    height: "100%",
    marginHorizontal: 3,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 20,
    resizeMode: "contain",
  },
  infoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    // marginHorizontal: "5%",
  },
  musicinfo: {
    marginTop: "3%",
    flex: 0.3,
    flexDirection: "row",
    // maxWidth: "50%",
  },
  musictext: {
    flex: 1,
    Width: "70%",
  },
  text: {
    width: "100%",
    fontSize: 15,
    overflow: "hidden",
    color: "white",
  },
  title: {
    marginBottom: 1,
    fontWeight: "bold",
    fontSize: 14,
  },
  iconbox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    Width: "30%",
  },
  icon: {
    fontSize: 20,
    color: "red",
  },
});