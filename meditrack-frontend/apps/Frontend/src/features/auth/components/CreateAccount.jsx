import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import trashIcon from "../../../assets/Trash.svg";
import conformIcon from "../../../assets/Checkmark.svg";
import closeIcon from "../../../assets/Close.svg";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../../components/layout/AuthLayout";
import infoIcon from "../../../assets/Info.svg";
import redInfoIcon from "../../../assets/Red-Info.svg";

function CreateAccount({addOpen, setAddOpen}) {
  const navigator = useNavigate();

  const userRegex = /^[a-z][a-z0-9_]{3,20}$/;
  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  const userRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState("");
  const [emailFocus, setEmailFocus] = useState(false);

  const [user, setUser] = useState("");
  const validName = userRegex.test(user);
  const [userFocus, setUserFocus] = useState(false);

  const [password, setPassword] = useState("");
  const validPassword = passwordRegex.test(password);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userRef.current) {
      userRef.current.focus();
    }
  }, []);

  const postRegister = async (e) => {
    e.preventDefault();
    if (!validName) {
      setErrMsg("Invalid User Name");
      return;
    } else if (!validPassword) {
      setErrMsg("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        "/api/auth/register",
        {
          username: user,
          email: email,
          password: password,
        },
      );
      
      setAddOpen(false);
      
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.fieldErrors && data.fieldErrors.password) {
          setErrMsg(data.fieldErrors.password);
        } else if (data.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
          const firstErrorKey = Object.keys(data.fieldErrors)[0];
          setErrMsg(data.fieldErrors[firstErrorKey]);
        } else if (data.message) {
          setErrMsg(data.message);
        } else {
          setErrMsg("Registration failed. Please check details.");
        }
      } else {
        setErrMsg("Network error or server is down. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={postRegister} className="flex w-full flex-col gap-6">
      {errMsg && (
        <div className="flex gap-3 bg-color-red/10 border border-color-red/25 p-4 rounded-[8px] items-start animate-fade-in-slide-down shadow-md shadow-color-red/5">
          <img src={redInfoIcon} alt="Red Info" className="w-5 h-5 shrink-0 mt-0.5 object-contain" />
          <h2 className="text-color-red/95 text-[13px] font-semibold leading-relaxed select-text">{errMsg}</h2>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Email Address</label>
        <input
          type="email"
          id="email"
          ref={userRef}
          autoComplete="off"
          onChange={(e) => setEmail(e.target.value)}
          required
          onFocus={() => setEmailFocus(true)}
          onBlur={() => setUserFocus(false)}
          placeholder="example@mail.com"
          className="w-full h-[50px] bg-color-gray2 border border-color-white/10 rounded-[8px] px-5 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all placeholder:text-color-white/10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Username</label>
        <input
          type="text"
          id="username"
          autoComplete="off"
          onChange={(e) => setUser(e.target.value)}
          required
          onFocus={() => setUserFocus(true)}
          onBlur={() => setUserFocus(false)}
          placeholder="johndoe"
          className={`w-full h-[50px] rounded-[8px] px-5 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all placeholder:text-color-white/10
            ${user === "" ? "bg-color-gray2 border border-color-white/10" : validName ? "bg-color-green/5 border border-color-green/40" : "bg-color-red/5 border border-color-red/40"}`}
        />

        <div
          className={`flex gap-4 bg-color-red/5 p-4 rounded-[8px] border border-color-red/20 mt-1
            ${!validName && user != "" ? "" : "hidden"}`}
        >
          <img src={redInfoIcon} alt="Info" className="w-5 h-5 shrink-0" />
          <ul className="text-[11px] text-color-red/80 font-medium flex flex-col gap-1 list-disc pl-3">
            <li>Lowercase letters only, 4-20 chars.</li>
            <li>Numbers and underscores allowed.</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-bold text-color-white/60 uppercase tracking-wide">Password</label>
        <input
          type="password"
          id="password"
          autoComplete="off"
          onChange={(e) => setPassword(e.target.value)}
          required
          onFocus={() => setPasswordFocus(true)}
          onBlur={() => setPasswordFocus(false)}
          placeholder="••••••••"
          className={`w-full h-[50px] rounded-[8px] px-5 text-[14px] text-white focus:outline-none focus:border-color-purple transition-all placeholder:text-color-white/10
            ${password === "" ? "bg-color-gray2 border border-color-white/10" : validPassword ? "bg-color-green/5 border border-color-green/40" : "bg-color-red/5 border border-color-red/40"}`}
        />

        <div
          className={`flex gap-4 bg-color-red/5 p-4 rounded-[8px] border border-color-red/20 mt-1
            ${!validPassword && password != "" ? "" : "hidden"}`}
        >
          <img src={redInfoIcon} alt="Info" className="w-5 h-5 shrink-0" />
          <ul className="text-[11px] text-color-red/80 font-medium flex flex-col gap-1 list-disc pl-3">
            <li>Minimum 8 characters.</li>
            <li>Include uppercase, lowercase, number.</li>
            <li>Include 1 special character (# ? ! @ $ % ^ & * -).</li>
          </ul>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full h-12 bg-color-purple text-white rounded-[8px] font-bold text-[14px] flex items-center justify-center gap-2 transition-all duration-200 mt-2
        ${loading ? 'opacity-75 cursor-not-allowed scale-[0.98]' : 'hover:opacity-90 active:scale-[0.98]'}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creating Account...</span>
          </>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}

export default CreateAccount;
