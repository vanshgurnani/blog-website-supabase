import { useEffect, useState } from "react";
import { supabase } from "../connection/supabaseClient";

export default function Posts({ user, showAll }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [withImagesOnly, setWithImagesOnly] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    if (!user && !showAll) return;

    const fetchPosts = async () => {
      setLoading(true);

      let query = supabase
        .from("posts")
        .select("id, title, content, created_at, image_url, profiles(username, avatar_url), user_id")
        .order("created_at", { ascending: !sortNewest });

      if (!showAll && user) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
      }

      setLoading(false);
    };

    fetchPosts();
    // eslint-disable-next-line
  }, [user, showAll, sortNewest]);

  // Filter and search posts client-side
  const filteredPosts = posts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    const matchesImage = !withImagesOnly || !!post.image_url;
    return matchesSearch && matchesImage;
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-gray-700 dark:text-gray-100">{showAll ? "All Blog Posts" : "My Blog Posts"}</h2>
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 sticky top-2 z-10 bg-white/80 dark:bg-gray-900/80 p-3 rounded-xl shadow">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={() => setWithImagesOnly(v => !v)}
          className={`px-3 py-2 rounded font-semibold border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 ${withImagesOnly ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-200 border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"}`}
        >
          {withImagesOnly ? "With Images Only" : "All Posts"}
        </button>
        <button
          onClick={() => setSortNewest(s => !s)}
          className="px-3 py-2 rounded font-semibold border border-purple-600 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-gray-700"
        >
          {sortNewest ? "Newest First" : "Oldest First"}
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">No posts found.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {filteredPosts.map((post, idx) => {
            const profile = post.profiles;
            return (
              <div
                key={post.id}
                tabIndex={0}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 px-7 py-6 transition-all duration-300 ease-in-out hover:scale-[1.015] hover:shadow-2xl focus:scale-[1.015] focus:shadow-2xl cursor-pointer group outline-none animate-fadeIn"
                style={{ animationDelay: `${idx * 60}ms` }}
                title="View post"
              >
                {/* Header: Profile image, username, and date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="avatar"
                        className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-300">
                        {profile?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">{profile?.username || "Unknown"}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium" title={new Date(post.created_at).toLocaleString()}>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {/* Post Title */}
                <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2 group-hover:underline transition">{post.title}</h3>
                {/* Post Content */}
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line mb-3 leading-relaxed text-[1.05rem]">{post.content}</p>
                {/* Post Image */}
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="mt-2 max-h-72 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
