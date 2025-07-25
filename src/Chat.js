import React, { useEffect, useState } from 'react';
import { supabase } from './connection/supabaseClient';

export default function ChatModal({ user, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all users except current
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', user.id);
      if (!error) setUsers(data);
    };
    if (user) fetchUsers();
  }, [user]);

  // Fetch messages between current user and selected user
  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (!error) setMessages(data);
      setLoading(false);
    };
    fetchMessages();
  }, [user, selectedUser]);

  // Realtime subscription
  useEffect(() => {
    if (!selectedUser) return;
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
            (msg.sender_id === selectedUser.id && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedUser]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser) return;
    await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: selectedUser.id,
        content,
      },
    ]);
    setContent('');
  };

  // Modal background click closes modal
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('fixed')) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={handleBackgroundClick}>
      <div className="bg-white rounded shadow-lg w-full max-w-md p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
        {!selectedUser ? (
          <>
            <h2 className="text-lg font-bold mb-4">Select a user to chat with</h2>
            <ul>
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded" onClick={() => setSelectedUser(u)}>
                  {u.avatar_url && <img src={u.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />}
                  <span>{u.username || u.id}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => setSelectedUser(null)} className="text-blue-600 hover:underline">&larr; Back</button>
              {selectedUser.avatar_url && <img src={selectedUser.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />}
              <span className="font-semibold">{selectedUser.username || selectedUser.id}</span>
            </div>
            <div className="h-64 overflow-y-scroll border p-2 mb-2 bg-gray-50">
              {loading ? (
                <div>Loading...</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-1 text-sm ${msg.sender_id === user.id ? 'text-right' : 'text-left'}`}
                  >
                    <span className={`inline-block px-2 py-1 rounded ${msg.sender_id === user.id ? 'bg-blue-200' : 'bg-gray-200'}`}>
                      {msg.content}
                    </span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message"
                className="flex-1 border rounded px-2 py-1"
              />
              <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
} 