"use client";
import SidebarLayout from "@/components/SidebarLayout";
import { formatDateTime } from "@/lib/utils";
import {
  createManagerChat,
  getAdminHospitalManagerCommentList,
  getlManagerComments,
  markReadForAdminManagerComments,
} from "@/services/comments";
import { CommentType, UserRole } from "@/types/comments";
import React, { useEffect, useState } from "react";

type Message = {
  id: number;
  sender: string;
  text: string;
  time: string;
  type: "self" | "other";
};

export default function ManagerChat() {
  const [commentInput, setCommentInput] = useState("");
  const [adminManagerComments, setAdminManagerComments] = useState([]);
  const [managerComments, setManagerComments] = useState([]);
  const [hispotalId, setHospitalId] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [loggedInUserName, setLoggedInUserName] = useState<string | null>(null);
  const [loggedInUserRole, setLoggedInUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoggedInUserId(localStorage.getItem("userId"));
      setLoggedInUserName(localStorage.getItem("userName"));
      setLoggedInUserRole(localStorage.getItem("userRole"));
    }
  }, []);

  const fetchAdminManagerComments = async () => {
    try {
      const res = await getAdminHospitalManagerCommentList();
      if (res.status == 200) {
        setAdminManagerComments(res?.data);
        // setHospitalId(res?.data[0]?.hospitalId);
      }
    } catch (error) {
      console.error("Filed to fetch:", error);
    }
  };
  useEffect(() => {
    fetchAdminManagerComments();
  }, []);
  const fetchManagerComments = async (hispotalId?: string) => {
    try {
      const res = await getlManagerComments(hispotalId);
      if (res.status == 200) {
        const modifyData = res?.data
          ?.filter((type) => type?.type == CommentType.HOSPITAL_NOTE)
          ?.map((item) => {
            return {
              ...item,
              message: item.text,
              sender: item?.creator.name,
              date: formatDateTime(item?.createdAt).date,
              time: formatDateTime(item?.createdAt).time,
              position: item?.createdBy == loggedInUserId ? "self" : "other",
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
        setManagerComments(modifyData);
      }
    } catch (error) {
      console.error("Filed to fetch:", error);
    }
  };
  useEffect(() => {
    fetchManagerComments(hispotalId);
  }, [hispotalId]);
  const handleCommentRead = async (hospitalId, id) => {
    try {
      if (hospitalId && id) {
        setHospitalId(hospitalId);
        const res = await markReadForAdminManagerComments(hospitalId);
        if (res.status == 200) {
          fetchAdminManagerComments();
        }
      }
    } catch (error) {
      console.error("Failed", error);
    }
  };

  const handleCreateManagerChat = async () => {
    const payload = {
      text: commentInput,
      ...((loggedInUserRole == UserRole.ADMIN ||
        loggedInUserRole == UserRole.SUPER_ADMIN ||
        loggedInUserRole == UserRole.HOSPITAL_MANAGER) && {
        hospitalId: hispotalId,
      }),
      type: CommentType.HOSPITAL_NOTE,
    };

    try {
      const createCommentsResponse = await createManagerChat(payload);
      if (createCommentsResponse.status === 201) {
        setCommentInput("");
        fetchManagerComments(hispotalId);
      }
    } catch (error) {
      console.error("comment Errpr", error);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="p-4 bg-white">
        <h1 className="bg-white font-semibold">Manager Chat</h1>
        <div className="flex h-[calc(100vh-110px)] bg-white overflow-y-auto">
          {/* Sidebar */}

          <div className="w-1/4 border-r border-gray-200 py-4 pr-4">
            <input
              type="text"
              placeholder="Search here..."
              className="w-full p-2 mb-4 border rounded-full text-sm"
            />
            <div className="space-y-3">
              {adminManagerComments?.length
                ? adminManagerComments?.map((hospital, idx) => (
                    <div
                      key={idx}
                      className={`${
                        hospital?.hospitalId == hispotalId
                          ? "bg-[#3E79D6] text-white"
                          : "text-black"
                      } group flex items-center justify-start cursor-pointer hover:bg-[#3E79D6] hover:text-white`}
                      onClick={() =>
                        handleCommentRead(hospital?.hospitalId, hospital?.id)
                      }
                    >
                      <div className="pl-1">
                        <div className="w-10 h-10  mx-auto rounded-full bg-gray-200 text-center flex justify-center items-center overflow-hidden">
                          <span className="text-[28px]  font-semibold text-[#3E79D6]">
                            {hospital?.hospitalName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full flex items-center justify-between p-2 ">
                        <div>
                          <p className="font-semibold text-sm">
                            {hospital?.hospitalName}
                          </p>
                          <p className="text-xs ">{hospital?.text}</p>
                        </div>
                        <div className="text-xs text-end">
                          <span>
                            {formatDateTime(hospital?.createdAt)?.time}
                          </span>
                          {hospital?.unreadCount > 0 && (
                            <h1
                              className={`font-bold my-1 w-5 h-5 rounded-full ${
                                hospital?.unreadCount > 0
                                  ? "bg-[#3E79D6] text-white"
                                  : "bg-white text-[#3E79D6]"
                              }  text-center flex justify-center items-center  group-hover:bg-white group-hover:text-[#3E79D6]`}
                            >
                              {hospital?.unreadCount}
                            </h1>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                : ""}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col flex-1">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {managerComments?.length && hispotalId ? (
                managerComments?.map((msg) => (
                  <div key={msg.id}>
                    {msg.type == CommentType.HOSPITAL_NOTE && (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.position === "self"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div className="flex justify-start items-start gap-x-2">
                          {msg.position === "other" && (
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
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-full">{`Welcome ${loggedInUserName} to Manager Chat Screen`}</div>
              )}
            </div>

            {/* Input Box */}
            <div className={` p-4  flex items-center space-x-3`}>
              <input
                type="text"
                placeholder="Add a comment"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateManagerChat();
                  }
                }}
                // disabled={disable}
                className={`${
                  Boolean(false) ? " cursor-not-allowed" : ""
                } flex-1 bg-[#F3F3F3] border rounded-xl px-4 py-3 text-sm focus:outline-none `}
              />
              <button
                // disabled={disable}
                onClick={handleCreateManagerChat}
                className="bg-[#3E79D6] hover:bg-[#3E79D6] text-white rounded-full px-5 py-3 text-sm cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
