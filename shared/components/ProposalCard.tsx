"use client";

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
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (onToggleFollow) {
      onToggleFollow(card.id);
    }
    // The mouse hasn't actually left the button, but the follow state just
    // flipped underneath it. Clear the hover flag so the button falls back
    // to its resting label ("Following") instead of jumping straight to the
    // next-state hover label ("Unfollow"). It only re-arms once the pointer
    // genuinely leaves and re-enters (onHoverIn fires again below).
    setIsHovered(false);
  };

  const showFollowButton =
    typeof onToggleFollow === "function" && (isFollowing || isCardHovered);

  // Derive the follow button's label/variant once so the JSX below doesn't
  // repeat the isFollowing/isHovered branching three separate times.
  const followButtonLabel = isFollowing
    ? isHovered
      ? "✕ Unfollow"
      : "✓ Following"
    : "+ Follow";
  const followButtonHoverStyle = isHovered
    ? isFollowing
      ? styles.followingHover // previewing "Unfollow"
      : styles.unfollowingHover // previewing "Follow"
    : null;
  const followButtonHoverTextStyle =
    isHovered && !isFollowing ? styles.unfollowingHoverText : null;

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

        {/* Hover overlay – dims only the photo area */}
        {isCardHovered && (
          <View style={styles.hoverOverlay}>
            <Text style={styles.hoverOverlayText}>
              Click To View Project Detail
            </Text>
          </View>
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
      </View>

      {/* Follow button – rendered last so it's always on top of the overlay */}
      {showFollowButton && (
        <Pressable
          onPress={handleFollowPress}
          onHoverIn={() => {
            // Button hover is contained within card hover: entering the
            // button must also count as hovering the card so the card's
            // highlight/overlay never drops out while over the button.
            setIsHovered(true);
            setIsCardHovered(true);
          }}
          onHoverOut={() => setIsHovered(false)}
          style={({ pressed }) => [
            styles.followButton,
            isFollowing ? styles.followingButton : styles.unfollowingButton,
            followButtonHoverStyle,
            pressed && styles.followButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.followButtonText,
              isFollowing ? styles.followingButtonText : styles.unfollowingButtonText,
              followButtonHoverTextStyle,
            ]}
          >
            {followButtonLabel}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

function getFontFamily(mobileFont: string) {
  return Platform.OS === "web" ? `${mobileFont}, Poppins, sans-serif` : mobileFont;
}

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
        transition: "background-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, border-color 0.15s ease-in-out",
        cursor: "pointer",
      },
    }),
  },
  cardPressed: {
    opacity: 0.9,
  },
  cardHovered: Platform.select({
    web: {
      boxShadow: "0 6px 12px -3px rgba(0, 0, 0, 0.08), 0 3px 5px -2px rgba(0, 0, 0, 0.04)",
      borderColor: "#2563eb",
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
  // Shown on the Following button when hovered, previewing "Unfollow".
  followingHover: {
    backgroundColor: "#CD481B",
    borderColor: "#CD481B",
  },
  // Shown on the Follow button when hovered, previewing the follow action.
  unfollowingHover: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  unfollowingHoverText: {
    color: "#2563eb",
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
    flex: 1,
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
    marginBottom: 0,
  },
  hoverOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: "rgba(13, 34, 64, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  hoverOverlayText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#ffffff",
    fontFamily: getFontFamily("Poppins_400Regular"),
    textAlign: "center",
    letterSpacing: 0.3,
    opacity: 0.6,
  },
});
