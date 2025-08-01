import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserDataContext } from "./UserDataContext";

const UserContext = ({ children }) => {
  const serverUrl = "https://ai-voice-assistance-aweh.onrender.com";
  // const serverUrl = "https://localhost:8000";
  const [userData, setUserData] = useState(undefined);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoggedIn,setIsLoggedIn] = useState(false);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      console.log("first")
      console.log(result.data)
      setUserData(result.data);
    } catch (error) {
      console.error("error in handlecurrentuser ",error.response?.data?.message);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/ask`,
        { command },
        { withCredentials: true }
      );
      console.log("result",result)
      return result.data;
    } catch (error) {
      // console.log("first")
      console.error("Error in getGeminiResponse:", error);
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    isLoggedIn,setIsLoggedIn,
    setUserData,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export default UserContext;
