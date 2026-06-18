import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AuthLayout from "../../../components/layout/AuthLayout";
import redInfoIcon from "../../../assets/Red-Info.svg";
import React from "react";
import { getHighestRole, getDashboardPath } from "../../../utils/roleUtils";

function Login() {
  const navigator = useNavigate();

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [userFocus, setUserFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userRef.current) {
      userRef.current.focus();
    }

    // Redirect if already logged in
    const savedUser = localStorage.getItem("user");
    if (savedUser && savedUser !== "undefined") {
      try {
        const userData = JSON.parse(savedUser);
        const highestRole = getHighestRole(userData.roles);
        if (highestRole) {
          navigator(getDashboardPath(highestRole));
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, [navigator]);

  const postRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await axios.post(
        "/api/auth/login",
        {
          username: user,
          password: password,
        },
      );
      setErrMsg("");
      const userData = { ...result.data };
      const accessToken = userData.accessToken;
      
      delete userData.accessToken;
      delete userData.refreshToken;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      const highestRole = getHighestRole(userData.roles);
      if (highestRole) {
        navigator(getDashboardPath(highestRole));
      } else {
        navigator("/main/dashboard/userrole"); // Fallback
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const { status, data } = err.response;
        if (status === 429) {
          setErrMsg(data.message || "Too many requests — please try again later");
        } else if (status === 401) {
          setErrMsg(data.message || "Authentication failed");
        } else if (data.message) {
          setErrMsg(data.message);
        } else {
          setErrMsg("Invalid Username or Password");
        }
      } else {
        setErrMsg("Network error or server is down. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthLayout />
      <div className="w-full p-4 flex justify-center items-center h-[100vh] overflow-y-auto">
        <div className="p-7 sm:p-16 rounded-[12px] flex flex-col gap-6 w-[550px]">
          
          <div className="flex justify-center items-center flex-col gap-1">
            <h2 className="text-[28px] max-sm:text-[20px] font-extrabold">
              Log in
            </h2>
            <p className="text-center text-[15px] text-color-white/40 w-[85%]">
              Welcome back! Log in to your account to continue and access your dashboard and features.
            </p>
          </div>

          <div className={`flex gap-3 bg-color-red/10 border border-color-red/35 p-4 rounded-[12px] transition-all duration-300 shadow-md shadow-color-red/5 items-start animate-fade-in-slide-down
            ${errMsg != "" ? '' : "hidden"}
            `}>
            <div className="shrink-0 mt-0.5">
                <img src={redInfoIcon} alt="Red Info" className="w-5 h-5 object-contain" />
            </div>
            <h2 className="text-color-red font-semibold text-[14px] leading-relaxed select-text">{errMsg}</h2>
          </div>

          <form onSubmit={postRegister} className="flex flex-col gap-5">

            <div className="flex flex-col gap-3">
              <input
                type="text"
                id="username"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                required
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
                placeholder="username"
                className={`w-full h-[47px] rounded-full pl-5  
                                placeholder:text-color-white/10
                                max-sm:h-[45px]
                                bg-transparent border border-color-white/20
                                `}
              />
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="password"
                id="password"
                autoComplete="off"
                onChange={(e) => setPassword(e.target.value)}
                required
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                placeholder="password"
                className={`w-full h-[47px] rounded-full pl-5   
                                placeholder:text-color-white/10
                                max-sm:h-[45px]
                                bg-transparent border border-color-white/20
                                `}
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 max-sm:h-11 bg-color-white rounded-full text-color-gray1 font-medium flex items-center justify-center gap-2 transition-all duration-200
              ${loading ? 'opacity-75 cursor-not-allowed scale-[0.98]' : 'hover:opacity-90 active:scale-[0.98]'}
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <div>
            <h3 className="max-sm:text-[14px] text-center">
              Create Account?{" "}
              <a href="signup" className="text-color-purple">
                Sign up
              </a>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
