import { useState } from "react";
import { supabase } from "../connection/supabaseClient";

export default function ProfileModal({ user, isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Upload to Supabase and return the public URL
  const uploadAvatar = async (file) => {
    const filePath = `public/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL from Supabase
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let avatar_url = null;
      if (image) {
        avatar_url = await uploadAvatar(image);
      }

      const { error } = await supabase.from("profiles").insert([
        {
          id: user.id,
          username,
          avatar_url,
          isModal: true,
        },
      ]);

      if (error) throw error;

      onClose();
    } catch (err) {
      console.error("Insert error:", err.message);
      alert("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-sm shadow-xl">
        <h2 className="text-xl font-bold mb-4">Set Your Profile</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-4"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
