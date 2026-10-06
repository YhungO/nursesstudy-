import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChatChannel, ChatMessage, ChatCategory } from '../../types';
import { api } from '../../services/api';
import {
  subscribeToChatChannels,
  subscribeToChatMessages,
  sendChatMessageToFirestore,
  toggleChatMessageReactionInFirestore,
  pinChatMessageInFirestore,
  deleteChatMessageFromFirestore,
  createChatChannelInFirestore,
} from '../../services/firestoreService';
import {
  MessageSquare,
  Send,
  Pin,
  Smile,
  Search,
  Plus,
  Users,
  Sparkles,
  Hash,
  BookOpen,
  Clock,
  Compass,
  Award,
  ChevronDown,
  Trash2,
  CheckCircle2,
  Flame,
  Lightbulb,
  Heart,
  ThumbsUp,
  HelpCircle,
  X,
  ArrowDown,
  Radio,
  Share2,
} from 'lucide-react';

interface StudyChatProps {
  onNavigateToExam?: (examId: string) => void;
  onNavigateToNotes?: (noteId?: string) => void;
  initialChannelId?: string;
  initialTopic?: string;
}

const CATEGORY_COLORS: Record<ChatCategory, { bg: string; text: string; border: string; label: string }> = {
  'exam-strategy': {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    label: 'Exam Strategy',
  },
  'study-topic': {
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    label: 'Study Topic',
  },
  'clinical-pearl': {
    bg: 'bg-sky-500/15',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    label: 'Clinical Pearl',
  },
  'question-discussion': {
    bg: 'bg-teal-500/15',
    text: 'text-teal-300',
    border: 'border-teal-500/30',
    label: 'Question Prep',
  },
  'general': {
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
    label: 'Student Lounge',
  },
};

const COMMON_REACTIONS = ['💡', '🔥', '👏', '❤️', '👍'];

const QUICK_STRATEGY_TEMPLATES = [
  { label: 'CBT Timing Strategy', prefix: '⏱️ CBT Timing Strategy: ' },
  { label: 'Memory Mnemonic', prefix: '💡 High-Yield Mnemonic: ' },
  { label: 'Exam Question Review', prefix: '❓ Question Review & Distractor Check: ' },
  { label: 'Daily Study Goal', prefix: '🎯 Today Revision Target: ' },
];

export const StudyChat: React.FC<StudyChatProps> = ({
  onNavigateToExam,
  onNavigateToNotes,
  initialChannelId = 'exam-prep-strategies',
  initialTopic,
}) => {
  const { user } = useAuth();

  // Channels & Active Channel
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>(initialChannelId);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [channelSearch, setChannelSearch] = useState('');

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messageSearch, setMessageSearch] = useState('');

  // Input & Composer
  const [messageContent, setMessageContent] = useState('');
  const [topicTitle, setTopicTitle] = useState(initialTopic || '');
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory>('exam-strategy');
  const [showTopicField, setShowTopicField] = useState(!!initialTopic);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);

  // New Channel Modal
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelCat, setNewChannelCat] = useState<ChatCategory>('study-topic');
  const [newChannelTopic, setNewChannelTopic] = useState('');

  // UI & Real-Time state
  const [mobileChannelDrawerOpen, setMobileChannelDrawerOpen] = useState(false);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // WebSocket Real-time & Presence State
  const [wsConnected, setWsConnected] = useState(false);
  const [livePresence, setLivePresence] = useState<number>(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<ChatMessage | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimerRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  // 0. WebSocket Real-Time Event Sync
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isCancelled = false;

    function connect() {
      if (isCancelled) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/chat-ws`;

      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (isCancelled) return;
          setWsConnected(true);
          socket?.send(
            JSON.stringify({
              type: 'join_channel',
              channelId: activeChannelId,
              user: user ? { id: user.id, name: user.name, role: user.role } : undefined,
            })
          );
        };

        socket.onmessage = (event) => {
          if (isCancelled) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') {
              if (typeof data.presence === 'number') setLivePresence(data.presence);
            } else if (data.type === 'presence' && data.channelId === activeChannelId) {
              setLivePresence(data.count || 0);
            } else if (data.type === 'typing' && data.channelId === activeChannelId) {
              if (data.userName && data.userName !== user?.name) {
                setTypingUsers((prev) => Array.from(new Set([...prev, data.userName])));
                setTimeout(() => {
                  setTypingUsers((prev) => prev.filter((u) => u !== data.userName));
                }, 3000);
              }
            } else if (data.type === 'message_created' && data.message) {
              const newMsg: ChatMessage = data.message;
              if (newMsg.channelId === activeChannelId) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === newMsg.id)) return prev;
                  const tempIdx = prev.findIndex(
                    (m) =>
                      m.id.startsWith('temp-') &&
                      m.senderId === newMsg.senderId &&
                      m.content === newMsg.content
                  );
                  if (tempIdx >= 0) {
                    const copy = [...prev];
                    copy[tempIdx] = newMsg;
                    return copy;
                  }
                  return [...prev, newMsg];
                });
              }
            } else if (data.type === 'message_updated' && data.message) {
              const updatedMsg: ChatMessage = data.message;
              setMessages((prev) =>
                prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
              );
            } else if (data.type === 'message_deleted' && data.messageId) {
              setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
            } else if (data.type === 'channel_created' && data.channel) {
              setChannels((prev) => {
                if (prev.some((c) => c.id === data.channel.id)) return prev;
                return [data.channel, ...prev];
              });
            }
          } catch (err) {
            console.warn('[WS Client] Parse error:', err);
          }
        };

        socket.onclose = () => {
          if (isCancelled) return;
          setWsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        console.warn('[WS Client] Init error:', err);
        reconnectTimeout = setTimeout(connect, 4000);
      }
    }

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) {
        try {
          socket.close();
        } catch (_) {}
      }
    };
  }, [activeChannelId, user?.id]);

  // 1. Load Channels with Real-time fallback
  useEffect(() => {
    let unsubFirestore = () => {};

    // Initial fetch from backend REST API
    api.getChatChannels()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setChannels(data);
        }
      })
      .catch((err) => console.warn('Could not load chat channels via REST:', err));

    // Attach real-time Firestore listener
    try {
      unsubFirestore = subscribeToChatChannels((liveChannels) => {
        if (Array.isArray(liveChannels) && liveChannels.length > 0) {
          setChannels(liveChannels);
        }
      });
    } catch (err) {
      console.warn('Real-time channel subscription fallback notice:', err);
    }

    return () => {
      unsubFirestore();
    };
  }, []);

  // 2. Load Messages for Active Channel with Real-time onSnapshot
  useEffect(() => {
    setLoadingMessages(true);
    let unsubFirestore = () => {};

    // First load via REST for instant availability
    api.getChatMessages(activeChannelId)
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch((err) => console.warn('Error loading chat messages via API:', err))
      .finally(() => setLoadingMessages(false));

    // Subscribe to Firestore real-time stream
    try {
      unsubFirestore = subscribeToChatMessages(
        activeChannelId,
        (liveMessages) => {
          if (Array.isArray(liveMessages) && liveMessages.length > 0) {
            setMessages(liveMessages);
          }
          setLoadingMessages(false);
        },
        (err) => {
          console.warn('Firestore messages subscription notice:', err);
          setLoadingMessages(false);
        }
      );
    } catch (err) {
      console.warn('Could not attach Firestore message listener:', err);
      setLoadingMessages(false);
    }

    return () => {
      unsubFirestore();
    };
  }, [activeChannelId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Check if scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setAutoScroll(isAtBottom);
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId) || {
    id: activeChannelId,
    name: activeChannelId === 'exam-prep-strategies' ? 'Exam Prep & Strategy Hub' : activeChannelId,
    description: 'Active discussion and exam strategies for nursing students',
    category: 'exam-strategy' as ChatCategory,
    badge: 'Hub',
    activeTopic: 'ND1 CBT Preparation & Time Pacing',
    participantCount: 42,
  };

  // Filter channels
  const filteredChannels = channels.filter((c) => {
    const matchesCat = selectedCategoryFilter === 'all' || c.category === selectedCategoryFilter;
    const matchesSearch =
      channelSearch.trim() === '' ||
      c.name.toLowerCase().includes(channelSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(channelSearch.toLowerCase()) ||
      (c.activeTopic && c.activeTopic.toLowerCase().includes(channelSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (showPinnedOnly && !m.pinned) return false;
    if (!messageSearch.trim()) return true;
    const q = messageSearch.toLowerCase();
    return (
      m.content.toLowerCase().includes(q) ||
      (m.topicTitle && m.topicTitle.toLowerCase().includes(q)) ||
      m.senderName.toLowerCase().includes(q)
    );
  });

  const pinnedMessages = messages.filter((m) => m.pinned);

  // Handle composer typing with WebSocket notification
  const handleComposerTyping = (text: string) => {
    setMessageContent(text);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && user?.name) {
      if (!typingTimerRef.current) {
        wsRef.current.send(
          JSON.stringify({
            type: 'typing',
            channelId: activeChannelId,
            userName: user.name,
          })
        );
        typingTimerRef.current = setTimeout(() => {
          typingTimerRef.current = null;
        }, 2500);
      }
    }
  };

  // Copy message content
  const handleCopyMessage = (msg: ChatMessage) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg.content);
      setCopiedMessageId(msg.id);
      showToast('Copied study strategy / notes to clipboard!');
      setTimeout(() => {
        setCopiedMessageId((cur) => (cur === msg.id ? null : cur));
      }, 2000);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageContent.trim() || isSubmitting) return;

    if (!user) {
      showToast('Please sign in to participate in student study discussions');
      return;
    }

    const payload = {
      channelId: activeChannelId,
      topicTitle: topicTitle.trim() || undefined,
      content: messageContent.trim(),
      category: selectedCategory,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      senderSchool: user.school || 'College of Nursing',
      senderLevel: user.levelId === 'lvl-nd1' ? 'ND 1' : 'Nursing Student',
      reactions: {},
      pinned: false,
    };

    setIsSubmitting(true);
    try {
      // 1. Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: ChatMessage = {
        ...payload,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setMessageContent('');
      setAutoScroll(true);

      // 2. Write to Firestore & REST in parallel
      await Promise.allSettled([
        sendChatMessageToFirestore(payload),
        api.sendChatMessage(payload),
      ]);
    } catch (err: any) {
      console.error('Failed to post message:', err);
      showToast('Failed to post message. Please check connection.');
    } finally {
      setIsSubmitting(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Toggle reaction
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) {
      showToast('Please log in to react to messages');
      return;
    }

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = { ...(m.reactions || {}) };
        const currentList = reactions[emoji] || [];
        const idx = currentList.indexOf(user.id);
        if (idx >= 0) {
          currentList.splice(idx, 1);
          if (currentList.length === 0) {
            delete reactions[emoji];
          } else {
            reactions[emoji] = currentList;
          }
        } else {
          currentList.push(user.id);
          reactions[emoji] = currentList;
        }
        return { ...m, reactions };
      })
    );

    setShowEmojiPickerFor(null);

    try {
      await Promise.allSettled([
        toggleChatMessageReactionInFirestore(messageId, emoji, user.id),
        api.reactToChatMessage(messageId, emoji),
      ]);
    } catch (err) {
      console.warn('Reaction sync error:', err);
    }
  };

  // Pin message (Admin or verified)
  const handleTogglePin = async (messageId: string, currentPinned?: boolean) => {
    if (user?.role !== 'admin') {
      showToast('Only platform administrators can pin high-yield messages');
      return;
    }

    const nextPinned = !currentPinned;
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, pinned: nextPinned } : m))
    );

    try {
      await Promise.allSettled([
        pinChatMessageInFirestore(messageId, nextPinned),
        api.pinChatMessage(messageId, nextPinned),
      ]);
      showToast(nextPinned ? 'Message pinned to strategy board' : 'Message unpinned');
    } catch (err) {
      console.warn('Pin sync error:', err);
    }
  };

  // Delete message with modal confirmation
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget || !user) return;
    const msg = deleteConfirmTarget;
    setDeleteConfirmTarget(null);

    setMessages((prev) => prev.filter((m) => m.id !== msg.id));

    try {
      await Promise.allSettled([
        deleteChatMessageFromFirestore(msg.id),
        api.deleteChatMessage(msg.id),
      ]);
      showToast('Message deleted successfully');
    } catch (err) {
      console.warn('Delete sync error:', err);
    }
  };

  // Create Channel Modal Submit
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const channelPayload: ChatChannel = {
      id: newChannelName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      name: newChannelName.trim(),
      description: newChannelDesc.trim() || 'Student-created topic discussion group',
      category: newChannelCat,
      badge: newChannelCat === 'exam-strategy' ? 'Strategy' : 'Topic',
      color: 'teal',
      activeTopic: newChannelTopic.trim() || newChannelName.trim(),
      participantCount: 1,
    };

    try {
      setChannels((prev) => [channelPayload, ...prev]);
      setActiveChannelId(channelPayload.id);
      setShowNewChannelModal(false);
      setNewChannelName('');
      setNewChannelDesc('');
      setNewChannelTopic('');

      await Promise.allSettled([
        createChatChannelInFirestore(channelPayload),
        api.createChatChannel(channelPayload),
      ]);
    } catch (err) {
      console.warn('Failed to create channel:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      {/* Top Header Card */}
      <div className="mb-4 sm:mb-6 bg-gradient-to-r from-teal-950/40 via-slate-900 to-[#111827] border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Student Study Discussions & Strategy Hub
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                wsConnected
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
              }`}>
                <Radio className={`w-3 h-3 ${wsConnected ? 'text-emerald-400' : 'text-teal-400'} animate-pulse`} />
                {wsConnected ? 'WebSocket Live' : 'Cloud Sync'}
                {livePresence > 0 && ` • ${livePresence} Online`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Connect with fellow nursing scholars to share high-yield exam preparation strategies, discuss tricky questions from the 125-Question CBT Bank, and review clinical concepts collaboratively.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setShowNewChannelModal(true)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-teal-900/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Topic Room</span>
            </button>
            <button
              onClick={() => setMobileChannelDrawerOpen(!mobileChannelDrawerOpen)}
              className="md:hidden px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Hash className="w-4 h-4 text-teal-400" />
              <span>Channels ({channels.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar (Channels) + Chat Window */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 min-h-[640px]">
        {/* Left Column: Channels & Topic Rooms (Desktop) */}
        <div
          className={`md:col-span-4 lg:col-span-3.5 space-y-3 ${
            mobileChannelDrawerOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3.5 shadow-md flex flex-col h-[650px]">
            {/* Channel Search & Category Filter */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search channels or topics..."
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter('exam-strategy')}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedCategoryFilter === 'exam-strategy'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Strategies
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter('study-topic')}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedCategoryFilter === 'study-topic'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Topics
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter('clinical-pearl')}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedCategoryFilter === 'clinical-pearl'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Pearls
                </button>
              </div>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                <span>Discussion Rooms</span>
                <span>{filteredChannels.length}</span>
              </div>

              {filteredChannels.map((channel) => {
                const isActive = channel.id === activeChannelId;
                const cat = CATEGORY_COLORS[channel.category] || CATEGORY_COLORS['study-topic'];

                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannelId(channel.id);
                      setMobileChannelDrawerOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex flex-col gap-1 ${
                      isActive
                        ? 'bg-teal-950/30 border-teal-500/50 shadow-sm ring-1 ring-teal-500/20'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {channel.name}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${cat.bg} ${cat.text} ${cat.border}`}>
                        {cat.label}
                      </span>
                    </div>

                    {channel.activeTopic && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                        💬 {channel.activeTopic}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{channel.participantCount || 25} online</span>
                      </span>
                      {channel.messageCount !== undefined && channel.messageCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                          {channel.messageCount} msgs
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredChannels.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching discussion rooms. Click "New Topic Room" to start one!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Feed, Pinned Strategy & Composer */}
        <div className="md:col-span-8 lg:col-span-8.5 flex flex-col h-[650px] bg-[#111827] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          {/* Chat Room Top Bar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <Hash className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {activeChannel.name}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-teal-300 bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                    {livePresence > 0 ? livePresence : (activeChannel.participantCount || 34)} Students Active
                  </span>
                </div>
                {activeChannel.activeTopic && (
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Current Focus: <span className="text-teal-300 font-medium">{activeChannel.activeTopic}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Top Bar Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Search Toggle */}
              <div className="relative hidden sm:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter chat..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className="pl-7 pr-2 py-1 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 w-28 focus:w-40 transition-all focus:outline-none"
                />
              </div>

              {/* Pin Filter */}
              {pinnedMessages.length > 0 && (
                <button
                  onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                  title={showPinnedOnly ? 'Show all messages' : 'Filter by pinned exam strategies'}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                    showPinnedOnly
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{pinnedMessages.length} Pinned</span>
                </button>
              )}

              {/* Quick Jump to Exam if related */}
              {activeChannel.id === 'philosophy-history-science' && onNavigateToExam && (
                <button
                  onClick={() => onNavigateToExam('cbt-philosophy-science-125')}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs font-bold border border-purple-500/40 flex items-center gap-1 transition-all cursor-pointer"
                  title="Launch Philosophy & History of Science 125-Q CBT"
                >
                  <Clock className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden lg:inline">Launch 125-Q CBT</span>
                </button>
              )}
            </div>
          </div>

          {/* High-Yield Pinned Strategy Banner (If any) */}
          {pinnedMessages.length > 0 && !showPinnedOnly && (
            <div className="bg-amber-950/30 border-b border-amber-500/30 px-3.5 py-2 flex items-center justify-between text-xs text-amber-200 shrink-0 animate-in fade-in">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase border border-amber-500/40 flex items-center gap-1 shrink-0">
                  <Pin className="w-3 h-3" /> Pinned Strategy
                </span>
                <p className="truncate text-[11px] text-amber-100/90 font-medium">
                  {pinnedMessages[0].content}
                </p>
              </div>
              <button
                onClick={() => setShowPinnedOnly(true)}
                className="text-[11px] font-bold text-amber-400 hover:text-white underline ml-2 shrink-0 cursor-pointer"
              >
                View ({pinnedMessages.length})
              </button>
            </div>
          )}

          {/* Messages Stream Area */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0d131f]/60"
          >
            {loadingMessages && messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Loading study discussion messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">No messages in this topic room yet</h3>
                <p className="text-xs max-w-sm text-slate-400 mb-4">
                  Be the first to share an exam preparation strategy, ask a clinical question, or post a memory pearl!
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {QUICK_STRATEGY_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      onClick={() => {
                        setMessageContent(tmpl.prefix);
                        if (textareaRef.current) textareaRef.current.focus();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs border border-slate-700 transition-colors cursor-pointer"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              filteredMessages.map((msg, idx) => {
                const isMyMessage = user?.id === msg.senderId;
                const isAdmin = msg.senderRole === 'admin';
                const cat = CATEGORY_COLORS[msg.category || 'study-topic'];

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col gap-1 transition-all group ${
                      msg.pinned ? 'bg-amber-950/15 p-2.5 rounded-2xl border border-amber-500/30' : ''
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Avatar initials */}
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] text-white shrink-0 ${
                            isAdmin
                              ? 'bg-gradient-to-br from-amber-600 to-amber-700 ring-1 ring-amber-400/40'
                              : 'bg-gradient-to-br from-teal-700 to-teal-900 ring-1 ring-teal-500/30'
                          }`}
                        >
                          {msg.senderName.slice(0, 2).toUpperCase()}
                        </div>

                        <span className="font-bold text-white text-xs">
                          {msg.senderName}
                        </span>

                        {isAdmin ? (
                          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[9px]">
                            Faculty / Admin
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-md bg-teal-500/15 text-teal-300 border border-teal-500/25 font-semibold text-[9px]">
                            {msg.senderLevel || 'Nursing Student'}
                          </span>
                        )}

                        {msg.senderSchool && (
                          <span className="text-[10px] text-slate-500 hidden sm:inline">
                            • {msg.senderSchool}
                          </span>
                        )}

                        {msg.category && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${cat.bg} ${cat.text} ${cat.border}`}>
                            {cat.label}
                          </span>
                        )}

                        {msg.pinned && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400">
                            <Pin className="w-2.5 h-2.5 fill-amber-400" />
                            Pinned
                          </span>
                        )}
                      </div>

                      {/* Right actions: timestamp & controls */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 shrink-0">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Copy Strategy / Notes Button */}
                        <button
                          onClick={() => handleCopyMessage(msg)}
                          title="Copy strategy to clipboard"
                          className="p-1 rounded text-slate-400 hover:text-teal-300 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          {copiedMessageId === msg.id ? (
                            <CheckCircle2 className="w-3 h-3 text-teal-400" />
                          ) : (
                            <Share2 className="w-3 h-3" />
                          )}
                        </button>

                        {/* Admin Pin Toggle */}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleTogglePin(msg.id, msg.pinned)}
                            title={msg.pinned ? 'Unpin message' : 'Pin as high-yield strategy'}
                            className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Pin className={`w-3 h-3 ${msg.pinned ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        )}

                        {/* Delete button (owner or admin) */}
                        {(isMyMessage || user?.role === 'admin') && (
                          <button
                            onClick={() => setDeleteConfirmTarget(msg)}
                            title="Delete message"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Topic Title Badge if provided */}
                    {msg.topicTitle && (
                      <div className="text-[11px] font-bold text-teal-300 flex items-center gap-1 pl-8">
                        <Sparkles className="w-3 h-3 text-teal-400" />
                        <span>Topic: {msg.topicTitle}</span>
                      </div>
                    )}

                    {/* Message Bubble Content */}
                    <div className="pl-8">
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words border ${
                          isMyMessage
                            ? 'bg-teal-950/40 border-teal-500/30 text-teal-50 shadow-sm'
                            : 'bg-slate-900/90 border-slate-800 text-slate-200'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Reactions & Add Reaction Trigger */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {/* Existing reactions */}
                        {Object.entries(msg.reactions || {}).map(([emoji, uids]) => {
                          if (!Array.isArray(uids) || uids.length === 0) return null;
                          const hasReacted = user && uids.includes(user.id);

                          return (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 border transition-all cursor-pointer ${
                                hasReacted
                                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{uids.length}</span>
                            </button>
                          );
                        })}

                        {/* Add reaction button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)
                            }
                            className="p-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-teal-300 text-xs opacity-60 group-hover:opacity-100 transition-all cursor-pointer"
                            title="React to message"
                          >
                            <Smile className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Emoji Menu */}
                          {showEmojiPickerFor === msg.id && (
                            <div className="absolute left-0 bottom-full mb-1 z-20 bg-slate-900 border border-slate-700 rounded-xl p-1.5 flex items-center gap-1 shadow-2xl animate-in zoom-in-95">
                              {COMMON_REACTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-sm transition-transform active:scale-125 cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Strategy Starters Bar */}
          <div className="px-3.5 py-1.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0">
            <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Prompts:
            </span>
            {QUICK_STRATEGY_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                onClick={() => {
                  setMessageContent((prev) => (prev ? `${prev}\n${tmpl.prefix}` : tmpl.prefix));
                  if (textareaRef.current) textareaRef.current.focus();
                }}
                className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 shrink-0 transition-colors cursor-pointer"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="px-3.5 py-1 text-[11px] text-teal-300 flex items-center gap-1.5 animate-pulse bg-teal-950/30 border-t border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              <span className="italic">{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} writing a message...</span>
            </div>
          )}

          {/* Composer Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-[#0d131f] shrink-0 space-y-2">
            {/* Optional Topic Header Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTopicField(!showTopicField)}
                  className={`text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    showTopicField ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  <span>{showTopicField ? 'Specific Topic Enabled' : '+ Add Specific Topic Heading'}</span>
                </button>
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-slate-500 hidden sm:inline">Type:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ChatCategory)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-slate-200 text-[11px] focus:outline-none focus:border-teal-500"
                >
                  <option value="exam-strategy">🎯 Exam Strategy</option>
                  <option value="study-topic">📖 Study Topic</option>
                  <option value="clinical-pearl">💡 Clinical Pearl</option>
                  <option value="question-discussion">❓ Question Prep</option>
                  <option value="general">💬 General Lounge</option>
                </select>
              </div>
            </div>

            {/* Topic Field (collapsible) */}
            {showTopicField && (
              <div className="animate-in fade-in">
                <input
                  type="text"
                  placeholder="Topic title (e.g., CBT Question 47 Algebra Review, Burn Rule of Nines)..."
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {/* Message Textarea & Send button */}
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={messageContent}
                  onChange={(e) => handleComposerTyping(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    user
                      ? `Share a study tip or ask about ${activeChannel.name}... (Press Enter to send)`
                      : 'Please sign in to participate in the study discussions'
                  }
                  disabled={!user}
                  maxLength={2000}
                  className="w-full p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none disabled:opacity-60"
                />
                <span className="absolute right-2 bottom-1.5 text-[9px] text-slate-500 font-mono">
                  {messageContent.length}/2000
                </span>
              </div>

              <button
                type="submit"
                disabled={!user || !messageContent.trim() || isSubmitting}
                className="h-10 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-900/30 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* New Topic Room Modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Create Study Topic Room</h3>
                  <p className="text-[11px] text-slate-400">Set up a focused discussion channel for nursing students</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChannelModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pharmacology Drug Calculations Prep"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newChannelCat}
                  onChange={(e) => setNewChannelCat(e.target.value as ChatCategory)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="exam-strategy">🎯 Exam Strategy Hub</option>
                  <option value="study-topic">📖 Specific Subject / Topic</option>
                  <option value="clinical-pearl">💡 Clinical Pearls & Mnemonics</option>
                  <option value="question-discussion">❓ Question Prep & CBT Drills</option>
                  <option value="general">💬 General Student Lounge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active Study Topic / Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekly IV drip rate calculation drills"
                  value={newChannelTopic}
                  onChange={(e) => setNewChannelTopic(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Room Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of what students will discuss in this room..."
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChannelModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-900/30 cursor-pointer disabled:opacity-50"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#111827] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Discussion Message?</h3>
                <p className="text-xs text-slate-400">This will remove this post from the topic room.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 italic line-clamp-3">
              "{deleteConfirmTarget.content}"
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 cursor-pointer"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 px-4 py-2.5 rounded-2xl bg-teal-950/95 text-teal-200 border border-teal-500/40 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
