import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    console.log("userId","userId")
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "error in get current user" });
  }
};
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, assistantImage: bodyImage } = req.body;
    let assistantImage;
    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = bodyImage; // imageUrl from body
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName,
        assistantImage,
      },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.error("Update assistant error:", error);
    return res
      .status(400)
      .json({ message: "update assistant error from controller" });
  }
};
export const askToAssistant = async (req,res) => {
  try {
    console.log("first")
    const { command } = req.body;
    console.log("first",command)
    const user = await User.findById(req.userId);
    const userName = user.name;
    const assistantName = user.assistantName;
    const result = await geminiResponse(command, assistantName, userName);
    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch)
      return res.status(400).json({ response: "sorry, i can't understand." });
    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;
    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current date is ${moment().format("DD-MM-YYYY")}`,
        });
      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });

      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current month is ${moment().format("MMMM")}`,
        });

      case "general":
      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });
      default:
        return res.json({
          type: "unknown",
          userInput: gemResult.userInput,
          response: "Sorry, I didn't understand that command.",
        });
    }
  } catch (error) {
    console.error("asking assistant error:", error);
    return res
      .status(400)
      .json({ message: "asking assistant error from controller" });
  }
};
