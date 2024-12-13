import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Waiting: React.FC = () => {  

  const [uuid, setUuid] = useState("");
  const ApiKey = process.env.VITE_PUBLIC_API_KEY || "default_API_KEY";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uuid = params.get("uuid"); // ดึง uuid จาก query parameters
    if (uuid) {
      setUuid(uuid);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!uuid) return;

      try {
        const response = await axios.get(
          `${ApiKey}/pp-check-link?uuid=${uuid}`
        );
        
        // ฝัง auth_token ในคุกกี้
        if (response) {
            console.log(response.data);
            
          document.cookie = `auth_token=${response.data}; path=/;`;
          // Redirect ไปที่ /pp-edit-profile
          window.location.href = "/pp-edit-profile";
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [uuid]);

  return (
    <body>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="d-flex text-center align-items-center">
          <div
            className="spinner-border avatar-sm text-primary m-2 mr-4"
            role="status"
          ></div>
          <h1>กรุณา รอสักครู่....</h1>
        </div>
      </div>
    </body>
  );
};

export default Waiting;
