"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";

export interface DemoCardProps {
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  badgeText?: string;
  onPress?: () => void;
}

function getFontFamily(mobileFont: string) {
  return Platform.OS === "web" ? `${mobileFont}, Poppins, sans-serif` : mobileFont;
}

export default function DemoCard({
  title,
  description,
  href,
  disabled = false,
  badgeText,
  onPress,
}: DemoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    if (onPress && !disabled) {
      onPress();
    }
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={handlePress}
      // @ts-ignore
      href={Platform.OS === "web" && !disabled ? href : undefined}
      onHoverIn={() => !disabled && setIsHovered(true)}
      onHoverOut={() => !disabled && setIsHovered(false)}
      style={({ pressed }) => [
        styles.card,
        disabled ? styles.cardDisabled : styles.cardActive,
        isHovered && styles.cardHovered,
        pressed && !disabled && styles.cardPressed,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.cardHeading}>{title}</Text>
        <Text style={styles.cardText}>{description}</Text>
        
        {badgeText && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#e8edf4",
    borderRadius: 15,
    padding: 22,
    borderWidth: 1.5,
    borderColor: "transparent",
    ...Platform.select({
      web: {
        transition: "background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, outline 0.2s ease",
      },
    }),
  },
  cardActive: {
    ...Platform.select({
      web: {
        cursor: "pointer" as any,
      },
    }),
  },
  cardDisabled: {
    opacity: 0.55,
    ...Platform.select({
      web: {
        cursor: "not-allowed" as any,
      },
    }),
  },
  cardHovered: Platform.select({
    web: {
      backgroundColor: "#d6dde8",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
      outlineWidth: 1.5,
      outlineStyle: "solid",
      outlineColor: "#003d7a",
      borderColor: "#003d7a",
    },
    default: {},
  }),
  cardPressed: {
    opacity: 0.9,
  },
  cardHeading: {
    fontFamily: getFontFamily("Poppins_700Bold"),
    fontSize: 17,
    color: "#003d7a",
    marginBottom: 10,
    fontWeight: "700",
  },
  cardText: {
    fontFamily: getFontFamily("Poppins_400Regular"),
    fontSize: 13,
    color: "#3a5a80",
    lineHeight: 20,
    fontWeight: "400",
  },
  badge: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 61, 122, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: getFontFamily("Poppins_600SemiBold"),
    fontSize: 10,
    color: "#ffffff",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
});
