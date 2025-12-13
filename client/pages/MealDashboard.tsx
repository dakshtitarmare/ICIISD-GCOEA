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

export default function MealScanner() { 
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [participant, setParticipant] = useState<any>(null);
    const [meals, setMeals] = useState<any>(null);

    const [confirmMeal, setConfirmMeal] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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

            if (!res.data.success) {
                toast.error(res.data.message);
                scannerActive.current = true;
                return;
            }

            const data = res.data.data;
            console.log("🔥 FULL DATA RECEIVED:", data);

            setParticipant(data.participant);
            setMeals(data.meals);

        } catch (err) {
            toast.error("Network error");
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
            <h1 className="text-3xl font-bold mb-4">Meal Scanner</h1>

            {/* QR Scanner */}
            {!participant && (
                <div className="bg-white p-5 shadow rounded-xl max-w-lg mx-auto">
                    <h2 className="text-xl font-semibold mb-3">Scan QR</h2>

                    <QrScanner
                        delay={400}
                        onError={(err) => console.error(err)}
                        onScan={(data) => {
                            if (data) {
                                const value = data.text ?? data;
                                setScanResult(value);
                            }
                        }}
                        style={{ width: "100%" }}
                    />

                    {loading && <p className="text-blue-600 mt-3">Checking meal…</p>}
                </div>
            )}

            {/* Participant + Meal Buttons */}
            {participant && meals && (
                <div className="bg-white shadow rounded-xl p-5 max-w-xl mx-auto mt-5">
                    <h2 className="text-xl font-bold">{participant.name}</h2>
                    <p className="text-gray-600">{participant.email}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        {mealKeys.map((mealKey) => (
                            <button
                                key={mealKey}
                                className={`p-4 text-lg font-semibold rounded-xl 
                            ${meals[mealKey]
                                    ? "bg-red-200 text-red-800"
                                    : "bg-green-200 text-green-900"}
                        `}
                                onClick={() => handleMealClick(mealKey)}
                            >
                                {mealLabels[mealKey]}
                                <br />
                                {meals[mealKey] ? "Taken" : "Available"}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Confirm Popup */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogTitle>Confirm Meal</DialogTitle>

                    <p className="mt-3">
                        Mark as taken:
                        <b className="ml-1">{mealLabels[confirmMeal || ""]}</b>
                    </p>

                    <DialogFooter className="mt-4">
                        <button className="px-4 py-2 border rounded" onClick={() => setShowConfirm(false)}>
                            Cancel
                        </button>

                        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={updateMeal}>
                            Yes, Update
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Animation */}
            <Dialog open={showSuccess}>
                <DialogContent className="flex flex-col items-center py-6">
                    <Lottie animationData={successAnim} loop={false} style={{ width: 140 }} />
                    <h2 className="text-xl font-bold text-green-700 mt-2">
                        Meal Updated!
                    </h2>
                </DialogContent>
            </Dialog>
        </div>
    );
}
