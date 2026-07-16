import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { setPosts, setSelectedPost } from "../redux/postSlice.js";

const CommentDialog = ({ open, setOpen, postData }) => {
  const { posts, selectedPost } = useSelector((store) => store.post);
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const currentPost = postData || selectedPost;

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  const sendMessageHandler = async () => {
    if (!text.trim() || !currentPost?._id) return;

    try {
      const res = await axios.post(
        `https://instagram-bkev.onrender.com/api/v1/post/${currentPost._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const newComment = res.data.comment;
        const updatedComments = [...(currentPost?.comments || []), newComment];

        const updatedPostData = posts.map((p) =>
          p._id === currentPost._id ? { ...p, comments: updatedComments } : p,
        );

        const updatedSelectedPost =
          selectedPost && selectedPost._id === currentPost._id
            ? { ...selectedPost, comments: updatedComments }
            : selectedPost;

        dispatch(setPosts(updatedPostData));
        if (updatedSelectedPost) dispatch(setSelectedPost(updatedSelectedPost));
        setText("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const authorUsername = currentPost?.author?.username || "Unknown User";
  const postImage =
    currentPost?.image ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=500";
  const commentsList = currentPost?.comments || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="w-300 max-w-[95vw] h-[85vh] p-0 flex flex-col md:flex-row overflow-hidden"
      >
        {/* 🔵 FIXED ACCESSIBILITY: Primary Dialog Context descriptors */}
        <DialogTitle className="sr-only">
          Detailed Post View and Comments
        </DialogTitle>
        <DialogDescription className="sr-only">
          Expanded modal breakdown containing post media elements alongside
          active text feedback.
        </DialogDescription>

        <div className="flex flex-1 w-full h-full">
          {/* Left Side Image */}
          <div className="hidden md:block w-1/2 h-full bg-black">
            <img
              className="w-full h-full object-cover"
              src={postImage}
              alt="post content"
            />
          </div>

          {/* Right Side Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-between h-full bg-white">
            {/* Header section */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex gap-3 items-center">
                <Link to={`/profile/${postData?.author?._id}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={postData?.author?.profilePicture} />
                    <AvatarFallback>
                      {authorUsername.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div>
                  <Link
                    to={`/profile/${postData?.author?._id}`}
                    className="font-semibold text-sm hover:underline"
                  >
                    {authorUsername}
                  </Link>
                </div>
              </div>

              {/* More Options Nested Sub-Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer text-gray-700 hover:text-black transition" />
                </DialogTrigger>

                <DialogContent className="max-w-70 p-1">
                  {/* 🔵 FIXED ACCESSIBILITY: Secondary Sub-Dialog options descriptors */}
                  <DialogTitle className="sr-only">
                    Comment Control Actions
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Extended interaction utilities matrix.
                  </DialogDescription>

                  <div className="flex flex-col text-center text-sm">
                    <div className="p-3 cursor-pointer text-red-500 font-bold border-b hover:bg-gray-50">
                      Unfollow
                    </div>
                    <div className="p-3 cursor-pointer border-b hover:bg-gray-50">
                      Add to favorites
                    </div>
                    <div className="p-3 cursor-pointer border-b hover:bg-gray-50">
                      About this account
                    </div>
                    <div
                      className="p-3 cursor-pointer hover:bg-gray-50 text-gray-500"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Comments List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              {postData?.caption && (
                <div className="flex gap-3 items-start pb-3 border-b border-gray-100">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={postData?.author?.profilePicture} />
                    <AvatarFallback>
                      {authorUsername.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold mr-2">{authorUsername}</span>
                    <span className="text-gray-800 wrap-break-word">
                      {postData?.caption}
                    </span>
                  </div>
                </div>
              )}

              {commentsList.length === 0 ? (
                <p className="text-gray-400 italic text-center mt-4">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                commentsList.map((comment) => {
                  const commenterName = comment?.author?.username || "user";
                  return (
                    <div
                      key={comment?._id || Math.random()}
                      className="flex gap-3 items-start"
                    >
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={comment?.author?.profilePicture} />
                        <AvatarFallback>
                          {commenterName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <span className="font-semibold mr-2 hover:underline cursor-pointer">
                          {commenterName}
                        </span>
                        <span className="text-gray-700 wrap-break-word">
                          {comment?.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Action Tray Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none border border-gray-300 p-2.5 rounded-xl text-sm bg-white focus:border-gray-400 transition"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      sendMessageHandler();
                    }
                  }}
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  variant="outline"
                  className="rounded-xl"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
