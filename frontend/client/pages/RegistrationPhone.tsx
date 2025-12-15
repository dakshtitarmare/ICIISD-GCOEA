import { useEffect, useState, useRef, useCallback } from "react";
import QrScanner from "react-qr-scanner";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Lottie from "lottie-react";
import successAnim from "@/assets/Rolling Check Mark.json";

// shadcn dialog
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

export default function CommitteeRegistrationPhone() {
  const navigate = useNavigate();

  // State variables
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Scanner key to force re-render
  const [scannerKey, setScannerKey] = useState(0);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadyAssignedModal, setShowAlreadyAssignedModal] = useState(false); // ⭐ NEW
  const [assignEmail, setAssignEmail] = useState("");
  const [currentQR, setCurrentQR] = useState("");
  
  // ⭐ NEW: Store assignment info for the popup
  const [assignedInfo, setAssignedInfo] = useState({
    email: "",
    name: "",
    qr_hash: ""
  });

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
  // Reset Scanner Function
  // ----------------------------------------------------
  const resetScanner = useCallback(() => {
    setScanResult(null);
    setCurrentQR("");
    setAssignEmail("");
    setScannerKey(prev => prev + 1);
    scannerActive.current = true;
    setLoading(false);
  }, []);

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
        resetScanner();
        return;
      }

      if (json.data.exists && !json.data.is_assigned) {
        toast("Unassigned QR Found");
        setShowAssignModal(true);
      }

      if (json.data.is_assigned) {
        // ⭐ Store the assigned info and show modal instead of toast
        setAssignedInfo({
          email: json.data.assigned_to_email || "Unknown",
          name: json.data.assigned_to_name || "Unknown",
          qr_hash: qr_hash
        });
        setShowAlreadyAssignedModal(true); // ⭐ Show modal instead of toast
      }
    } catch (err) {
      toast.error("Network error");
      resetScanner();
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

      // show success animation
      setShowSuccessModal(true);

      // Auto close success modal and reset scanner
      setTimeout(() => {
        setShowSuccessModal(false);
        resetScanner();
      }, 1800);

    } catch (err) {
      toast.error("Error assigning QR");
      resetScanner();
    }
  };

  // ----------------------------------------------------
  // Handle Already Assigned Modal OK button
  // ----------------------------------------------------
  const handleAlreadyAssignedOK = () => {
    setShowAlreadyAssignedModal(false);
    resetScanner();
  };

  // ----------------------------------------------------
  // Handle modal cancellations
  // ----------------------------------------------------
  const handleCancelAssign = () => {
    setShowAssignModal(false);
    resetScanner();
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
          key={scannerKey}
          delay={400}
          onError={(err) => console.error(err)}
          onScan={(data) => {
            if (data && scannerActive.current) {
              const value = data.text ?? data;
              console.log("📸 RAW SCAN:", data);
              setScanResult(value);
            }
          }}
          style={{ width: "100%" }}
        />

        {loading && <p className="text-blue-600 text-center mt-3">Checking QR…</p>}
        
        <div className="text-center mt-4">
          <button
            onClick={resetScanner}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Reset Scanner
          </button>
        </div>
      </div>

      {/* Result Panel */}
      {/* <div className="max-w-lg mx-auto mt-6">
        <div className="bg-white rounded-xl shadow p-5 border">
          <h3 className="text-lg font-semibold mb-3">Scan Result Details</h3>

          {!scanResult && <p className="text-gray-500 italic">No scan yet…</p>}

          {scanResult && (
            <div className="space-y-2">
              <p><b>QR Hash:</b> {scanResult}</p>
              <p><b>Status:</b> {showAssignModal ? "❌ Not Assigned" : loading ? "Checking..." : "Ready"}</p>
            </div>
          )}
        </div>
      </div> */}

      {/* ASSIGN POPUP */}
      <Dialog open={showAssignModal} onOpenChange={(open) => {
        if (!open) handleCancelAssign();
      }}>
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
              onClick={handleCancelAssign}
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

      {/* SUCCESS ANIMATION MODAL (for assignment) */}
      <Dialog open={showSuccessModal}>
        <DialogContent className="rounded-xl flex flex-col items-center justify-center py-6">
          <Lottie animationData={successAnim} loop={false} style={{ width: 160 }} />
          <h2 className="text-xl font-bold text-green-700 mt-2">
            QR Assigned Successfully!
          </h2>
        </DialogContent>
      </Dialog>

      {/* ⭐ NEW: ALREADY ASSIGNED POPUP MODAL */}
      <Dialog open={showAlreadyAssignedModal} onOpenChange={setShowAlreadyAssignedModal}>
        <DialogContent className="rounded-xl bg-white shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-amber-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              QR Already Assigned
            </DialogTitle>
            <DialogDescription>
              This QR code has already been assigned to a participant.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium text-gray-700">QR Hash:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{assignedInfo.qr_hash}</span>
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium text-gray-700">Assigned To:</span>
              <span className="font-semibold text-blue-600">{assignedInfo.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-600">{assignedInfo.email}</span>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Each QR code can only be assigned to one participant.
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-4">
            <button
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors w-full"
              onClick={handleAlreadyAssignedOK}
            >
              OK, Scan Next QR
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}