import { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
} from "react-native";
import { useNotifications, NotificationItem } from "../../store/notificationsStore";

interface SwipeableNotificationItemProps {
  item: NotificationItem;
  onTap: () => void;
  onMarkUnread: () => void;
}

function SwipeableNotificationItem({ item, onTap, onMarkUnread }: SwipeableNotificationItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isSwipeOpen = useRef(false);

  const reset = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start(() => {
      isSwipeOpen.current = false;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only set pan responder if horizontal drag is greater than vertical drag
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        translateX.setOffset(isSwipeOpen.current ? 100 : 0);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swiping to the right (positive dx) to reveal action on the left
        const newX = gestureState.dx;
        if (newX < 0) {
          translateX.setValue(0);
        } else {
          // Add some resistance if dragged too far
          const drag = newX > 140 ? 140 + (newX - 140) * 0.35 : newX;
          translateX.setValue(drag);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        
        const threshold = 80;
        
        // Large pull past 160px triggers action directly
        if (gestureState.dx > 160) {
          onMarkUnread();
          reset();
        } else if (gestureState.dx > threshold) {
          // Snap open
          Animated.spring(translateX, {
            toValue: 100,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start(() => {
            isSwipeOpen.current = true;
          });
        } else {
          // Snap closed
          reset();
        }
      },
    })
  ).current;

  const handlePress = () => {
    if (isSwipeOpen.current) {
      reset();
    } else if (item.unread) {
      onTap();
    }
  };

  const handleLongPress = () => {
    if (!isSwipeOpen.current) {
      Animated.spring(translateX, {
        toValue: 100,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start(() => {
        isSwipeOpen.current = true;
      });
    }
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Background action button revealed behind card */}
      <View style={styles.actionBackground}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            onMarkUnread();
            reset();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>{"Mark\nunread"}</Text>
        </TouchableOpacity>
      </View>

      {/* Foreground card */}
      <Animated.View
        style={[
          styles.foregroundCard,
          { transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.cardInner,
            item.unread ? styles.unreadCard : styles.readCard,
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.8}
        >
          {/* Status Indicator Dot */}
          <View
            style={[
              styles.dot,
              item.unread ? styles.unreadDot : styles.readDot,
            ]}
          />

          {/* Notification Content */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.cardTitle,
                !item.unread && { fontFamily: "Poppins_400Regular", fontWeight: "400" },
              ]}
            >
              {item.title}
            </Text>
            <Text style={styles.cardSubtitle}>
              {item.project} • {item.time}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function NotificationsScreen() {
  const { notifications, markAllAsRead, markAsRead, markAsUnread } = useNotifications();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
          <Text style={styles.markReadLink}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <View style={styles.listContainer}>
        {notifications.map((item) => (
          <SwipeableNotificationItem
            key={item.id}
            item={item}
            onTap={() => markAsRead(item.id)}
            onMarkUnread={() => markAsUnread(item.id)}
          />
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#f8fafc", // Soft off-white page background
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#0f2d59", // Premium dark blue header matching the branding
    fontWeight: "700",
  },
  markReadLink: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#2563eb", // Vibrant blue
    fontWeight: "600",
  },
  listContainer: {
    gap: 12,
  },
  swipeContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden", // Clean rounded corners clipping swiped background
  },
  actionBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 100, // Matches the snap value
    backgroundColor: "#3b82f6", // Royal blue for unread state trigger
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  actionButton: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
  },
  foregroundCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: "#eff6ff", // Very soft blue highlight
    borderColor: "#dbeafe", // Soft blue border
  },
  readCard: {
    backgroundColor: "#ffffff",
    borderColor: "#f1f5f9", // Very light gray border
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  unreadDot: {
    backgroundColor: "#2563eb", // Bright active blue dot
  },
  readDot: {
    backgroundColor: "#cbd5e1", // Muted gray dot
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#1e293b", // Slate-800 for high readability
    fontWeight: "600",
    lineHeight: 20,
  },
  cardSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#64748b", // Slate-500 for secondary text
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#64748b",
  },
});
