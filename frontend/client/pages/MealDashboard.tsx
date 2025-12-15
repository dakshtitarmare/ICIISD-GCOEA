import { useEffect, useState, useRef } from "react";
import QrScanner from "react-qr-scanner";
import axios from "axios";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import Lottie from "lottie-react";
import successAnim from "@/assets/Rolling Check Mark.json";
import errorAnim from "@/assets/Error animation.json"; // ⭐ Add error animation file

// If you don't have error-animation.json, you can use this alternative:
// import { AlertTriangle, XCircle } from "lucide-react";

export default function MealScanner() { 
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [participant, setParticipant] = useState<any>(null);
    const [meals, setMeals] = useState<any>(null);

    const [confirmMeal, setConfirmMeal] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false); // ⭐ NEW: Error modal state
    const [errorMessage, setErrorMessage] = useState(""); // ⭐ NEW: Error message

    const scannerActive = useRef(true);

    // ALWAYS show Day 1 meals (your requirement for now)
    const mealKeys = [
        "day1_breakfast",
        "day1_lunch",
        "day1_hitea",
        "day2_breakfast",
        "day2_lunch",
        "day2_hitea",
    ];

    // 🔥 Detect Day 1 or Day 2 automatically
    const detectDay = () => {
        const day = new Date().getDate();
        if (day === 18) return 1;
        if (day === 19) return 2;
        return 1; // default fallback
    };

    // ----------------------------------------------------------------
    // QR scanned → Fetch Meal Status
    // ----------------------------------------------------------------
    useEffect(() => {
        if (scanResult && scannerActive.current) {
            scannerActive.current = false;
            fetchMealStatus(scanResult);
        }
    }, [scanResult]);

    const fetchMealStatus = async (qr_hash: string) => {
        setLoading(true);

        try {
            const res = await axios.get("http://127.0.0.1:4000/api/meal/status", {
                params: { qr_hash },
            });

            console.log("🔥 API Response:", res.data);

            if (!res.data.success) {
                // ⭐ Show error modal instead of toast
                setErrorMessage(res.data.message || "Participant not found");
                setShowError(true);
                scannerActive.current = true;
                return;
            }

            const data = res.data.data;
            console.log("🔥 FULL DATA RECEIVED:", data);

            setParticipant(data.participant);
            setMeals(data.meals);

        } catch (err: any) {
            console.error("💥 Fetch Error:", err);
            
            // ⭐ Handle different types of errors
            let errorMsg = "Network error";
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.message) {
                errorMsg = err.message;
            }
            
            setErrorMessage(errorMsg);
            setShowError(true);
            scannerActive.current = true;
        }

        setLoading(false);
    };

    // ----------------------------------------------------------------
    // Meal Button Click → Show Confirm Popup
    // ----------------------------------------------------------------
    const handleMealClick = (mealKey: string) => {
        if (meals[mealKey]) {
            toast.error("Already taken!");
            return;
        }
        setConfirmMeal(mealKey);
        setShowConfirm(true);
    };

    // ----------------------------------------------------------------
    // Confirm Meal → Update backend
    // ----------------------------------------------------------------
    const updateMeal = async () => {
        if (!confirmMeal) return;

        const meal_type = confirmMeal.split("_")[1]; // breakfast / lunch / hitea
        const day = detectDay(); // pass 1 or 2

        try {
            const res = await axios.post("http://127.0.0.1:4000/api/meal/update", {
                qr_hash: scanResult,
                meal_type,
                day,
            });

            if (!res.data.success) {
                toast.error(res.data.message);
                return;
            }

            // Success animation
            setShowConfirm(false);
            setShowSuccess(true);

            // Update UI instantly
            setMeals((prev: any) => ({ ...prev, [confirmMeal]: true }));

            setTimeout(() => {
                setShowSuccess(false);
                resetScanner();
            }, 1500);

        } catch (err) {
            toast.error("Failed to update meal");
            scannerActive.current = true;
        }
    };

    // ⭐ NEW: Handle error modal close
    const handleErrorClose = () => {
        setShowError(false);
        setErrorMessage("");
        resetScanner();
    };

    // Reset UI to scan next QR
    const resetScanner = () => {
        setScanResult(null);
        setParticipant(null);
        setMeals(null);
        setConfirmMeal(null);
        scannerActive.current = true;
    };

    const mealLabels: Record<string, string> = {
        day1_breakfast: "Day 1 Breakfast",
        day1_lunch: "Day 1 Lunch",
        day1_hitea: "Day 1 Hi-Tea",

        day2_breakfast: "Day 2 Breakfast",
        day2_lunch: "Day 2 Lunch",
        day2_hitea: "Day 2 Hi-Tea",
    };

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4 text-center">Meal Scanner</h1>
            <p className="text-gray-600 text-center mb-6">Scan participant QR codes to manage meals</p>

            {/* QR Scanner */}
            {!participant && (
                <div className="bg-white p-5 shadow-lg rounded-xl max-w-lg mx-auto border border-gray-200">
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                        Scan QR Code
                    </h2>

                    <QrScanner
                        delay={400}
                        onError={(err) => console.error(err)}
                        onScan={(data) => {
                            if (data && scannerActive.current) {
                                const value = data.text ?? data;
                                console.log("📸 Scanned:", value);
                                setScanResult(value);
                            }
                        }}
                        style={{ width: "100%" }}
                    />

                    {loading && (
                        <div className="mt-4 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                            <p className="text-blue-600 mt-2">Checking participant...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Participant + Meal Buttons */}
            {participant && meals && (
                <div className="bg-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mt-5 border border-gray-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">{participant.name}</h2>
                        <p className="text-gray-600">{participant.email}</p>
                        <div className="mt-2 inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                            {participant.college || "No college specified"}
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Meal Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mealKeys.map((mealKey) => (
                            <button
                                key={mealKey}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                                    meals[mealKey]
                                        ? "border-red-300 bg-gradient-to-br from-red-50 to-red-100"
                                        : "border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:border-green-400"
                                }`}
                                onClick={() => handleMealClick(mealKey)}
                                disabled={meals[mealKey]}
                            >
                                <div className="text-left">
                                    <div className="font-bold text-lg mb-1">
                                        {mealLabels[mealKey]}
                                    </div>
                                    <div className={`text-sm font-semibold ${
                                        meals[mealKey] ? "text-red-700" : "text-green-700"
                                    }`}>
                                        {meals[mealKey] ? (
                                            <span className="flex items-center gap-1">
                                                <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                                                Already Taken
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                                                Click to Mark
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                        <button
                            onClick={resetScanner}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                            Scan Another QR
                        </button>
                        <div className="text-sm text-gray-500">
                            Current Day: <span className="font-semibold">Day {detectDay()}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Meal Popup */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="rounded-xl bg-white max-w-md">
                    <DialogTitle className="text-xl font-bold text-gray-800">
                        Confirm Meal
                    </DialogTitle>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-700">
                            Mark <span className="font-bold text-blue-700">{mealLabels[confirmMeal || ""]}</span> as taken for:
                        </p>
                        <p className="font-bold text-lg mt-2">{participant?.name}</p>
                        <p className="text-gray-600 text-sm">{participant?.email}</p>
                    </div>

                    <DialogFooter className="mt-6 gap-3">
                        <button 
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            onClick={() => setShowConfirm(false)}
                        >
                            Cancel
                        </button>

                        <button 
                            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition shadow-md"
                            onClick={updateMeal}
                        >
                            Confirm & Update
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Animation */}
            <Dialog open={showSuccess}>
                <DialogContent className="rounded-xl flex flex-col items-center justify-center py-8 max-w-sm">
                    <Lottie 
                        animationData={successAnim} 
                        loop={false} 
                        style={{ width: 160, height: 160 }} 
                    />
                    <h2 className="text-xl font-bold text-green-700 mt-4">
                        Meal Updated Successfully!
                    </h2>
                    <p className="text-gray-600 text-center mt-2">
                        {mealLabels[confirmMeal || ""]} marked as taken
                    </p>
                </DialogContent>
            </Dialog>

            {/* ⭐ NEW: Error Modal for Unassigned/Invalid QR */}
            <Dialog open={showError} onOpenChange={setShowError}>
                <DialogContent className="rounded-xl bg-white max-w-md">
                    <div className="flex flex-col items-center justify-center py-6">
                        {/* Option 1: Using Lottie animation */}
                        {errorAnim ? (
                            <Lottie 
                                animationData={errorAnim} 
                                loop={false} 
                                style={{ width: 140, height: 140 }} 
                            />
                        ) : (
                            /* Option 2: Using SVG icons if animation file not available */
                            <div className="h-32 w-32 flex items-center justify-center mb-4">
                                <div className="relative">
                                    <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="h-16 w-16 text-red-600" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={1.5} 
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" 
                                            />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-2 -right-2 h-10 w-10 bg-red-600 rounded-full flex items-center justify-center">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="h-6 w-6 text-white" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M6 18L18 6M6 6l12 12" 
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-bold text-red-700 mt-4">
                            Participant Not Found
                        </h2>
                        
                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 w-full">
                            <p className="text-red-800 text-center">
                                {errorMessage || "This QR code is not assigned to any participant."}
                            </p>
                        </div>

                        <div className="mt-2 text-sm text-gray-600 text-center">
                            Scanned QR: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{scanResult?.substring(0, 20)}...</span>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleErrorClose}
                                className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-lg hover:from-gray-800 hover:to-gray-900 transition shadow-md w-48"
                            >
                                OK, Scan Again
                            </button>
                        </div>

                        <div className="mt-4 text-sm text-gray-500 text-center">
                            <p>Make sure the QR code is properly assigned in the registration system.</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Help Text */}
            <div className="max-w-2xl mx-auto mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
                <ul className="text-sm text-blue-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <li className="flex items-start gap-2">
                        <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">1</span>
                        </div>
                        <span>Scan participant QR code</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">2</span>
                        </div>
                        <span>Click on available meals to mark them as taken</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">3</span>
                        </div>
                        <span>Red meals are already taken</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold">4</span>
                        </div>
                        <span>Green meals are available for marking</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}