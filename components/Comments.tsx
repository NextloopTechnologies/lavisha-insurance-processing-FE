"use client";
import { chatMessages } from "@/constants/dummy";
import { createComments, getComments } from "@/services/comments";
import { TComments } from "@/types/comments";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Avtar from "./Avtar";
import { formatDateTime } from "@/lib/utils";

type CommentsProps = {
  claimId: string;
};
export default function Comments({ claimId }: CommentsProps) {
  const [comments, setComments] = useState<TComments[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  const loggedInUserRole = localStorage.getItem("userRole");
  const loggedInUserId = localStorage.getItem("userId");

  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsResponse = await getComments({
        role: loggedInUserRole,
        insuranceRequestId: claimId,
      });
      if (commentsResponse.status === 200) {
        const modifyData = commentsResponse?.data
          ?.map((item) => {
            return {
              ...item,
              message: item.text,
              sender: item?.creator.name,
              date: formatDateTime(item?.createdAt).date,
              time: formatDateTime(item?.createdAt).time,
              position: item?.createdBy == loggedInUserId ? "right" : "left",
              creator: {
                id: "6bbe3afb-e85d-404a-b088-b904a86a4451",
                name: "Hospital",
              },
            };
          })
          .sort((a, b) => {
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        setComments(modifyData);
      }
    } catch (error) {
      console.error("comment Errpr", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchComments();
  }, [claimId]);

  const handleCreateComment = async () => {
    const payload = {
      text: commentInput,
      insuranceRequestId: claimId,
      type: "NOTE",
    };

    try {
      const createCommentsResponse = await createComments(payload);
      if (createCommentsResponse.status === 201) {
        setCommentInput("");
        fetchComments();
      }
    } catch (error) {
      console.error("comment Errpr", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-235px)] max-w-full mx-auto border rounded-lg shadow bg-white overflow-y">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <h1 className="text-center text-sm text-[#6D6D6D] bg-[#3E79D61A] rounded-sm p-1">
          Messages and calls are end-to-end encrypted. Only people in this chat
          can read, listen to, or share them. Learn more.{" "}
        </h1>
        {comments.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.position === "right" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex justify-start items-start gap-x-2">
              {msg.position === "left" && (
                <div className="w-7 h-7  mx-auto rounded-full bg-gray-300 text-center flex justify-center items-center overflow-hidden">
                  <span className="text-[22px]  font-semibold text-[#3E79D6] ">
                    {msg.sender.charAt(0)}
                  </span>
                </div>
              )}
              <div className="min-w-[25%] bg-[#3E79D61A] p-2 rounded-lg shadow-sm">
                <div className="w-full text-sm text-gray-500 font-semibold mb-1 flex justify-between gap-x-8">
                  <span>{msg.sender} </span>{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    {msg.date}
                  </span>
                </div>
                <div className="  text-sm text-[#6D6D6D] my-3">
                  <p>{msg.message}</p>
                </div>
                <div className="text-xs text-gray-400 mt-1 flex justify-between">
                  <span>{msg.time}</span>
                </div>
              </div>
            </div>
            {/* {msg.position === "right" && (
              <div className="w-6 h-6  mx-auto rounded-full bg-gray-300 text-center flex justify-center items-center overflow-hidden">
                <span className="text-[22px]  font-semibold text-[#3E79D6] ">
                  {msg.sender.charAt(0)}
                </span>
              </div>
            )} */}

            {/* {msg.position === "left" && (
              <div className="w-6 h-6  mx-auto rounded-full bg-gray-300 text-center flex justify-center items-center overflow-hidden">
                <span className="text-[22px]  font-semibold text-[#3E79D6] ">
                  {msg.sender.charAt(0)}
                </span>
              </div>
            )} */}
          </div>
        ))}
      </div>

      <div className="p-4  flex items-center space-x-3">
        {/* <img
          src="https://i.pravatar.cc/150?img=60"
          alt="your avatar"
          className="w-10 h-10 rounded-full"
        /> */}
        <input
          type="text"
          placeholder="Add a comment"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          className="flex-1 bg-[#F3F3F3] border rounded-xl px-4 py-3 text-sm focus:outline-none "
        />
        <button
          onClick={handleCreateComment}
          className="bg-[#3E79D6] hover:bg-[#3E79D6] text-white rounded-full px-5 py-2 text-sm cursor-pointer"
        >
          Post
        </button>
      </div>
    </div>
  );
}
