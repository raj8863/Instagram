import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "./redux/authSlice";
import axios from "axios";
import { Loader } from "lucide-react";
import { toast } from "sonner";

const EditProfile = () => {
  const imageRef = useRef();
  const [loading, setLoading] = useState(false);
  const { userProfile } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    profilePhoto: userProfile?.profilePicture || null,
    bio: userProfile?.bio || "",
    gender: userProfile?.gender || "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setInput({ ...input, profilePhoto: file });
  };

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);

    // Fixed: Key changed from "profilePhoto" to "profilePicture" to match backend Multer
    if (input.profilePhoto instanceof File) {
      formData.append("profilePicture", input.profilePhoto);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://instagram-bkev.onrender.com/api/v1/user/profile/edit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      if (res.data.success) {
        // Fixed: Backend sends "user", not "userProfile"
        const updatedUserData = {
          ...userProfile,
          bio: res.data.user?.bio || userProfile?.bio,
          profilePicture:
            res.data.user?.profilePicture || userProfile?.profilePicture,
          gender: res.data.user?.gender || userProfile?.gender,
        };

        dispatch(setAuthUser(updatedUserData));
        toast.success(res.data.message || "Profile updated successfully!");
        navigate(`/profile/${userProfile?._id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <section className="w-full flex flex-col gap-8">
        <h1 className="text-2xl font-bold">Edit Profile</h1>

        {/* Profile Card */}
        <div className="flex items-center justify-between rounded-2xl bg-gray-100 p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={
                  input.profilePhoto instanceof File
                    ? URL.createObjectURL(input.profilePhoto)
                    : userProfile?.profilePicture
                }
                alt="profilephoto"
              />
              <AvatarFallback>
                {userProfile?.username
                  ? userProfile.username.substring(0, 2).toUpperCase()
                  : "CN"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <h2 className="font-semibold text-base">
                {userProfile?.username}
              </h2>
              <p className="text-sm text-gray-500">
                {userProfile?.bio || "Bio here..."}
              </p>
            </div>
          </div>

          <input
            ref={imageRef}
            onChange={fileChangeHandler}
            type="file"
            accept="image/*"
            className="hidden"
          />

          <Button
            type="button"
            onClick={() => imageRef.current?.click()}
            className="bg-[#0095F6] hover:bg-[#1877F2] h-9 px-4"
          >
            Change Photo
          </Button>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="font-semibold">Bio</label>
          <textarea
            name="bio"
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            placeholder="Write something about yourself..."
            className="w-full min-h-32 rounded-lg border border-gray-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0095F6]"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="font-semibold">Gender</label>

          <Select
            defaultValue={input.gender}
            onValueChange={selectChangeHandler}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          {loading ? (
            <Button
              disabled
              className="w-full h-10 rounded-lg bg-[#0095F6] opacity-70"
            >
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-full h-10 rounded-lg bg-[#0095F6] hover:bg-[#1877F2]"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
