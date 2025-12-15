import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
// import Register from "./pages/Register";
// import FoodScan from "./pages/FoodScan";
import AdminLogin from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import RegistrationPhone from "./pages/RegistrationPhone";
import RegistrationLaptop from "./pages/RegistrationLaptop"
import MealDashboard from "./pages/MealDashboard";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* <Route path="/register" element={<Register />} /> */}
          {/* <Route path="/food-scan" element={<FoodScan />} /> */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/registration-phone/dashboard" element={<RegistrationPhone />} />
          <Route path="/registration-laptop/dashboard" element={<RegistrationLaptop />} />
          <Route path="/meal-dashboard" element={<MealDashboard />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
