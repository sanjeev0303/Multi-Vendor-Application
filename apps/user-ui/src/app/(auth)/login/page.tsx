'use client';

import { useMutation } from '@tanstack/react-query';
import GoogleButton from 'apps/user-ui/src/shared/components/google-button';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  email: string;
  password: string;
};

const LoginPage = ({ email, password }: FormData) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | boolean>(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation<any, Error, FormData>({
    mutationFn: async (data: FormData) => {
      try {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-user`;
        const response = await axios.post(url, data, {withCredentials: true});
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("API Error:", error.response?.data);
          throw new Error(error.response?.data?.message || error.message || 'Server error occurred');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setServerError(false);
      console.log("Login success:", data);
      router.push('/'); // Redirect to home page after successful login
    },
    onError: (error: Error) => {
        // Handle the error as AxiosError if possible
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          const errorMessage = (axiosError.response?.data as {message?:

            string})?.message || "Invalid Credentials!";
          setServerError(errorMessage);
        } else {
          setServerError("Something went wrong. Please try again.");
        }
      }
  });
  const onSubmit = (data: FormData) => {
    console.log("Submitting login data:", data);
    setServerError(false);
    loginMutation.mutate(data);
  };
  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Login
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Login to Vendor's Shop
          </h3>
          <div className="text-center text-gray-500 mb-4">
            Don't have an account?
            <Link
              href={'/sign-up'}
              className="text-blue-500 ml-2 hover:underline"
            >
              Sign up
            </Link>
            <GoogleButton />
            <div className="flex items-center my-5 text-gray-400 text-sm">
              <div className="flex-1 border-t border-gray-300" />
              <span className="">or Sign in with Email</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email Input */}
              <label className="block text-start pl-1 text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">
                  {String(errors.email.message)}
                </p>
              )}

              {/* Password Input */}
              <label className="block text-start pl-1 text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                >
                  {passwordVisible ? <Eye /> : <EyeOff />}
                </button>

                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center my-4">
                <label className="block text-start pl-1 text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={rememberMe}
                    onChange={() => {
                      setRememberMe(!rememberMe);
                    }}
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  href={'/forgot-password'}
                  className="text-blue-500 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-lg"
              >
                Login
              </button>

              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
