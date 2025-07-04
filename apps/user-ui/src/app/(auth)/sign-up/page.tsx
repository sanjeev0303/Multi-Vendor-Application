'use client';

import { useMutation } from '@tanstack/react-query';
import GoogleButton from 'apps/user-ui/src/shared/components/google-button';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from "axios";

type FormData = {
  name: string;
  email: string;
  password: string;
};

const SignupPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | boolean>(false);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setshowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
        setTimer((prev) => {
            if (prev <= 1) {
               clearInterval(interval)
               setCanResend(true)
               return 0;
            }
            return prev -1
        })
    }, 1000)
  }

  const signupMutation = useMutation<any, Error, FormData>({
    mutationFn: async (data: FormData) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`;
            console.log("Sending request to:", url);

            const response = await axios.post(url, data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("API Error:", error.response?.data);
                throw new Error(error.response?.data?.message || error.message || 'Server error occurred');
            }
            throw error;
        }
    },
    onSuccess: (data, formData) => {
        console.log("Signup success:", data);
        setUserData(formData);
        setshowOtp(true);
        setCanResend(false);
        setTimer(60);
        startResendTimer();
    },
    onError: (error) => {
        console.error("Signup error:", error);
        setServerError(error.message || 'An error occurred during signup');
    }
  });

  const verifyOtpMutation = useMutation<any, Error, string>({
    mutationFn: async (otpValue: string) => {
        if (!userData) throw new Error("User data not found");

        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user`;
        const response = await axios.post(url, {
            ...userData,
            otp: otpValue
        });
        return response.data;
    },
    onSuccess: (data) => {
        console.log("OTP verification success:", data);

         router.push('/login');
        alert("Registration successful! Please login.");
    },
    onError: (error) => {
        console.error("OTP verification error:", error);
        setServerError(error.message || 'Invalid OTP');
    }
  });

  const onSubmit = (data: FormData) => {
    console.log("Submitting data:", data);
    setServerError(false);
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOpt = [...otp];
    newOpt[index] = value;
    setOtp(newOpt);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      setServerError(false);
      signupMutation.mutate(userData);
    }
  };

  const verifyOtp = () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setServerError('Please enter a valid 4-digit OTP');
      return;
    }

    setServerError(false);
    verifyOtpMutation.mutate(otpValue);
  };

  return (
    <div className="w-full min-h-dvh py-10 bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Sign Up
      </h1>
      <div className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Sign Up
      </div>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Create new account to Vendor's Shop
          </h3>
          <div className="text-center text-gray-500 mb-4">
            Already have an account?
            <Link
              href={'/login'}
              className="text-blue-500 ml-2 hover:underline"
            >
              Login
            </Link>
          </div>
          <GoogleButton />
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="">or Sign up with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name Input */}
              <label className="block text-start pl-1 text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                placeholder="Sanju Sharma"
                className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                {...register('name', {
                  required: 'Name is required',
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {String(errors.name.message)}
                </p>
              )}
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

              <button
                type="submit"
                className="w-full mt-4 text-lg cursor-pointer bg-black text-white py-2 rounded-lg"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? 'Signing up...' : 'Sign up'}
              </button>

              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError.toString()}</p>
              )}
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>

              <div className="flex justify-center gap-6 ">
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>

              <button
                onClick={verifyOtp}
                disabled={verifyOtpMutation.isPending}
                className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </button>

              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError.toString()}</p>
              )}

              <div className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className="text-blue-500 cursor-pointer"
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? 'Sending...' : 'Resend OTP'}
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
