import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import CommentDialog from "./ui/CommentDialog.jsx";
import { useSelector, useDispatch } from "react-redux";
import { removePost, setPosts, setSelectedPost } from "./redux/postSlice.js";
import { Badge } from "./ui/badge";

const Post = ({ post }) => {
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [postLike, setPostLike] = useState(post?.likes?.length || 0);
  const [comment, setComment] = useState(post?.comments || []);
  const [saved, setSaved] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Like / Dislike Event Handler
  const likeOrDislikeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `http://localhost:8001/api/v1/post/${post?._id}/${action}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);
        toast.success(res.data.message);

        const updatedPostData = posts.map((p) =>
          p._id === post?._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user?._id)
                  : [...p.likes, user?._id],
              }
            : p,
        );

        dispatch(setPosts(updatedPostData));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Double Tap Actions
  const handleDoubleTap = () => {
    if (!liked) likeOrDislikeHandler();
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  // Delete Post Handler
  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:8001/api/v1/post/delete/${post?._id}`,
        { withCredentials: true },
      );
      if (res.data.success || res.status === 200) {
        toast.success("Post deleted successfully");
        dispatch(removePost(post?._id));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  // Submit Comment Handler
  const commentPostHandler = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:8001/api/v1/post/${post?._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        const newComment = res.data.comment || res.data.message;

        const updatedCommentData = [...comment, newComment];
        setComment(updatedCommentData);
        setText("");

        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p,
        );

        dispatch(setPosts(updatedPostData));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-8 w-full max-w-md mx-auto shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={post?.author?.profilePicture} />
            <AvatarFallback>
              {post?.author?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm">
              {post?.author?.username || "Unknown User"}
            </h1>
            {user?._id === post.author._id && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0 h-5 rounded-full"
              >
                {" "}
                Author
              </Badge>
            )}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <DialogTitle className="sr-only">Post Options Settings</DialogTitle>
            <DialogDescription className="sr-only">
              Quick settings matrix to unfollow or interact with this creator
              profile.
            </DialogDescription>
            <Button variant="ghost" className="text-red-500">
              Unfollow
            </Button>
            <Button variant="ghost">Add to favorites</Button>
            {user && user?._id === post?.author?._id && (
              <Button
                variant="ghost"
                onClick={deletePostHandler}
                className="text-red-600"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Display */}
      <div
        onClick={handleDoubleTap}
        className="relative aspect-square overflow-hidden cursor-pointer"
      >
        <img
          src={
            post?.image ||
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=500"
          }
          alt="post"
          className="w-full h-full object-cover"
        />
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center animate-ping">
            <Heart className="fill-white text-white h-24 w-24" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Heart
              onClick={likeOrDislikeHandler}
              className={`cursor-pointer transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            <MessageCircle
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpen(true);
              }}
              className="cursor-pointer"
            />
            <Send className="cursor-pointer" />
          </div>
          <Bookmark
            onClick={() => setSaved(!saved)}
            className={`cursor-pointer transition-colors ${saved ? "fill-black text-black" : ""}`}
          />
        </div>

        <p className="font-semibold mt-2">{postLike} likes</p>
        <p className="mt-1">
          <span className="font-semibold mr-2">{post?.author?.username}</span>
          {post?.caption}
        </p>

        {comment?.length > 0 && (
          <p
            onClick={() => setOpen(true)}
            className="text-gray-500 text-sm mt-1 cursor-pointer"
          >
            View all {comment.length} comments
          </p>
        )}

        {/* Comment Input */}
        <form
          onSubmit={commentPostHandler}
          className="flex items-center justify-between border-t border-gray-100 mt-3 pt-3"
        >
          <input
            type="text"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full outline-none text-sm bg-transparent placeholder-gray-400 mr-2 pr-4"
          />
          {text.trim() && (
            <button
              type="submit"
              className="text-blue-500 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer"
            >
              Post
            </button>
          )}
        </form>
      </div>

      <CommentDialog open={open} setOpen={setOpen} postData={post} />
    </div>
  );
};

export default Post;
