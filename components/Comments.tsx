import { chatMessages } from "@/constants/dummy";
import Image from "next/image";
import React, { useState } from "react";

export default function Comments() {
  const [comment, setComment] = useState("");

  return (
    <div className="flex flex-col h-[calc(100vh-235px)] max-w-full mx-auto border rounded-lg shadow bg-white overflow-y">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <h1 className="text-center text-sm text-[#6D6D6D] bg-[#3E79D61A] rounded-sm p-1">
          Messages and calls are end-to-end encrypted. Only people in this chat
          can read, listen to, or share them. Learn more.{" "}
        </h1>
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.position === "right" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.position === "left" && (
              <div className="">
                <img
                  src={msg.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full mr-3"
                />
              </div>
            )}
            <div className="max-w-[75%] bg-[#3E79D61A] p-2 rounded-lg shadow-sm">
              <div className="w-full text-sm text-gray-500 font-semibold mb-1 flex justify-between">
                <span>{msg.sender} </span>{" "}
                <span className="text-xs text-gray-400 font-normal">
                  {msg.date}
                </span>
              </div>
              <div className="  text-sm text-[#6D6D6D]">
                <p>{msg.message}</p>
              </div>
              <div className="text-xs text-gray-400 mt-1 flex justify-between">
                <span>{msg.time}</span>
              </div>
            </div>
            {msg.position === "right" && (
              <img
                src={msg.avatar}
                alt="avatar"
                className="w-10 h-10 rounded-full ml-3"
              />
            )}
          </div>
        ))}
      </div>

      <div className="p-4  flex items-center space-x-3">
        <img
          src="https://i.pravatar.cc/150?img=60"
          alt="your avatar"
          className="w-10 h-10 rounded-full"
        />
        <input
          type="text"
          placeholder="Add a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 bg-[#F3F3F3] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:bg-[#3E79D6]"
        />
        <button className="bg-[#3E79D6] hover:bg-[#3E79D6] text-white rounded-full px-5 py-2 text-sm">
          Post
        </button>
      </div>
    </div>
  );
}
