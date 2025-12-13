// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { Copy, Check } from 'lucide-react';
// import { onspotRegister } from '@/lib/apiClient';
// import { showSuccessToast, showErrorToast } from '@/lib/toastUtils';

// interface RegistrationForm {
//   name: string;
//   email: string;
//   phone: string;
//   college: string;
//   category: 'presenter' | 'attendee';
// }

// export default function Register() {
//   const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<RegistrationForm>({
//     defaultValues: {
//       category: 'attendee',
//     },
//   });

//   const [registeredQR, setRegisteredQR] = useState<string | null>(null);
//   const [copiedToClipboard, setCopiedToClipboard] = useState(false);

//   const onSubmit = async (data: RegistrationForm) => {
//     try {
//       const result = await onspotRegister(data);
//       setRegisteredQR(result.qr_code);
//       showSuccessToast('Registration successful!');
//       reset();
//     } catch (error) {
//       const errorMsg = error instanceof Error ? error.message : 'Registration failed';
//       showErrorToast(errorMsg);
//     }
//   };

//   const copyToClipboard = () => {
//     if (registeredQR) {
//       navigator.clipboard.writeText(registeredQR);
//       setCopiedToClipboard(true);
//       setTimeout(() => setCopiedToClipboard(false), 2000);
//       showSuccessToast('QR code copied to clipboard!');
//     }
//   };

//   return (
//     <div className="min-h-screen px-4 py-8">
//       <div className="max-w-md mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">
//             On-Spot Registration
//           </h1>
//           <p className="text-gray-600 mt-2">
//             Register for the AI4SG Conference 2024
//           </p>
//         </div>

//         {registeredQR ? (
//           /* Success Screen */
//           <div className="space-y-6">
//             <div className="glassmorphism border-2 border-green-300/50 p-6 text-center space-y-4">
//               <div className="text-5xl">✨</div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 Registration Complete!
//               </h2>
//               <p className="text-gray-700">
//                 Welcome to AI4SG Conference 2024
//               </p>
//             </div>

//             {/* QR Code Display */}
//             <div className="glassmorphism p-6 space-y-4">
//               <div className="text-center">
//                 <p className="text-sm text-gray-600 font-semibold mb-3">
//                   Your QR Code ID
//                 </p>
//                 <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm break-all text-gray-800 min-h-16 flex items-center justify-center">
//                   {registeredQR}
//                 </div>
//               </div>

//               <button
//                 onClick={copyToClipboard}
//                 className="w-full glass-button flex items-center justify-center gap-2"
//               >
//                 {copiedToClipboard ? (
//                   <>
//                     <Check className="w-5 h-5" />
//                     Copied!
//                   </>
//                 ) : (
//                   <>
//                     <Copy className="w-5 h-5" />
//                     Copy QR Code
//                   </>
//                 )}
//               </button>

//               <div className="glassmorphism p-4 text-sm">
//                 <p className="text-gray-800">
//                   <span className="font-semibold">Save your QR code</span> for meal scanning during the conference.
//                 </p>
//               </div>
//             </div>

//             <button
//               onClick={() => {
//                 setRegisteredQR(null);
//                 reset();
//               }}
//               className="w-full glass-button-outline py-3 px-4 font-semibold"
//             >
//               Register Another Participant
//             </button>
//           </div>
//         ) : (
//           /* Registration Form */
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 glassmorphism p-8 md:p-10">
//             {/* Name Field */}
//             <div>
//               <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
//                 Full Name *
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 placeholder="John Doe"
//                 {...register('name', { required: 'Name is required' })}
//                 className="glass-input w-full"
//               />
//               {errors.name && (
//                 <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
//               )}
//             </div>

//             {/* Email Field */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
//                 Email *
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 placeholder="john@example.com"
//                 {...register('email', {
//                   required: 'Email is required',
//                   pattern: {
//                     value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                     message: 'Invalid email address',
//                   },
//                 })}
//                 className="glass-input w-full"
//               />
//               {errors.email && (
//                 <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Phone Field */}
//             <div>
//               <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
//                 Phone Number *
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 placeholder="+1 (555) 123-4567"
//                 {...register('phone', { required: 'Phone number is required' })}
//                 className="glass-input w-full"
//               />
//               {errors.phone && (
//                 <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
//               )}
//             </div>

//             {/* College Field */}
//             <div>
//               <label htmlFor="college" className="block text-sm font-semibold text-gray-800 mb-2">
//                 College / Organization *
//               </label>
//               <input
//                 id="college"
//                 type="text"
//                 placeholder="University of Example"
//                 {...register('college', { required: 'College is required' })}
//                 className="glass-input w-full"
//               />
//               {errors.college && (
//                 <p className="text-red-600 text-sm mt-1">{errors.college.message}</p>
//               )}
//             </div>

//             {/* Category Field */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-800 mb-3">
//                 Category *
//               </label>
//               <div className="flex gap-3">
//                 <label className="flex-1 relative cursor-pointer">
//                   <input
//                     type="radio"
//                     value="presenter"
//                     {...register('category')}
//                     className="sr-only"
//                   />
//                   <div className="p-3 rounded-lg border-2 border-white/40 text-center font-medium transition-colors hover:bg-white/20 has-[:checked]:bg-white/40 has-[:checked]:border-primary has-[:checked]:text-primary">
//                     Presenter
//                   </div>
//                 </label>
//                 <label className="flex-1 relative cursor-pointer">
//                   <input
//                     type="radio"
//                     value="attendee"
//                     {...register('category')}
//                     className="sr-only"
//                   />
//                   <div className="p-3 rounded-lg border-2 border-white/40 text-center font-medium transition-colors hover:bg-white/20 has-[:checked]:bg-white/40 has-[:checked]:border-primary has-[:checked]:text-primary">
//                     Attendee
//                   </div>
//                 </label>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="glass-button w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSubmitting ? 'Registering...' : 'Get QR Code'}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }
