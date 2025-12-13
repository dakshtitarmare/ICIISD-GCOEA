import { useState, useRef, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RegistrationLaptop() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("📌 Registration Laptop Screen Mounted");
    inputRef.current?.focus();
  }, []);

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") search();
  };

  // --------------------------------------------------------
  // 🔍 SUPER FAST SEARCH WITH FULL DEBUG
  // --------------------------------------------------------
  const search = async () => {
    console.log("\n=========================");
    console.log("🔍 SEARCH TRIGGERED");
    console.log("=========================");

    if (!email.trim()) {
      console.log("❌ No email entered");
      toast.error("Enter an email");
      return;
    }

    const cleanEmail = email.trim();
    console.log("📨 Email to search:", cleanEmail);

    const startTime = performance.now();
    console.log("⏱ Start time:", startTime);

    setLoading(true);
    setResult(null);

    try {
      console.log("📡 Sending GET request to backend...");

      const res = await axios.get(
        "http://127.0.0.1:4000/api/participant/search",
        {
          params: { email: cleanEmail },
        }
      );

      console.log("📥 Raw API response:", res);
      const json = res.data;

      console.log("🧩 Parsed JSON:", json);

      if (!json.success) {
        console.log("❌ Backend error:", json.message);
        toast.error(json.message);
        inputRef.current?.focus();
        return;
      }

      if (!json.data.exists) {
        console.log("⚠️ Participant not found in DB");
        toast.error("Participant NOT found");
        setResult(null);
        inputRef.current?.focus();
        return;
      }

      console.log("✅ Participant found:", json.data.participant);

      setResult(json.data.participant);
      toast.success("Record found!");

      // ⭐ CLEAR INPUT FIELD AFTER SUCCESS
      setEmail("");
      inputRef.current?.focus();

    } catch (err: any) {
      console.log("💥 ERROR while searching:", err);
      toast.error("Network error");
    }

    const endTime = performance.now();
    console.log("⏱ End time:", endTime);
    console.log(`🚀 Total Time for Search: ${(endTime - startTime).toFixed(2)} ms`);

    setLoading(false);
    inputRef.current?.focus();

    console.log("🔍 Search completed.");
    console.log("=========================\n");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold text-center mb-6">
        Registration Laptop – Search
      </h1>

      <div className="max-w-xl mx-auto bg-white shadow p-6 rounded-xl">
        <label className="font-semibold text-lg">Participant Email</label>

        <input
          type="email"
          ref={inputRef}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full mt-2 px-4 py-3 border rounded-lg text-lg"
          placeholder="Email..."
        />

        <button
          onClick={search}
          disabled={loading}
          className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg text-lg"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="max-w-xl mx-auto mt-6 bg-white shadow p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-3">Participant Details</h2>

          <p><b>Name:</b> {result.full_name}</p>
          <p><b>Email:</b> {result.email}</p>
          <p><b>Phone:</b> {result.phone}</p>
          <p><b>College:</b> {result.college}</p>
        </div>
      )}

    </div>
  );
}
