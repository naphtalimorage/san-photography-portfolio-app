import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import PortfolioPage from "./pages/PortfolioPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import AdminDashboard from "./pages/Admin.tsx";
import {ThemeProvider} from "@/context/ThemeProvider.tsx";

const queryClient = new QueryClient();

const App = () => (
    <ThemeProvider>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/portfolio" element={<PortfolioPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    </ThemeProvider>

);

export default App;
