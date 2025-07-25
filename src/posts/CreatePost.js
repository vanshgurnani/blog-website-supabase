import { useState } from "react";
import { supabase } from "../connection/supabaseClient";

export default function CreatePost({ user, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !content) {
      setError("Title and content required");
      return;
    }

    setLoading(true);
    let imageUrl = null;

    // 1. Upload image to Supabase Storage
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `posts/${Date.now()}-${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images") // Your Supabase storage bucket
        .upload(filePath, imageFile);

      if (uploadError) {
        setError("Failed to upload image");
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    // 2. Insert post into the database
    const { error: insertError } = await supabase.from("posts").insert([
      {
        title,
        content,
        image_url: imageUrl,
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setTitle("");
      setContent("");
      setImageFile(null);
      onPostCreated();
    }
  };

  return (
    <form
      onSubmit={handleCreate}
      className="bg-white p-6 rounded shadow mb-6 max-w-xl mx-auto"
    >
      <h2 className="text-xl font-bold mb-4">Create a Post</h2>
      <input
        className="w-full border px-3 py-2 rounded mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="w-full border px-3 py-2 rounded mb-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        rows={4}
      />
      <input
        type="file"
        onChange={(e) => setImageFile(e.target.files[0])}
        accept="image/*"
        className="mb-2"
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        type="submit"
        disabled={loading}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
