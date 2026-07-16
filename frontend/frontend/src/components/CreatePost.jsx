import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "./redux/postSlice";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const dispatch = useDispatch();

  const { posts } = useSelector((store) => store.post) || { posts: [] };
  const { user } = useSelector((store) => store.auth) || {};

  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const fileChangeHandler = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const dataUrl = await readFileAsDataURL(selectedFile);
        setImagePreview(dataUrl);
      } catch (error) {
        toast.error("Failed to process the image preview.");
        console.error(error);
      }
    }
  };

  const createPostHandler = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select an image first!");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8001/api/v1/post/addpost",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        toast.success(res.data.message || "Post created successfully!");

        if (res.data.post) {
          dispatch(setPosts([res.data.post, ...posts]));
        }

        setFile(null);
        setCaption("");
        setImagePreview("");
        setOpen(false);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create post.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="sm:max-w-md"
      >
        <DialogTitle className="text-center font-semibold text-lg border-b pb-3">
          Create New Post
        </DialogTitle>

        <div className="flex gap-3 items-center mt-2">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>
              {user?.username?.slice(0, 2).toUpperCase() || "CN"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs">
              {user?.username || "Guest User"}
            </h1>
            <span className="text-gray-600 text-xs">Bio or status here</span>
          </div>
        </div>

        <form
          onSubmit={createPostHandler}
          className="mt-4 flex flex-col items-center gap-4 w-full"
        >
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="w-full h-64 object-cover rounded border"
            />
          )}

          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={loading}
            className="w-full text-sm p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-20 disabled:opacity-50"
          />

          <input
            type="file"
            ref={imageRef}
            accept="image/*"
            onChange={fileChangeHandler}
            disabled={loading}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-medium py-2 rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
