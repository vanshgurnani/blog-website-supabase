import { useEffect, useState } from "react";
import { supabase } from "./connection/supabaseClient";
import Auth from "./auth/Auth";
import CreatePost from "./posts/CreatePost";
import Posts from "./posts/Posts";
import ProfileModal from "./auth/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    avatar_url: "",
    isModal: false,
  });

  // Fetch user profile
  const fetchProfile = async (userId) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("username, avatar_url, isModal")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch profile:", error.message);
      return;
    }

    setUserData(profile);
    if (!profile.isModal) {
      setShowProfile(true);
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchProfile(user.id);
      }
    };

    getUserInfo();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setUserData({ username: "", avatar_url: "", isModal: false });
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData({ username: "", avatar_url: "", isModal: false });
  };

  const handleProfileModalClose = async () => {
    setShowProfile(false);
    if (user) {
      await fetchProfile(user.id); // Refresh profile info after update
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <header className="bg-blue-600 text-white p-4 mb-8 shadow">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Blog Web</h1>
          {user && (
            <div className="flex items-center gap-3">
              {userData.username && (
                <>
                  <span>{userData.username}</span>
                  {userData.avatar_url && (
                    <img
                      src={userData.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                </>
              )}
              {!userData.isModal && (
                <button
                  onClick={() => setShowProfile(true)}
                  className="bg-white text-blue-600 px-3 py-1 rounded shadow hover:bg-blue-100 transition"
                >
                  Profile
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="bg-white text-blue-600 px-3 py-1 rounded shadow hover:bg-blue-100 transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {!user ? (
        <Auth onAuth={setUser} />
      ) : (
        <>
          <ProfileModal
            user={user}
            isOpen={showProfile}
            onClose={handleProfileModalClose}
          />

          <CreatePost user={user} onPostCreated={() => setRefresh((r) => !r)} />

          <div className="flex justify-center mb-6 gap-4">
            <button
              className={`px-4 py-2 rounded font-semibold shadow transition border border-blue-600 ${
                !showAll
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => setShowAll(false)}
            >
              My Blog Posts
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold shadow transition border border-purple-600 ${
                showAll
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-600 hover:bg-purple-50"
              }`}
              onClick={() => setShowAll(true)}
            >
              All Blog Posts
            </button>
          </div>

          <Posts user={user} showAll={showAll} key={refresh + "-" + showAll} />
        </>
      )}
    </div>
  );
}

export default App;
