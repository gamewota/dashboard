import { useEffect, useState } from "react";
import Container from '../components/Container';
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Checkmark from '../components/Checkmark';
import Crossmark from '../components/Crossmark';
import '../styles/verify.css';

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
      } catch (err: unknown) {
        setStatus("error");
        if (axios.isAxiosError(err)) {
          const respData = err.response?.data as { message?: string } | undefined;
          const message = respData?.message || err.message || 'Verification failed.';
          setMessage(message);
        } else {
          setMessage(String(err));
        }
      } finally {
        // Redirect after 2.5 seconds
        setTimeout(() => navigate("/dashboard/"), 2500);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <Container className="flex-col items-center justify-center bg-base-100 min-h-screen">
      {/* Animation container */}
      <div className="flex flex-col items-center">
        {status === "loading" && (
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-primary border-solid"></div>
        )}

        {status === "success" && <Checkmark />}
        {status === "error" && <Crossmark />}

        {/* Message */}
        <p className="mt-6 text-lg font-semibold text-center">{message}</p>
      </div>

      {/* Styles moved to `src/styles/verify.css` */}
    </Container>
  );
};

export default VerifyUser;
