import { useState, useCallback } from 'react';
import QRScanner from '@/components/QRScanner';
import MealForm from '@/components/MealForm';
import { lookupQR, scanMeal } from '@/lib/apiClient';
import { getCurrentConferenceDay } from '@/lib/dateUtils';
import { showSuccessToast, showErrorToast } from '@/lib/toastUtils';
import { AlertCircle } from 'lucide-react';
import { MealType } from '@/lib/dateUtils';

interface ParticipantInfo {
  id: string;
  name: string;
  email: string;
  category: 'presenter' | 'attendee';
  qr_code: string;
}

export default function FoodScan() {
  const [scannedQR, setScannedQR] = useState<string | null>(null);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [mealClaimed, setMealClaimed] = useState<string | null>(null);

  const currentDay = getCurrentConferenceDay();

  const handleQRScan = useCallback(async (qrData: string) => {
    setScannedQR(qrData);
    setIsLookingUp(true);
    setLookupError(null);
    setParticipantInfo(null);
    setMealClaimed(null);

    try {
      const participant = await lookupQR(qrData);
      setParticipantInfo(participant);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to lookup QR code';
      setLookupError(errorMsg);
      showErrorToast('Invalid QR Code: ' + errorMsg);
      setScannedQR(null);
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  const handleMealSubmit = useCallback(
    async (mealType: MealType) => {
      if (!scannedQR || !currentDay) return;

      setIsClaiming(true);
      try {
        const result = await scanMeal({
          qr_data: scannedQR,
          day: currentDay,
          meal_type: mealType,
        });

        if (result.success) {
          setMealClaimed(`${mealType.toUpperCase()} claimed successfully!`);
          showSuccessToast('Meal claimed: ' + mealType.toUpperCase());
          
          // Reset after 2 seconds
          setTimeout(() => {
            setScannedQR(null);
            setParticipantInfo(null);
            setMealClaimed(null);
          }, 2000);
        } else {
          showErrorToast(result.message || 'Failed to claim meal');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to claim meal';
        showErrorToast(errorMsg);
      } finally {
        setIsClaiming(false);
      }
    },
    [scannedQR, currentDay]
  );

  const handleReset = () => {
    setScannedQR(null);
    setParticipantInfo(null);
    setLookupError(null);
    setMealClaimed(null);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Meal Scanning
          </h1>
          <p className="text-gray-600">
            Scan QR code to claim your meal
          </p>
          {currentDay ? (
            <p className="text-sm font-semibold text-primary">
              Day {currentDay} - {currentDay === 1 ? 'Dec 19' : 'Dec 20'}
            </p>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                Conference dates are Dec 19-20. Current date appears to be outside this range.
              </p>
            </div>
          )}
        </div>

        {/* Success Message */}
        {mealClaimed && (
          <div className="glassmorphism border-2 border-green-300/50 p-4 text-center">
            <p className="text-green-700 font-semibold text-lg">
              ✓ {mealClaimed}
            </p>
          </div>
        )}

        {/* Main Content */}
        {!participantInfo ? (
          /* QR Scanner Section */
          <div className="glassmorphism p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Section A: Scan QR Code
            </h2>
            <QRScanner onScan={handleQRScan} />
          </div>
        ) : !mealClaimed ? (
          /* Meal Selection Section */
          <div className="space-y-4">
            {/* Participant Info Section */}
            <div className="glassmorphism p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Section B: Participant Info
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{participantInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-sm text-gray-700">{participantInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {participantInfo.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Meal Selection Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Section C: Meal Selection & Claim
              </h2>
              {currentDay ? (
                <MealForm
                  day={currentDay}
                  qrData={scannedQR || ''}
                  participantName={participantInfo.name}
                  participantCategory={participantInfo.category}
                  onSubmit={handleMealSubmit}
                  isLoading={isClaiming}
                />
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">
                    Cannot claim meal outside conference dates (Dec 19-20).
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Scan Another QR Code
            </button>
          </div>
        ) : null}

        {/* Lookup Error */}
        {lookupError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Lookup Error</p>
              <p className="text-sm text-red-700 mt-1">{lookupError}</p>
              <button
                onClick={handleReset}
                className="mt-3 text-sm font-semibold text-red-700 hover:text-red-800 underline"
              >
                Try scanning again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
