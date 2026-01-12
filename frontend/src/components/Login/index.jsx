import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-[pop_0.4s_ease-out]">
                <div className="p-8">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-500 font-medium lowercase tracking-widest text-[10px] uppercase underline decoration-emerald-200 decoration-2 underline-offset-4">
                            Authorized Access Only
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@hommlie.com"
                                className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 placeholder:text-gray-300"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 placeholder:text-gray-300"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-xl border border-red-100 animate-[shake_0.4s_ease-in-out]">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-emerald-50/50 border-t border-emerald-100 text-center">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest leading-loose">
                        Secure Dashboard System v2.0<br />
                        © 2026 Admin Dashboard
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes pop {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
        </div>
    );
};

export default Login;
