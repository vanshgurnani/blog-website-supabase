import { useEffect, useState } from "react";
import { supabase } from "../connection/supabaseClient";

export default function Posts({ user, showAll }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !showAll) return;

    const fetchPosts = async () => {
      setLoading(true);

      let query = supabase
        .from("posts")
        .select("id, title, content, created_at, image_url, profiles(username, avatar_url), user_id")
        .order("created_at", { ascending: false });

      if (!showAll && user) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      console.log("Data:", data);

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };

    fetchPosts();
  }, [user, showAll]);

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{showAll ? "All Blog Posts" : "My Blog Posts"}</h2>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : posts.length === 0 ? (
        <div>No posts yet.</div>
      ) : (
        posts.map(post => {
          const profile = post.profiles;
          return (
            <div
              key={post.id}
              className="bg-white p-4 rounded shadow mb-4 transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-blue-700">{post.title}</h3>
              <p className="mt-2 text-gray-700">{post.content}</p>

              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post"
                  className="mt-3 max-h-64 w-auto object-cover rounded"
                />
              )}

              <div className="text-xs text-gray-500 mt-3 flex justify-between items-center">
                <span>{new Date(post.created_at).toLocaleString()}</span>
                {showAll && profile && (
                  <span className="flex items-center gap-2">
                    {profile.avatar_url && (
                      <img
                        src={profile.avatar_url}
                        alt="avatar"
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <span>{profile.username}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
