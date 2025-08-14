import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

type StatusType = "loading" | "success" | "error";

const VerifyUser = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState<StatusType>("loading");
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token is missing.");
        return;
      }

      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/verify`, {
          params: { token },
        });
        setStatus("success");
        setMessage("Your account has been verified!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      } finally {
        // Redirect after 2.5 seconds
        setTimeout(() => navigate("/dashboard/"), 2500);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      {/* Animation container */}
      <div className="flex flex-col items-center">
        {status === "loading" && (
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-primary border-solid"></div>
        )}

        {status === "success" && (
          <div className="checkmark-container">
            <svg
              className="checkmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark__check"
                fill="none"
                d="M14 27l7 7 16-16"
              />
            </svg>
          </div>
        )}

        {status === "error" && (
          <div className="checkmark-container">
            <svg
              className="crossmark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
            >
              <circle
                className="checkmark__circle error"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <line
                className="checkmark__check error"
                x1="16"
                y1="16"
                x2="36"
                y2="36"
              />
              <line
                className="checkmark__check error"
                x1="36"
                y1="16"
                x2="16"
                y2="36"
              />
            </svg>
          </div>
        )}

        {/* Message */}
        <p className="mt-6 text-lg font-semibold text-center">{message}</p>
      </div>

      {/* Styles for checkmark & cross */}
      <style>{`
        .checkmark-container {
          width: 80px;
          height: 80px;
        }
        .checkmark {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #4CAF50;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #4CAF50;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #4CAF50;
          fill: none;
          animation: stroke 0.6s cubic-bezier(.65, 0, .45, 1) forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(.65, 0, .45, 1) 0.8s forwards;
        }
        .crossmark .checkmark__circle.error {
          stroke: #F44336;
        }
        .crossmark .checkmark__check.error {
          stroke: #F44336;
          stroke-width: 3;
        }
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill {
          100% { box-shadow: inset 0px 0px 0px 30px #fff; }
        }
      `}</style>
    </div>
  );
};

export default VerifyUser;
