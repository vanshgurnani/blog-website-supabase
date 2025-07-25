import { useState } from "react";
import { supabase } from "../connection/supabaseClient";

async function generateContentWithGemini(title) {
  console.log(process.env.REACT_APP_GEMINI);
  const apiKey = process.env.REACT_APP_GEMINI;
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
  const body = {
    contents: [{ parts: [{ text: `Write a concise blog post about: ${title}` }] }],
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Failed to generate content");
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export default function CreatePost({ user, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateContent = async () => {
    if (!title) {
      setError("Please enter a title first.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const generated = await generateContentWithGemini(title);
      setContent(generated);
    } catch (err) {
      setError("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

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
      className="bg-white dark:bg-[#242526] max-w-2xl mx-auto p-6 md:p-8 rounded-2xl shadow-md mb-10 border border-gray-100 dark:border-gray-800 flex flex-col gap-4"
      style={{ marginTop: '2rem' }}
    >
      <h2 className="text-lg font-bold mb-2 text-[#0A66C2] dark:text-blue-400">Create a Post</h2>
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#0A66C2] dark:focus:ring-blue-400 transition h-12"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <button
          type="button"
          onClick={handleGenerateContent}
          disabled={generating || !title}
          className="h-12 px-4 rounded bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 flex items-center"
          style={{ minWidth: '140px' }}
        >
          {generating ? "Generating..." : "Generate Content"}
        </button>
      </div>
      <textarea
        className="w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#0A66C2] dark:focus:ring-blue-400 transition min-h-[120px]"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What do you want to talk about?"
        rows={4}
      />
      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16.5 3.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM19.5 10.5v.75a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.5 11.25v-.75" />
        </svg>
        <span>Attach image</span>
        <input
          type="file"
          onChange={(e) => setImageFile(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />
      </label>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        className={`px-6 py-2 rounded font-semibold shadow transition w-full mt-2
          ${loading ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-[#0A66C2] text-white'}`}
        type="submit"
        disabled={loading}
        style={{ backgroundColor: loading ? undefined : '#0A66C2', color: loading ? undefined : '#fff' }}
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
