import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../utils/firebase'
import api from '../../utils/axios'
import { FcGoogle } from "react-icons/fc";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SideBar from '../components/SideBar';
import ChatArea from '../components/ChatArea';
import Artifact from '../components/Artifact';
import { setUserdata } from "../redux/userSlice";
;

function Home() {
    const {userData}=useSelector(state=>state.user)
   const dispatch = useDispatch()
    const [authMode, setAuthMode] = useState("login")
    const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [authLoading, setAuthLoading] = useState(false)
    const [authError, setAuthError] = useState("")
    const [authSuccess, setAuthSuccess] = useState("")
    const handleLogin = async (token) => {
        try {
            const { data } = await api.post("/api/auth/login", { token })
            dispatch(setUserdata(data))
            setAuthError("")
        } catch (error) {
            setAuthError(error.response?.data?.message || "Google sign-in failed. Please try again.")
        }
    }

    const googleLogin = async () => {
        setAuthLoading(true)
        setAuthError("")
        try {
            const data = await signInWithPopup(auth, googleProvider)
            const token = await data.user.getIdToken()
            await handleLogin(token)
        } catch (error) {
            setAuthError(error.response?.data?.message || error.message || "Google sign-in failed. Please try again.")
        } finally {
            setAuthLoading(false)
        }
    }

    const handleManualAuth = async (event) => {
        event.preventDefault()
        setAuthError("")
        setAuthSuccess("")
        setAuthLoading(true)
        try {
            if (authMode === "register") {
                const { data } = await api.post("/api/auth/register", authForm)
                setAuthMode("login")
                setAuthForm(current => ({ ...current, password: "", confirmPassword: "" }))
                setAuthSuccess(data.message || "Account created. You can now sign in.")
            } else {
                const { data } = await api.post("/api/auth/login", {
                    email: authForm.email,
                    password: authForm.password
                })
                dispatch(setUserdata(data))
            }
        } catch (error) {
            const validationErrors = error.response?.data?.errors
            const firstValidationError = validationErrors && Object.values(validationErrors)[0]
            setAuthError(firstValidationError || error.response?.data?.message || "Unable to authenticate. Please try again.")
        } finally {
            setAuthLoading(false)
        }
    }

    if (!userData) {
        const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500/60"
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#0d0f14] px-4 py-8 text-white">
                <section className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#13151c] p-7 shadow-2xl">
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold tracking-tight">{authMode === "register" ? "Create your account" : "Welcome to MultimindAI"}</h1>
                        <p className="mt-1.5 text-sm text-slate-500">{authMode === "register" ? "Sign up with your email and password." : "Sign in to continue to your workspace."}</p>
                    </div>

                    <form className="flex flex-col gap-3.5" onSubmit={handleManualAuth}>
                        {authMode === "register" && (
                            <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                                Full name
                                <input className={inputClass} autoComplete="name" value={authForm.name} onChange={event => setAuthForm({ ...authForm, name: event.target.value })} placeholder="Your name" required maxLength={100} />
                            </label>
                        )}
                        <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                            Email
                            <input className={inputClass} type="email" autoComplete="email" value={authForm.email} onChange={event => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@example.com" required maxLength={254} />
                        </label>
                        <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                            Password
                            <input className={inputClass} type={showPassword ? "text" : "password"} autoComplete={authMode === "register" ? "new-password" : "current-password"} value={authForm.password} onChange={event => setAuthForm({ ...authForm, password: event.target.value })} placeholder={authMode === "register" ? "At least 8 characters" : "Your password"} required minLength={authMode === "register" ? 8 : undefined} />
                        </label>
                        {authMode === "register" && (
                            <label className="flex flex-col gap-1.5 text-xs text-slate-400">
                                Confirm password
                                <input className={inputClass} type={showPassword ? "text" : "password"} autoComplete="new-password" value={authForm.confirmPassword} onChange={event => setAuthForm({ ...authForm, confirmPassword: event.target.value })} placeholder="Re-enter your password" required />
                            </label>
                        )}
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                            <input type="checkbox" checked={showPassword} onChange={event => setShowPassword(event.target.checked)} className="accent-indigo-500" />
                            Show password
                        </label>

                        {authError && <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{authError}</p>}
                        {authSuccess && <p role="status" className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{authSuccess}</p>}

                        <button disabled={authLoading} type="submit" className="mt-1 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50">
                            {authLoading ? "Please wait..." : authMode === "register" ? "Create account" : "Sign in"}
                        </button>
                    </form>

                    <div className="my-5 flex items-center gap-3 text-[11px] text-slate-600"><span className="h-px flex-1 bg-white/[0.08]" />or<span className="h-px flex-1 bg-white/[0.08]" /></div>
                    <button disabled={authLoading} className="w-full flex items-center justify-center gap-3 rounded-xl bg-white py-3 text-sm font-medium text-black/90 transition-colors hover:bg-gray-200 disabled:opacity-50" onClick={googleLogin}>
                        <FcGoogle size={16} /> Continue With Google
                    </button>

                    <p className="mt-5 text-center text-sm text-slate-500">
                        {authMode === "register" ? "Already have an account? " : "New to MultimindAI? "}
                        <button type="button" className="font-medium text-indigo-300 hover:text-indigo-200" onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); setAuthSuccess(""); }}>
                            {authMode === "register" ? "Sign in" : "Create an account"}
                        </button>
                    </p>
                </section>
            </main>
        )
    }

    return (
        <div className='h-screen min-w-0 flex bg-[#0d0f14] text-white overflow-hidden'>

<SideBar/>
<ChatArea/>
<Artifact/>


        </div>
    )
}

export default Home
