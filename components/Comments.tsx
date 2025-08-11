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

  const [loggedInUserRole, setLoggedInUserRole] = useState<string | null>(null);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  console.log("loggedInUserRole", loggedInUserRole);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedInUserRole(localStorage.getItem("userRole"));
      setLoggedInUserId(localStorage.getItem("userId"));
    }
  }, []);
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
              type: item?.type,
              creator: {
                ...item.creator,
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
  }, [claimId, loggedInUserRole, loggedInUserId]);

  const handleCreateComment = async () => {
    const payload = {
      text: commentInput,
      insuranceRequestId: claimId,
      type: "QUERY",
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
        {comments.map((msg) => (
          <>
            {msg.type == "QUERY" && (
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
            )}
            {msg.type == "SYSTEM" && (
              <div className="w-full">
                <h1 className="text-[12px] text-center w-full">{msg.time}</h1>
                <h1 className="text-center text-sm text-[#6D6D6D] bg-[#3E79D61A] rounded-sm p-1">
                  {msg.message}
                </h1>
              </div>
            )}
          </>
        ))}
      </div>

      <div className="p-4  flex items-center space-x-3">
        <input
          type="text"
          placeholder="Add a comment"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleCreateComment();
            }
          }}
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
