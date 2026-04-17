import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { sender } from "../lib/resend.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedBy: { $ne: myId }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("replyTo", "text image senderId");

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    let imageUrl;
    if (image) {
      //upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo,
    });

    await newMessage.save();
    if (replyTo) {
      await newMessage.populate("replyTo", "text image senderId");
    }

    //todo: send message in real time if user is online -socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller :", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // find all the messages where the logged-in user is either sender or receiverId, sorted by latest
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      deletedBy: { $ne: loggedInUserId }
    }).sort({ createdAt: -1 });

    const chatPartnerIds = [];
    const latestMessageMap = {};

    messages.forEach((msg) => {
      const partnerId =
        msg.senderId.toString() === loggedInUserId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();
          
      if (!chatPartnerIds.includes(partnerId)) {
        chatPartnerIds.push(partnerId);
        latestMessageMap[partnerId] = msg;
      }
    });

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");
    
    // Sort chatPartners based on the order of chatPartnerIds (latest first) and inject last message
    const sortedChatPartners = chatPartnerIds.map(id => {
      const user = chatPartners.find(p => p._id.toString() === id);
      if (user) {
        return {
          ...user.toObject(),
          lastMessage: latestMessageMap[id]
        };
      }
      return null;
    }).filter(Boolean);

    res.status(200).json(sortedChatPartners);
  } catch (error) {
    console.log("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: senderId } = req.params;

    const modified = await Message.updateMany(
      { senderId, receiverId: myId, read: false },
      { $set: { read: true } }
    );

    if (modified.modifiedCount > 0) {
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { readerId: myId });
      }
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: messageId } = req.params;
    const { forEveryone } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Validate if user is authorized to delete
    if (forEveryone) {
      if (message.senderId.toString() !== myId.toString()) {
        return res.status(403).json({ message: "You can only delete your own messages for everyone" });
      }
      message.isDeletedForEveryone = true;
      message.text = "This message was deleted";
      message.image = null; // Remove image
    } else {
      if (!message.deletedBy.includes(myId)) {
        message.deletedBy.push(myId);
      }
    }

    await message.save();
    
    // Notify the other user via socket if forEveryone is true
    if (forEveryone) {
      const receiverId = message.senderId.toString() === myId.toString() ? message.receiverId : message.senderId;
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", { messageId: message._id, forEveryone });
      }
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
