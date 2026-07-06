import { useState } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";

export interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
}

export default function FollowButton({
  isFollowing,
  onPress,
}: FollowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = (e: any) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    onPress();
  };

  const getFontFamily = (mobileFont: string) => {
    return Platform.OS === "web" ? `${mobileFont}, Poppins, sans-serif` : mobileFont;
  };

  // Determine button styles based on state
  let buttonStyle = styles.unfollowing;
  let textStyle = styles.unfollowingText;
  let buttonText = "+ Follow";

  if (isFollowing) {
    if (isHovered) {
      buttonStyle = styles.unfollowHover;
      textStyle = styles.unfollowHoverText;
      buttonText = "✕ Unfollow";
    } else {
      buttonStyle = styles.following;
      textStyle = styles.followingText;
      buttonText = "✓ Following";
    }
  } else if (isHovered) {
    buttonStyle = styles.unfollowingHover;
    textStyle = styles.unfollowingText; // Keep text color same
  }

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, textStyle, { fontFamily: getFontFamily("Poppins_600SemiBold") }]}>
        {buttonText}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 9999,
    paddingVertical: 6,
    borderWidth: 1.5,
    width: 106, // Fixed width so size doesn't change between states
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease",
      },
    }),
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  // Unfollowing State (+ Follow)
  unfollowing: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  unfollowingHover: {
    backgroundColor: "#f3f4f6", // Slightly shaded gray when hovered
    borderColor: "#d1d5db",
  },
  unfollowingText: {
    color: "#111827",
  },
  // Following State (✓ Following)
  following: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  followingText: {
    color: "#ffffff",
  },
  // Unfollow State on Hover (✕ Unfollow)
  unfollowHover: {
    backgroundColor: "#fef2f2", // Soft rose/red shade
    borderColor: "#dc2626",     // Red border
  },
  unfollowHoverText: {
    color: "#dc2626",           // Red text
  },
});
