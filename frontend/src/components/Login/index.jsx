import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    Lock,
    Mail,
    ArrowRight,
    ShieldCheck,
    AlertCircle,
    Loader2,
    ChevronRight
} from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                login(data.user, data.token);
                navigate("/");
            } else {
                setError(data.message || "Invalid credentials");
            }
        } catch (err) {
            setError("Network failure. Please reconnect.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#050505] p-4 font-sans relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none" />

            <div className="w-full max-w-lg relative flex flex-col items-center scale-90 md:scale-100 origin-center">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 flex items-center gap-3 drop-shadow-[0_5px_15px_rgba(255,255,255,0.1)]">
                        <span className="opacity-100">Homlie Product</span>
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent italic">Admin</span>
                    </h1>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-4" />
                    <p className="text-white font-black text-[10px] uppercase tracking-[0.6em] ml-2 drop-shadow-sm">Authorized Personnel Only</p>
                </div>

                <div className="w-full bg-[#0f0f0f]/60 backdrop-blur-3xl rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-500">
                    <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="block text-[10px] font-black text-white uppercase tracking-[0.3em] mb-3 ml-4 drop-shadow-sm">
                                    Identity Handle
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center text-white/40 group-focus-within:text-white transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full pl-16 pr-8 py-5 bg-black/60 border border-white/10 rounded-2xl text-white font-black focus:ring-4 focus:ring-white/5 focus:border-white/30 outline-none transition-all duration-500 placeholder:text-white/20 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-[10px] font-black text-white uppercase tracking-[0.3em] mb-3 ml-4 drop-shadow-sm">
                                    Security Key
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center text-white/40 group-focus-within:text-white transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-16 pr-8 py-5 bg-black/60 border border-white/10 rounded-2xl text-white font-black focus:ring-4 focus:ring-white/5 focus:border-white/30 outline-none transition-all duration-500 placeholder:text-white/20 shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded-xl border border-rose-500/20 animate-in slide-in-from-top-2 duration-300">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full overflow-hidden rounded-2xl shadow-2xl shadow-indigo-600/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500 group-hover:scale-110" />
                            <div className={`relative px-8 py-4 md:py-5 flex items-center justify-center gap-3 text-white font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 ${loading ? "opacity-50" : "group-hover:gap-5"}`}>
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Initiate Authentication
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center space-y-2 animate-in fade-in duration-1000 delay-500">
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] leading-relaxed drop-shadow-sm">
                        End-to-End Encrypted Terminal • Ver 4.0.2
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
