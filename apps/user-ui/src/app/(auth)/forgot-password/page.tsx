'use client';

import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from "react-hot-toast";

type FormData = {
    email: string;
    password: string;
    confirmPassword?: string; // Add this field
  };

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | boolean | null>(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
        setTimer((prev) => {
            if (prev <= 1) {
               clearInterval(interval);
               setCanResend(true);
               return 0;
            }
            return prev - 1;
        });
    }, 1000);
  };

  const requestOtpMutation = useMutation<any, Error, FormData>({
    mutationFn: async (data: FormData) => {
      try {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-password-user`;
        const response = await axios.post(url, { email: data.email }, { withCredentials: true });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('API Error:', error.response?.data);
          throw new Error(
            error.response?.data?.message ||
              error.message ||
              'Server error occurred'
          );
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setUserEmail(data.email);
      setStep("otp");
      setServerError(false);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: Error) => {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorMessage =
          (axiosError.response?.data as { message?: string })?.message ||
          'Invalid email address or account not found';
        setServerError(errorMessage);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async() => {
        if (!userEmail) throw new Error("User email not found");

        const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-forgot-password-user`, {
          email: userEmail,
          otp: otp.join("")
        });

        return response.data;
    },
    onSuccess: () => {
        setStep("reset");
        setServerError(null);
    },
    onError: (error: Error) => {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          const errorMessage =
            (axiosError.response?.data as { message?: string })?.message ||
            'Invalid OTP. Please try again.';
          setServerError(errorMessage);
        } else {
          setServerError('Something went wrong. Please try again.');
        }
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async({ password }: { password: string }) => {
        if (!password || !userEmail) throw new Error("Missing required information");

        const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`, {
          email: userEmail,
          newPassword: password
        });

        return response.data;
    },
    onSuccess: () => {
        toast.success("Password reset successfully! Please login with your new password.");
        setServerError(null);
        router.push("/login");
    },
    onError: (error: Error) => {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          const errorMessage =
            (axiosError.response?.data as { message?: string })?.message ||
            'Failed to reset password. Try again!';
          setServerError(errorMessage);
        } else {
          setServerError('Something went wrong. Please try again.');
        }
    },
  });

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

  const onSubmitEmail = (data: FormData) => {
    requestOtpMutation.mutate(data);
  };

  const onSubmitPassword = (data: FormData) => {
    resetPasswordMutation.mutate({ password: data.password });
  };

  const resendOtp = () => {
    if (userEmail) {
      setServerError(false);
      requestOtpMutation.mutate({ email: userEmail } as FormData);
    }
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <div className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot Password
      </div>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-2xl font-semibold text-center mb-4">
            {step === 'email' && 'Enter Your Email'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'reset' && 'Reset Your Password'}
          </h3>

          <div className="text-center text-gray-500 mb-4">
            Remember your password?
            <Link
              href={'/login'}
              className="text-blue-500 ml-2 hover:underline"
            >
              Login
            </Link>
          </div>

          {step === "email" && (
            <form onSubmit={handleSubmit(onSubmitEmail)}>
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

              <button
                type="submit"
                disabled={requestOtpMutation.isPending}
                className="w-full text-lg mt-4 cursor-pointer bg-black text-white py-2 rounded-lg"
              >
                {requestOtpMutation.isPending ? "Sending OTP..." : "Request OTP"}
              </button>

              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError.toString()}</p>
              )}
            </form>
          )}

          {step === "otp" && (
            <div>
              <p className="text-center text-gray-600 mb-4">
                We've sent a verification code to <span className="font-semibold">{userEmail}</span>
              </p>

              <div className="flex justify-center gap-6 mb-4">
                {otp.map((digit, index) => (
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
                onClick={() => verifyOtpMutation.mutate()}
                disabled={verifyOtpMutation.isPending || otp.join("").length !== 4}
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
                    disabled={requestOtpMutation.isPending}
                  >
                    {requestOtpMutation.isPending ? 'Sending...' : 'Resend OTP'}
                  </button>
                ) : (
                  <span className="text-gray-500">Resend OTP in {timer}s</span>
                )}
              </div>
            </div>
          )}

          {step === "reset" && (
            <form onSubmit={handleSubmit(onSubmitPassword)}>
              <label className="block text-start pl-1 text-gray-700 mb-1">
                New Password
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
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {String(errors.password.message)}
                </p>
              )}

              <label className="block text-start pl-1 text-gray-700 mb-1 mt-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watch('password') || "Passwords don't match"
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {String(errors.confirmPassword.message)}
                </p>
              )}

              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full text-lg mt-4 cursor-pointer bg-black text-white py-2 rounded-lg"
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </button>

              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError.toString()}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
