import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useLocalSearchParams } from "expo-router";
import {
  proposalData,
  timelineStages,
  discussionData,
  type Comment,
  type Reply,
} from "../../../../shared/data/proposals";

// Local storage key for following
const FOLLOW_KEY = "collier_followed";

export default function ProposalDetailScreen() {
  const params = useLocalSearchParams();
  const proposalId = (params.id as string) || "hilltop-park";

  // State for following
  const [isFollowing, setIsFollowing] = useState(false);

  // Tabs: 'overview', 'timeline', 'feedback'
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "feedback">("overview");

  // Feedback tabs: 'private', 'public'
  const [feedbackTab, setFeedbackTab] = useState<"private" | "public">("private");

  // Discussion comments state
  const [privateText, setPrivateText] = useState("");
  const [publicText, setPublicText] = useState("");
  const [replyTarget, setReplyTarget] = useState<{
    commentIdx: number;
    replyIdx: number | null;
  } | null>(null);
  const [replyText, setReplyText] = useState("");

  const [privateFeedback, setPrivateFeedback] = useState<
    { time: string; message: string }[]
  >(discussionData.private.pastFeedback);

  const [publicComments, setPublicComments] = useState<Comment[]>(
    discussionData.public.comments
  );

  const [liveViewers, setLiveViewers] = useState(discussionData.public.viewCount);

  // Load follow state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(FOLLOW_KEY);
        if (stored) {
          const list = JSON.parse(stored) as string[];
          setIsFollowing(list.includes(proposalId));
        }
      } catch (e) {
        console.error("Failed to load followed status", e);
      }
    }
  }, [proposalId]);

  // Fluctuating viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(1, prev + delta);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Toggle follow state
  const handleToggleFollow = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(FOLLOW_KEY);
        let list: string[] = stored ? JSON.parse(stored) : [];
        if (list.includes(proposalId)) {
          list = list.filter((id) => id !== proposalId);
          setIsFollowing(false);
        } else {
          list.push(proposalId);
          setIsFollowing(true);
        }
        window.localStorage.setItem(FOLLOW_KEY, JSON.stringify(list));
      } catch (e) {
        console.error("Failed to save follow status", e);
      }
    } else {
      setIsFollowing(!isFollowing);
    }
  };

  // Submit private feedback
  const handleSubmitPrivate = () => {
    if (!privateText.trim()) return;
    const now = new Date();
    const timeStr =
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) +
      " " +
      now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    setPrivateFeedback((prev) => [
      { time: timeStr, message: privateText.trim() },
      ...prev,
    ]);
    setPrivateText("");
  };

  // Submit public feedback
  const handleSubmitPublic = () => {
    if (!publicText.trim()) return;
    const newComment: Comment = {
      user: "You",
      avatarColor: "#22c55e",
      timeAgo: "just now",
      message: publicText.trim(),
      replies: [],
    };
    setPublicComments((prev) => [newComment, ...prev]);
    setPublicText("");
  };

  // Submit reply to a public comment thread
  const handleSendReply = (idx: number) => {
    if (!replyText.trim()) return;

    // Parse @username mention from the start of the message
    let replyTo: string | undefined;
    let cleanMessage = replyText.trim();
    const mentionMatch = cleanMessage.match(/^@(\S+)\s*/);
    if (mentionMatch) {
      replyTo = mentionMatch[1];
      cleanMessage = cleanMessage.slice(mentionMatch[0].length);
    }

    const newReply: Reply = {
      user: "You",
      avatarColor: "#22c55e",
      timeAgo: "just now",
      replyTo,
      message: cleanMessage,
    };

    setPublicComments((prev) =>
      prev.map((comment, i) =>
        i === idx
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      )
    );

    setReplyTarget(null);
    setReplyText("");
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Hero Image at the top */}
      <Image
        source={{ uri: proposalData.heroImage }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      {/* Hero Info */}
      <View style={styles.heroContainer}>
        <Text style={styles.categoryLabel}>Parks & Green Spaces</Text>
        <Text style={styles.projectTitle}>{proposalData.title}</Text>
        <Text style={styles.lastUpdatedText}>
          Last updated {proposalData.lastUpdated}
        </Text>

        {/* Following Pill Button */}
        <TouchableOpacity
          onPress={handleToggleFollow}
          style={[
            styles.followBtn,
            isFollowing ? styles.followingBtn : styles.unfollowBtn,
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.followBtnContent}>
            <SymbolView
              name={isFollowing ? "checkmark" : "plus"}
              size={14}
              tintColor={isFollowing ? "#ffffff" : "#2563eb"}
            />
            <Text
              style={[
                styles.followBtnText,
                isFollowing ? styles.followingBtnText : styles.unfollowBtnText,
              ]}
            >
              {isFollowing ? "Following" : "Follow Project"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Segments / Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "overview" && styles.activeTabButton]}
            onPress={() => setActiveTab("overview")}
          >
            <Text
              style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "timeline" && styles.activeTabButton]}
            onPress={() => setActiveTab("timeline")}
          >
            <Text
              style={[styles.tabText, activeTab === "timeline" && styles.activeTabText]}
            >
              Timeline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === "feedback" && styles.activeTabButton]}
            onPress={() => setActiveTab("feedback")}
          >
            <Text
              style={[styles.tabText, activeTab === "feedback" && styles.activeTabText]}
            >
              Feedback
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Subviews */}
      {activeTab === "overview" && (
        <View style={styles.subview}>
          {/* Overview text */}
          <Text style={styles.sectionBody}>{proposalData.description}</Text>

          {/* Sponsor */}
          <View style={styles.sponsorBlock}>
            <Text style={styles.sponsorHeader}>SPONSOR</Text>
            <Text style={styles.sponsorValue}>Collier Township Parks Department</Text>
          </View>

          {/* Duration & Cost Row */}
          <View style={styles.dualCardRow}>
            <View style={styles.dualCard}>
              <Text style={styles.dualCardLabel}>DURATION</Text>
              <Text style={styles.dualCardValue}>Jan 2026 – Feb 2027</Text>
            </View>
            <View style={styles.dualCard}>
              <Text style={styles.dualCardLabel}>TOTAL COST</Text>
              <Text style={styles.dualCardValue}>$1.2 million</Text>
            </View>
          </View>

          {/* Funding Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsCardTitle}>Funding</Text>
            <Text style={styles.detailsCardBody}>{proposalData.funding}</Text>

            <Text style={[styles.detailsCardTitle, { marginTop: 16 }]}>Details</Text>
            <Text style={styles.detailsCardBody}>{proposalData.details}</Text>
          </View>

          {/* External Links */}
          <View style={styles.linkButtonsRow}>
            <TouchableOpacity style={styles.outlineLinkBtn} activeOpacity={0.7}>
              <SymbolView name="link" size={14} tintColor="#4b5563" />
              <Text style={styles.outlineLinkText}>Link to Project</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineLinkBtn} activeOpacity={0.7}>
              <SymbolView name="link" size={14} tintColor="#4b5563" />
              <Text style={styles.outlineLinkText}>Meeting Notes</Text>
            </TouchableOpacity>
          </View>

          {/* Actual Map on Web, Mock map on native */}
          <View style={styles.mapContainer}>
            {Platform.OS === "web" ? (
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=-80.18%2C40.32%2C-79.98%2C40.42&layer=mapnik"
                style={{
                  width: "100%",
                  height: 300,
                  border: "none",
                  borderRadius: 12,
                }}
                title="Project Location Map"
              />
            ) : (
              <View style={styles.mapBox}>
                <SymbolView name="mappin.circle.fill" size={28} tintColor="#16a34a" />
                <Text style={styles.mapText}>Collier Township, PA</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {activeTab === "timeline" && (
        <View style={styles.subview}>
          {/* Vertical Timeline list */}
          <View style={styles.timelineList}>
            {timelineStages.map((stage, idx) => {
              const isLast = idx === timelineStages.length - 1;
              const isCompleted = stage.status === "completed";
              const isCurrent = stage.status === "current";

              return (
                <View key={idx} style={styles.timelineRow}>
                  {/* Left line & indicator */}
                  <View style={styles.timelineLeftColumn}>
                    <View
                      style={[
                        styles.indicatorCircle,
                        isCompleted && styles.completedIndicator,
                        isCurrent && styles.currentIndicator,
                        stage.status === "future" && styles.futureIndicator,
                      ]}
                    >
                      {isCompleted ? (
                        <SymbolView name="checkmark" size={10} tintColor="#ffffff" />
                      ) : isCurrent ? (
                        <View style={styles.currentIndicatorInner} />
                      ) : null}
                    </View>
                    {!isLast && <View style={styles.verticalLine} />}
                  </View>

                  {/* Right description card */}
                  <View style={styles.timelineContentCard}>
                    <View style={styles.timelineCardHeaderRow}>
                      <Text style={styles.timelineCardTitle}>{stage.label}</Text>
                      {isCurrent && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>CURRENT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.timelineCardDate}>{stage.date}</Text>
                    <Text style={styles.timelineCardDesc}>{stage.description}</Text>

                    {/* Stage Bullets */}
                    {stage.bullets && stage.bullets.length > 0 && (
                      <View style={styles.bulletsContainer}>
                        {stage.bullets.map((bullet, bIdx) => (
                          <View key={bIdx} style={styles.bulletRow}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText}>{bullet}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {activeTab === "feedback" && (
        <View style={styles.subview}>
          {/* Sub tab navigation */}
          <View style={styles.feedbackSegmentBar}>
            <TouchableOpacity
              style={[
                styles.feedbackSegmentButton,
                feedbackTab === "private" && styles.activeFeedbackSegmentButton,
              ]}
              onPress={() => setFeedbackTab("private")}
            >
              <Text
                style={[
                  styles.feedbackSegmentText,
                  feedbackTab === "private" && styles.activeFeedbackSegmentText,
                ]}
              >
                Private Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.feedbackSegmentButton,
                feedbackTab === "public" && styles.activeFeedbackSegmentButton,
              ]}
              onPress={() => setFeedbackTab("public")}
            >
              <Text
                style={[
                  styles.feedbackSegmentText,
                  feedbackTab === "public" && styles.activeFeedbackSegmentText,
                ]}
              >
                Community Forum
              </Text>
            </TouchableOpacity>
          </View>

          {feedbackTab === "private" ? (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackNoticeText}>
                Every comment is read by the township and weighed into decision-making.
                Replies appear in your notifications.
              </Text>

              {/* TextInput */}
              <TextInput
                style={styles.commentInput}
                placeholder="Leave a message..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={privateText}
                onChangeText={setPrivateText}
              />

              <TouchableOpacity
                style={styles.feedbackSubmitBtn}
                onPress={handleSubmitPrivate}
                activeOpacity={0.8}
              >
                <Text style={styles.feedbackSubmitText}>Submit Private Feedback</Text>
              </TouchableOpacity>

              {/* Past feedback */}
              <Text style={styles.feedbackSubheader}>Your Past Feedback</Text>
              <View style={styles.pastFeedbackList}>
                {privateFeedback.map((item, idx) => (
                  <View key={idx} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={[styles.avatar, { backgroundColor: "#22c55e" }]}>
                        <Text style={styles.avatarText}>Y</Text>
                      </View>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentUser}>You</Text>
                        <Text style={styles.commentTime}>{item.time}</Text>
                      </View>
                    </View>
                    <View style={styles.commentBubble}>
                      <Text style={styles.commentText}>{item.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackNoticeText}>
                See how your neighbors feel about this project. Any public comments
                containing inappropriate or irrelevant material will be removed.
              </Text>

              {/* TextInput */}
              <TextInput
                style={styles.commentInput}
                placeholder="Leave us a message..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={publicText}
                onChangeText={setPublicText}
              />

              <View style={styles.publicActionRow}>
                {/* Full-width submit button */}
                <TouchableOpacity
                  style={styles.feedbackSubmitBtn}
                  onPress={handleSubmitPublic}
                  activeOpacity={0.8}
                >
                  <Text style={styles.feedbackSubmitText}>Post Public Feedback</Text>
                </TouchableOpacity>
              </View>

              {/* Public comments header with view count */}
              <View style={styles.publicHeaderRow}>
                <Text style={styles.feedbackSubheader}>Public Feedback</Text>
                <View style={styles.viewCountContainer}>
                  {/* Eye Icon next to viewers count */}
                  <SymbolView
                    name={{ ios: "eye.fill", android: "visibility", web: "visibility" }}
                    size={14}
                    tintColor="#64748b"
                  />
                  <Text style={styles.viewCountText}>{liveViewers}</Text>
                </View>
              </View>

              {/* Comments list */}
              <View style={styles.publicCommentsList}>
                {publicComments.map((comment, idx) => {
                  const isReplyingToComment =
                    replyTarget &&
                    replyTarget.commentIdx === idx &&
                    replyTarget.replyIdx === null;

                  return (
                    <View key={idx} style={styles.commentThread}>
                      {/* Top-Level Comment */}
                      <View style={styles.commentCard}>
                        <View style={styles.commentHeader}>
                          <View
                            style={[
                              styles.avatar,
                              { backgroundColor: comment.avatarColor || "#3b82f6" },
                            ]}
                          >
                            <Text style={styles.avatarText}>
                              {comment.user.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.commentMeta}>
                            <Text style={styles.commentUser}>{comment.user}</Text>
                            <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                          </View>
                        </View>
                        <View style={styles.commentBubble}>
                          <Text style={styles.commentText}>{comment.message}</Text>
                        </View>
                        {/* Reply button */}
                        <TouchableOpacity
                          style={styles.replyButton}
                          onPress={() => {
                            setReplyTarget({ commentIdx: idx, replyIdx: null });
                            setReplyText("@" + comment.user + " ");
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.replyButtonText}>↩ Reply</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Reply Editor Form directly under the Top-level comment */}
                      {isReplyingToComment && (
                        <View style={styles.replyFormContainer}>
                          <TextInput
                            style={styles.replyInput}
                            placeholder="Write a reply..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            value={replyText}
                            onChangeText={setReplyText}
                          />
                          <View style={styles.replyActionButtons}>
                            <TouchableOpacity
                              style={styles.replyCancelBtn}
                              onPress={() => {
                                setReplyTarget(null);
                                setReplyText("");
                              }}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.replyCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.replySendBtn}
                              onPress={() => handleSendReply(idx)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.replySendText}>Send Reply</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {/* Replies */}
                      {comment.replies &&
                        comment.replies.map((reply, rIdx) => {
                          const isReplyingToReply =
                            replyTarget &&
                            replyTarget.commentIdx === idx &&
                            replyTarget.replyIdx === rIdx;

                          return (
                            <View key={rIdx} style={styles.commentThreadInner}>
                              <View style={styles.replyRow}>
                                <View style={styles.replyIndent} />
                                <View style={[styles.commentCard, { flex: 1 }]}>
                                  <View style={styles.commentHeader}>
                                    <View
                                      style={[
                                        styles.avatar,
                                        { backgroundColor: reply.avatarColor || "#2563eb" },
                                      ]}
                                    >
                                      <Text style={styles.avatarText}>
                                        {reply.user.charAt(0).toUpperCase()}
                                      </Text>
                                    </View>
                                    <View style={styles.commentMeta}>
                                      <View style={styles.usernameRow}>
                                        <Text style={styles.commentUser}>{reply.user}</Text>
                                        {reply.isOfficial && (
                                          <View style={styles.officialBadge}>
                                            <Text style={styles.officialBadgeText}>
                                              OFFICIAL
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                      <Text style={styles.commentTime}>{reply.timeAgo}</Text>
                                    </View>
                                  </View>
                                  <View style={styles.commentBubble}>
                                    <Text style={styles.commentText}>
                                      {reply.replyTo && (
                                        <Text style={styles.mentionText}>
                                          @{reply.replyTo}{" "}
                                        </Text>
                                      )}
                                      {reply.message}
                                    </Text>
                                  </View>
                                  {/* Reply button */}
                                  <TouchableOpacity
                                    style={styles.replyButton}
                                    onPress={() => {
                                      setReplyTarget({ commentIdx: idx, replyIdx: rIdx });
                                      setReplyText("@" + reply.user + " ");
                                    }}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={styles.replyButtonText}>↩ Reply</Text>
                                  </TouchableOpacity>

                                  {/* Reply Editor Form directly under the nested reply */}
                                  {isReplyingToReply && (
                                    <View style={[styles.replyFormContainer, { marginLeft: 0 }]}>
                                      <TextInput
                                        style={styles.replyInput}
                                        placeholder="Write a reply..."
                                        placeholderTextColor="#94a3b8"
                                        multiline
                                        value={replyText}
                                        onChangeText={setReplyText}
                                      />
                                      <View style={styles.replyActionButtons}>
                                        <TouchableOpacity
                                          style={styles.replyCancelBtn}
                                          onPress={() => {
                                            setReplyTarget(null);
                                            setReplyText("");
                                          }}
                                          activeOpacity={0.7}
                                        >
                                          <Text style={styles.replyCancelText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          style={styles.replySendBtn}
                                          onPress={() => handleSendReply(idx)}
                                          activeOpacity={0.8}
                                        >
                                          <Text style={styles.replySendText}>Send Reply</Text>
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        })}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingBottom: 48,
  },
  heroImage: {
    width: "100%",
    height: 200,
  },
  heroContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 6,
  },
  projectTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: "#0f2d59",
    fontWeight: "700",
    lineHeight: 30,
    marginBottom: 6,
  },
  lastUpdatedText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#64748b",
    marginBottom: 16,
  },
  followBtn: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    borderWidth: 1.5,
  },
  followingBtn: {
    backgroundColor: "#0f2d59",
    borderColor: "#0f2d59",
  },
  unfollowBtn: {
    backgroundColor: "#ffffff",
    borderColor: "#2563eb",
  },
  followBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  followBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    fontWeight: "600",
  },
  followingBtnText: {
    color: "#ffffff",
  },
  unfollowBtnText: {
    color: "#2563eb",
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 24,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#0f2d59",
  },
  subview: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionBody: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
    marginBottom: 20,
  },
  sponsorBlock: {
    marginBottom: 20,
  },
  sponsorHeader: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sponsorValue: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#0f2d59",
    fontWeight: "600",
  },
  dualCardRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dualCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
  },
  dualCardLabel: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dualCardValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#0f2d59",
    fontWeight: "700",
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailsCardTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#0f2d59",
    fontWeight: "700",
    marginBottom: 8,
  },
  detailsCardBody: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
  },
  linkButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  outlineLinkBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingVertical: 10,
  },
  outlineLinkText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  mapBox: {
    height: 120,
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mapText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#166534",
    fontWeight: "600",
  },
  timelineList: {
    paddingLeft: 6,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 14,
  },
  timelineLeftColumn: {
    alignItems: "center",
    width: 24,
  },
  indicatorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  completedIndicator: {
    backgroundColor: "#0d2240",
  },
  currentIndicator: {
    backgroundColor: "#2563eb",
  },
  currentIndicatorInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  futureIndicator: {
    borderWidth: 2,
    borderColor: "#94a3b8",
    backgroundColor: "#f1f5f9",
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#cbd5e1",
    marginVertical: 4,
  },
  timelineContentCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  timelineCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  timelineCardTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
    color: "#0f2d59",
    fontWeight: "700",
  },
  currentBadge: {
    backgroundColor: "#dbeafe",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  currentBadgeText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 9,
    color: "#1d4ed8",
    fontWeight: "700",
  },
  timelineCardDate: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 8,
  },
  timelineCardDesc: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  bulletsContainer: {
    marginTop: 10,
    gap: 6,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
  },
  bulletDot: {
    fontSize: 12,
    color: "#2563eb",
  },
  bulletText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#475569",
    flex: 1,
    lineHeight: 16,
  },
  feedbackSegmentBar: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
  },
  feedbackSegmentButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 6,
  },
  activeFeedbackSegmentButton: {
    backgroundColor: "#0d2240",
  },
  feedbackSegmentText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  activeFeedbackSegmentText: {
    color: "#ffffff",
  },
  feedbackSection: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
  },
  feedbackNoticeText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 14,
  },
  commentInput: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    height: 90,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  feedbackSubmitBtn: {
    backgroundColor: "#0d2240",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
  },
  feedbackSubmitText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "600",
  },
  feedbackSubheader: {
    fontFamily: "Poppins_700Bold",
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "700",
    marginBottom: 12,
  },
  pastFeedbackList: {
    gap: 12,
  },
  commentCard: {
    marginBottom: 14,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "700",
  },
  commentMeta: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  commentUser: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#1e293b",
    fontWeight: "600",
  },
  officialBadge: {
    backgroundColor: "#dbeafe",
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  officialBadgeText: {
    fontFamily: "Poppins_700Bold",
    fontSize: 8,
    color: "#1d4ed8",
    fontWeight: "700",
  },
  commentTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#94a3b8",
  },
  commentBubble: {
    marginLeft: 38,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  commentText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
  },
  mentionText: {
    color: "#2563eb",
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "600",
  },
  publicActionRow: {
    marginBottom: 12,
  },
  publicHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  viewCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  viewCountText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  publicCommentsList: {
    gap: 16,
  },
  commentThread: {
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    paddingBottom: 16,
  },
  commentThreadInner: {
    marginTop: 8,
  },
  replyRow: {
    flexDirection: "row",
  },
  replyIndent: {
    width: 24,
    borderLeftWidth: 1.5,
    borderColor: "#cbd5e1",
    marginLeft: 14,
    marginRight: 10,
  },
  replyButton: {
    marginLeft: 38,
    marginTop: 6,
  },
  replyButtonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#64748b",
  },
  replyFormContainer: {
    marginLeft: 38,
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
  },
  replyInput: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#1e293b",
    height: 60,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  replyActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  replyCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
  },
  replyCancelText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  replySendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#0d2240",
    borderRadius: 6,
  },
  replySendText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
  },
});
