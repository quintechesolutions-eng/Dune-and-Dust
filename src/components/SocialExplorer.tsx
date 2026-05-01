import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, UserPlus, Check, X, Send, 
  Search, Shield, Activity, Camera, MapPin,
  Settings, User, Loader2
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { 
  collection, query, where, onSnapshot, addDoc, 
  updateDoc, doc, getDocs, serverTimestamp, setDoc,
  deleteDoc, limit, orderBy
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'motion/react';
import { LANDSCAPE_IMAGES } from '../constants';

export const SocialExplorer: React.FC = () => {
  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [selectedChat, setSelectedChat] = useState<UserProfile | ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');
  const [loadingRequests, setLoadingRequests] = useState<Record<string, boolean>>({});
  const [loadingSends, setLoadingSends] = useState<Record<string, boolean>>({});
  
  // Group creation state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupChats, setGroupChats] = useState<ChatSession[]>([]);

  // Fetch Friend Requests
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'friendRequests'),
        where('toId', '==', user.uid),
        where('status', '==', 'pending')
      );
      return onSnapshot(q, (snapshot) => {
        setRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as FriendRequest[]);
      }, (error) => console.error("FriendRequests pending listener error:", error));
    }
  }, [user]);

  // Fetch Friends (Simple bidirectional check)
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'friendRequests'),
        where('status', '==', 'accepted'),
        where('toId', '==', user.uid)
      );
      const q2 = query(
        collection(db, 'friendRequests'),
        where('status', '==', 'accepted'),
        where('fromId', '==', user.uid)
      );

      const unsub1 = onSnapshot(q, async (snapshot) => {
        const friendIds = snapshot.docs.map(d => d.data().fromId);
        if (friendIds.length > 0) {
          const uQuery = query(collection(db, 'users'), where('uid', 'in', friendIds));
          const uSnap = await getDocs(uQuery);
          setFriends(prev => {
            const others = prev.filter(f => !friendIds.includes(f.uid));
            return [...others, ...uSnap.docs.map(d => d.data() as UserProfile)];
          });
        }
      }, (error) => console.error("FriendRequests accepted(to) listener error:", error));

      const unsub2 = onSnapshot(q2, async (snapshot) => {
        const friendIds = snapshot.docs.map(d => d.data().toId);
        if (friendIds.length > 0) {
          const uQuery = query(collection(db, 'users'), where('uid', 'in', friendIds));
          const uSnap = await getDocs(uQuery);
          setFriends(prev => {
            const others = prev.filter(f => !friendIds.includes(f.uid));
            return [...others, ...uSnap.docs.map(d => d.data() as UserProfile)];
          });
        }
      }, (error) => console.error("FriendRequests accepted(from) listener error:", error));

      return () => { unsub1(); unsub2(); };
    }
  }, [user]);

  // Fetch Group Chats
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'chats'),
        where('isGroup', '==', true),
        where('members', 'array-contains', user.uid)
      );
      return onSnapshot(q, (snapshot) => {
        setGroupChats(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ChatSession[]);
      }, (error) => console.error("Group chats listener error:", error));
    }
  }, [user]);

  // Listen to messages
  useEffect(() => {
    if (user && selectedChat) {
      let chatId = '';
      if ('isGroup' in selectedChat) {
        chatId = selectedChat.id;
      } else {
        chatId = [user.uid, selectedChat.uid].sort().join('_');
      }
      
      const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc'),
        limit(50)
      );
      return onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Message[]);
      }, (error) => console.error("Messages listener error:", error));
    }
  }, [user, selectedChat]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const q = query(
      collection(db, 'users'),
      where('username', '>=', searchQuery),
      where('username', '<=', searchQuery + '\uf8ff'),
      limit(10)
    );
    const snap = await getDocs(q);
    setSearchResults(snap.docs.map(d => d.data() as UserProfile).filter(u => u.uid !== user?.uid));
  };

  const sendFriendRequest = async (targetUser: UserProfile) => {
    if (!user) return;
    setLoadingSends(prev => ({ ...prev, [targetUser.uid]: true }));
    try {
      await addDoc(collection(db, 'friendRequests'), {
        fromId: user.uid,
        fromName: user.displayName,
        toId: targetUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert(`Request sent to ${targetUser.username}`);
    } finally {
      setLoadingSends(prev => ({ ...prev, [targetUser.uid]: false }));
    }
  };

  const acceptRequest = async (req: FriendRequest) => {
    setLoadingRequests(prev => ({ ...prev, [req.id]: true }));
    try {
      await updateDoc(doc(db, 'friendRequests', req.id), { status: 'accepted' });
    } finally {
      setLoadingRequests(prev => ({ ...prev, [req.id]: false }));
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedChat || !messageText.trim()) return;
    
    let chatId = '';
    let isGroup = false;

    if ('isGroup' in selectedChat) {
      chatId = selectedChat.id;
      isGroup = true;
    } else {
      chatId = [user.uid, selectedChat.uid].sort().join('_');
    }

    try {
      // Ensure the chat document exists if it's a private chat
      if (!isGroup) {
         await setDoc(doc(db, 'chats', chatId), {
           members: [user.uid, (selectedChat as UserProfile).uid],
           updatedAt: serverTimestamp()
         }, { merge: true });
      }

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        receiverId: isGroup ? null : (selectedChat as UserProfile).uid,
        text: messageText,
        createdAt: serverTimestamp()
      });
      
      // Update parent document timestamp
      if (isGroup) {
         await updateDoc(doc(db, 'chats', chatId), { updatedAt: serverTimestamp() });
      }
      
      setMessageText('');
    } catch (error) {
      console.error("Message send error:", error);
    }
  };

  const createGroupChat = async () => {
    if (!user || selectedGroupMembers.length === 0) return;
    try {
      const members = [user.uid, ...selectedGroupMembers];
      const chatRef = await addDoc(collection(db, 'chats'), {
        isGroup: true,
        name: groupName || 'Expedition Crew',
        members,
        updatedAt: serverTimestamp()
      });
      setIsCreatingGroup(false);
      setSelectedGroupMembers([]);
      setGroupName('');
      setActiveTab('friends');
    } catch (e) {
      console.error("Group creation error:", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 h-[calc(100vh-160px)] flex flex-col md:flex-row gap-8 relative">
      {/* Background Landscape Scroll */}
      <div className="absolute top-0 left-0 right-0 h-[600px] -z-10 overflow-hidden rounded-b-[4rem] opacity-20 pointer-events-none">
        <div className="scrolling-landscapes opacity-30 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-50/0 via-stone-50/50 to-stone-50" />
      </div>
      
      {/* Sidebar: Navigation + Lists */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="card-polished p-2 flex gap-2">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'friends' ? 'bg-primary text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Crew
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'search' ? 'bg-primary text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Search
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition relative ${activeTab === 'requests' ? 'bg-primary text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Requests
            {requests.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] ring-2 ring-white animate-bounce">{requests.length}</span>}
          </button>
        </div>

        <div className="card-polished flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'friends' && (
            <div className="p-4 space-y-6">
              
              {/* Group Chats Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 mb-4">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Basecamps</h3>
                  <button 
                    onClick={() => setIsCreatingGroup(!isCreatingGroup)}
                    className="text-primary hover:text-blue-700 text-xs font-bold"
                  >
                    {isCreatingGroup ? 'Cancel' : '+ New Group'}
                  </button>
                </div>
                
                {isCreatingGroup && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl mb-4 space-y-4">
                    <input 
                      placeholder="Basecamp Name" 
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {friends.map(f => (
                        <label key={f.uid} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedGroupMembers.includes(f.uid)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedGroupMembers([...selectedGroupMembers, f.uid]);
                              else setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== f.uid));
                            }}
                          />
                          <span className="text-sm font-medium">{f.username}</span>
                        </label>
                      ))}
                    </div>
                    <button 
                      onClick={createGroupChat}
                      disabled={selectedGroupMembers.length === 0}
                      className="w-full bg-primary text-white py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                    >
                      Establish Basecamp
                    </button>
                  </div>
                )}

                {groupChats.length === 0 && !isCreatingGroup && <p className="text-stone-400 text-sm italic px-2">No active basecamps.</p>}
                {groupChats.map(group => (
                  <div 
                    key={group.id} 
                    onClick={() => setSelectedChat(group)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${selectedChat?.id === group.id ? 'bg-blue-50 border-blue-100 border' : 'hover:bg-stone-50 border border-transparent'}`}
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-stone-200 flex items-center justify-center shrink-0">
                       <Users className="w-5 h-5 text-stone-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 truncate">{group.name}</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wide">{group.members.length} Explorers</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Friends Section */}
              <div className="space-y-2 pt-4 border-t border-stone-100">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest px-2 mb-4">Solo Explorers</h3>
                {friends.length === 0 && <p className="text-stone-400 text-sm italic px-2">No friends found. Start searching!</p>}
                {friends.map(friend => (
                  <div 
                    key={friend.uid} 
                    onClick={() => setSelectedChat(friend)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${('uid' in (selectedChat || {}) && (selectedChat as UserProfile).uid === friend.uid) ? 'bg-blue-50 border-blue-100 border' : 'hover:bg-stone-50 border border-transparent'}`}
                  >
                    <img 
                      src={friend.photoURL || undefined} 
                      className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover" 
                      referrerPolicy="no-referrer" 
                      alt="Friend"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + friend.username; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 truncate">{friend.username || friend.displayName}</p>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wide">Connected</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="p-4 space-y-4">
               <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      placeholder="Find explorers..." 
                      className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button onClick={handleSearch} className="bg-primary text-white p-2 rounded-lg"><Search className="w-4 h-4" /></button>
               </div>
               
               <div className="space-y-2">
                 {searchResults.map(result => (
                    <div key={result.uid} className="flex items-center gap-3 p-3 border border-stone-100 rounded-xl bg-white">
                       <img src={result.photoURL || undefined} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" alt={result.displayName} onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + result.username; }} />
                       <div className="flex-1">
                          <p className="font-bold text-sm text-stone-900">@{result.username}</p>
                          <p className="text-[10px] text-stone-400">{result.displayName}</p>
                       </div>
                       <button 
                        onClick={() => sendFriendRequest(result)}
                        className="p-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition"
                        disabled={loadingSends[result.uid]}
                       >
                         {loadingSends[result.uid] ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                       </button>
                    </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="p-4 space-y-3">
              {requests.map(req => (
                <div key={req.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <p className="text-xs font-bold text-stone-900 mb-3">{req.fromName} wants to be friends.</p>
                  <div className="flex gap-2">
                    <button disabled={loadingRequests[req.id]} onClick={() => acceptRequest(req)} className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                      {loadingRequests[req.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Accept
                    </button>
                    <button className="p-2 bg-stone-200 text-stone-600 rounded-lg"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
              {requests.length === 0 && <p className="text-stone-400 text-sm italic py-8 text-center">Cleared for departure. <br/> No pending requests.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Chat Window */}
      <div className="flex-1 flex flex-col card-polished bg-white">
        {selectedChat ? (
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
               <div className="flex items-center gap-3">
                  {'isGroup' in selectedChat ? (
                    <div className="w-10 h-10 rounded-full border-2 border-primary bg-stone-200 flex items-center justify-center">
                       <Users className="w-5 h-5 text-stone-500" />
                    </div>
                  ) : (
                    <img src={(selectedChat as UserProfile).photoURL || undefined} className="w-10 h-10 rounded-full border-2 border-primary object-cover" referrerPolicy="no-referrer" alt={(selectedChat as UserProfile).displayName} onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (selectedChat as UserProfile).username; }} />
                  )}
                  
                  <div>
                    <h2 className="font-black text-stone-900">
                      {'isGroup' in selectedChat ? (selectedChat as ChatSession).name : `@${(selectedChat as UserProfile).username}`}
                    </h2>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                       {'isGroup' in selectedChat ? 'Encrypted Basecamp Channel' : 'Active Explorer'}
                    </p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button className="p-2 text-stone-400 hover:text-primary transition"><Shield className="w-5 h-5" /></button>
                  <button className="p-2 text-stone-400 hover:text-red-500 transition"><X className="w-5 h-5" onClick={() => setSelectedChat(null)} /></button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="text-center py-8">
                 <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2">Encrypted Safari Channel Established</p>
                 <div className="w-24 h-1 bg-stone-100 mx-auto rounded-full" />
              </div>
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.uid;
                const senderInGroup = 'isGroup' in selectedChat ? friends.find(f => f.uid === msg.senderId) : null;
                const senderDisplay = senderInGroup ? senderInGroup.username : 'Unknown';

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium shadow-sm flex flex-col ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-stone-50 text-stone-800 rounded-bl-none border border-stone-100'}`}>
                      {!isMe && 'isGroup' in selectedChat && (
                        <span className="text-[10px] font-black uppercase text-primary mb-1">{senderDisplay}</span>
                      )}
                      <span>{msg.text}</span>
                      <p className={`text-[9px] mt-1 opacity-60 self-end ${isMe ? 'text-white' : 'text-stone-400'}`}>
                        {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50/50">
              <div className="flex gap-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-inner">
                <input 
                  placeholder="Type a transmission..." 
                  className="flex-1 bg-transparent px-4 py-2 border-none focus:ring-0 font-medium text-stone-800"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button 
                  onClick={sendMessage}
                  className="bg-primary text-white p-3 rounded-xl shadow-lg hover:bg-blue-700 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-stone-50/30">
             <div className="p-6 bg-white rounded-3xl shadow-xl border border-stone-100 mb-6">
                <MessageSquare className="w-16 h-16 text-stone-200" />
             </div>
             <h2 className="text-2xl font-black text-stone-900 mb-2">Safari Comms Channel</h2>
             <p className="text-stone-400 max-w-sm font-medium">Select a friend to begin an end-to-end encrypted transmission.</p>
          </div>
        )}
      </div>

    </div>
  );
};
