import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [loading, setloading] = useState(false);
  const navigate = useNavigate();

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const signupHandler = async (e) => {
    e.preventDefault();
    console.log(input);
    try {
      setloading(true);
      const res = await axios.post(
        "https://instagram-bkev.onrender.com/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          username: "",
          email: "",
          password: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setloading(false);
    }
  };
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div className="ny-4">
          <h1 className="text-center font-bold text-xl">LOGO</h1>
          <p className="text-sm text-center">
            Signup to see photos & videos from your friends
          </p>
        </div>
        <div>
          <Label className="py-2 font-medium">Username</Label>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent"
          />
        </div>
        <div>
          <Label className="py-2 font-medium">Email</Label>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent"
          />
        </div>
        <div>
          <Label className="py-2 font-medium">Password</Label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent"
          />
        </div>
        <Button disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </Button>
        <span className="text-center">
          Already have an account ?{" "}
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
