import { useEffect, useState, useRef } from "react";
import QrScanner from "react-qr-scanner";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Lottie from "lottie-react";
import successAnim from "@/assets/Rolling Check Mark.json"; // ⭐ add file

// shadcn dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CommitteeRegistrationPhone() {
  const navigate = useNavigate();

  // State variables
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ⭐ NEW
  const [assignEmail, setAssignEmail] = useState("");
  const [currentQR, setCurrentQR] = useState("");

  const scannerActive = useRef(true);

  const role = localStorage.getItem("role");

  // 1️⃣ Page Access Restriction
  useEffect(() => {
    if (role !== "phone_registration") {
      toast.error("Access Denied: Only registration phone can access this page");
      navigate("/login");
    }
  }, []);

  // 2️⃣ When QR is scanned
  useEffect(() => {
    if (scanResult && scannerActive.current) {
      scannerActive.current = false;
      handleQRCheck(scanResult);
    }
  }, [scanResult]);

  // ----------------------------------------------------
  // 🔍 CHECK QR STATUS
  // ----------------------------------------------------
  const handleQRCheck = async (qr_hash: string) => {
    setLoading(true);
    setCurrentQR(qr_hash);

    try {
      console.log("📡 Checking QR:", qr_hash);

      const res = await axios.get("http://127.0.0.1:4000/api/qr/check", {
        params: { qr_hash },
      });

      const json = res.data;
      console.log("🔍 QR Check Response:", json);

      if (!json.success) {
        toast.error(json.message);
        scannerActive.current = true;
        return;
      }

      if (json.data.exists && !json.data.is_assigned) {
        toast("Unassigned QR Found");
        setShowAssignModal(true);
      }

      if (json.data.is_assigned) {
        toast.success("Already Assigned to " + json.data.assigned_to_email);
        scannerActive.current = true;
      }
    } catch (err) {
      toast.error("Network error");
      scannerActive.current = true;
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // 🔗 ASSIGN QR CODE
  // ----------------------------------------------------
  const assignQR = async () => {
    if (!assignEmail.trim()) {
      toast.error("Please enter participant email");
      return;
    }

    try {
      console.log("Calling assign API...");

      const res = await axios.post("http://127.0.0.1:4000/api/qr/assign", {
        qr_hash: currentQR,
        email: assignEmail,
      });

      const json = res.data;
      console.log("Assign response:", json);

      if (!json.success) {
        toast.error(json.message);
        return;
      }

      // close assign modal
      setShowAssignModal(false);

      // show success animation ⭐
      setShowSuccessModal(true);

      // reset
      setAssignEmail("");
      setScanResult(null);

      // auto close success modal
      setTimeout(() => {
        setShowSuccessModal(false);
        scannerActive.current = true; // enable next scan
      }, 1800);

    } catch (err) {
      toast.error("Error assigning QR");
      scannerActive.current = true;
    }
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold">Registration Phone Scanner</h1>
        <p className="text-gray-600">Scan and assign participant QR codes</p>
      </div>

      {/* QR Scanner */}
      <div className="bg-white shadow-md rounded-xl p-5 max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-3">QR Scanner</h2>

        <QrScanner
          delay={400}
          onError={(err) => console.error(err)}
          onScan={(data) => {
            if (data) {
              const value = data.text ?? data;
              console.log("📸 RAW SCAN:", data);
              setScanResult(value);
            }
          }}
          style={{ width: "100%" }}
        />

        {loading && <p className="text-blue-600 text-center mt-3">Checking QR…</p>}
      </div>

      {/* Result Panel */}
      <div className="max-w-lg mx-auto mt-6">
        <div className="bg-white rounded-xl shadow p-5 border">
          <h3 className="text-lg font-semibold mb-3">Scan Result Details</h3>

          {!scanResult && <p className="text-gray-500 italic">No scan yet…</p>}

          {scanResult && (
            <div className="space-y-2">
              <p><b>QR Hash:</b> {scanResult}</p>
              {/* Show email and name of user  */}
              <p><b>Status:</b> {showAssignModal ? "❌ Not Assigned" : "✅ Assigned"}</p>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGN POPUP */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Assign QR Code</DialogTitle>
          </DialogHeader>

          <p>QR <b>{currentQR}</b> is unassigned.</p>

          <input
            type="email"
            value={assignEmail}
            onChange={(e) => setAssignEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mt-3"
            placeholder="participant@example.com"
          />

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <button
              className="px-4 py-2 border rounded-md"
              onClick={() => {
                setShowAssignModal(false);
                setAssignEmail("");
                scannerActive.current = true;
              }}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={assignQR}
            >
              Assign
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SUCCESS ANIMATION MODAL ⭐ */}
      <Dialog open={showSuccessModal}>
        <DialogContent className="rounded-xl flex flex-col items-center justify-center py-6">
          <Lottie animationData={successAnim} loop={false} style={{ width: 160 }} />
          <h2 className="text-xl font-bold text-green-700 mt-2">
            QR Assigned Successfully!
          </h2>
        </DialogContent>
      </Dialog>

    </div>
  );
}
