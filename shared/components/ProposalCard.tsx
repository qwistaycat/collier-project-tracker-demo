import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Platform,
} from "react-native";
import type { ProposalCard as ProposalCardType } from "../data/proposals";

export interface ProposalCardProps {
  card: ProposalCardType;
  isFollowing?: boolean;
  onToggleFollow?: (id: string) => void;
  onPress?: () => void;
}

export default function ProposalCard({
  card,
  isFollowing = false,
  onToggleFollow,
  onPress,
}: ProposalCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const handleFollowPress = (e: any) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    if (onToggleFollow) {
      onToggleFollow(card.id);
    }
  };

  const showFollowButton = typeof onToggleFollow === "function";

  return (
    <Pressable
      onPress={onPress}
      // On Web, react-native-web will render this as a link if href is provided
      // @ts-ignore
      href={Platform.OS === "web" ? card.link : undefined}
      onHoverIn={() => setIsCardHovered(true)}
      onHoverOut={() => setIsCardHovered(false)}
      style={({ pressed }) => [
        styles.card,
        isCardHovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: card.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {showFollowButton && (
          <Pressable
            onPress={handleFollowPress}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            style={({ pressed }) => [
              styles.followButton,
              isFollowing ? styles.followingButton : styles.unfollowingButton,
              isHovered && isFollowing && styles.unfollowButtonHover,
              pressed && styles.followButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing ? styles.followingButtonText : styles.unfollowingButtonText,
              ]}
            >
              {isFollowing
                ? isHovered
                  ? "✕ Unfollow"
                  : "✓ Following"
                : "+ Follow"}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.meta}>
          <Text style={styles.category}>{card.functionalCategory}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.department} numberOfLines={1}>
            {card.department}
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.updated}>{card.updated}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {card.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {card.description}
        </Text>

        <View
          style={[
            styles.detailsButton,
            isCardHovered && styles.detailsButtonHovered,
          ]}
        >
          <Text
            style={[
              styles.detailsButtonText,
              isCardHovered && styles.detailsButtonTextHovered,
            ]}
          >
            View Project Details
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const getFontFamily = (mobileFont: string) => {
  return Platform.OS === "web" ? "inherit" : mobileFont;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      },
      android: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      },
      web: {
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        transition: "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
        cursor: "pointer",
      },
    }),
  },
  cardPressed: {
    opacity: 0.9,
    ...Platform.select({
      web: {
        transform: [{ scale: 0.99 }],
      },
    }),
  },
  cardHovered: Platform.select({
    web: {
      transform: [{ translateY: -4 }],
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    },
    default: {},
  }),
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  followButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    borderRadius: 9999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      },
    }),
  },
  unfollowingButton: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  followingButton: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  unfollowButtonHover: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  followButtonPressed: {
    opacity: 0.85,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: getFontFamily("Poppins_600SemiBold"),
  },
  unfollowingButtonText: {
    color: "#111827",
  },
  followingButtonText: {
    color: "#ffffff",
  },
  body: {
    padding: 14,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  category: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
    fontFamily: getFontFamily("Poppins_600SemiBold"),
  },
  department: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
    fontFamily: getFontFamily("Poppins_500Medium"),
    flexShrink: 1,
  },
  dot: {
    fontSize: 11,
    color: "#9ca3af",
    marginHorizontal: 6,
    fontFamily: getFontFamily("Poppins_400Regular"),
  },
  updated: {
    fontSize: 11,
    color: "#9ca3af",
    fontFamily: getFontFamily("Poppins_400Regular"),
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    fontFamily: getFontFamily("Poppins_600SemiBold"),
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    fontFamily: getFontFamily("Poppins_400Regular"),
  },
  detailsButton: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0d2240",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        transition: "background-color 0.15s ease, border-color 0.15s ease",
      },
    }),
  },
  detailsButtonHovered: {
    backgroundColor: "#0d2240",
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0d2240",
    fontFamily: getFontFamily("Poppins_600SemiBold"),
    ...Platform.select({
      web: {
        transition: "color 0.15s ease",
      },
    }),
  },
  detailsButtonTextHovered: {
    color: "#ffffff",
  },
});
