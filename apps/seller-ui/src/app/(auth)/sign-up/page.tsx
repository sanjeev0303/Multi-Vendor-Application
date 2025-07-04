'use client';

import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { countries } from 'apps/seller-ui/src/utils/countries';
import Link from 'next/link';
import CreateShop from 'apps/seller-ui/src/app/(auth)/_components/create-shop';
import ConnectStripe from '../_components/connect-stripe';

const SignupPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | boolean>(false);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setshowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [sellerData, setSellerData] = useState<SignupFormData | null>(null);
  const [sellerId, setSellerId] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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

  interface SignupFormData {
    name: string;
    email: string;
    phone_number: string;
    country: string;
    password: string;
  }

  interface SignupResponse {
    success: boolean;
    message: string;
    data?: any;
  }

  interface ErrorResponse {
    message: string;
  }

  const signupMutation = useMutation<SignupResponse, AxiosError<ErrorResponse>, SignupFormData>({
    mutationFn: async (data: SignupFormData) => {
      try {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/seller-registration`;
        console.log('Sending request to:', url);

        const response = await axios.post<SignupResponse>(url, data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('API Error:', error.response?.data);
          throw error;
        }
        throw error;
      }
    },
    onSuccess: (data, formData) => {
      console.log('Signup success:', data);
      setSellerData(formData);
      setshowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
    onError: (error) => {
      console.error('Signup error:', error);
      setServerError(error.message || 'An error occurred during signup');
    },
  });

  const verifyOtpMutation = useMutation<any, Error, string>({
    mutationFn: async (otpValue: string) => {
      if (!sellerData) throw new Error('User data not found');

      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-seller`;
      const response = await axios.post(url, {
        ...sellerData,
        otp: otpValue,
      });
      return response.data;
    },
    onSuccess: (data) => {
        setSellerId(data?.seller?.id)
      setActiveStep(2)
    },
    onError: (error) => {
      console.error('OTP verification error:', error);
      setServerError(error.message || 'Invalid OTP');
    },
  });

  const onSubmit = (data: any) => {
    console.log('Submitting data:', data);
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
    if (sellerData) {
      setServerError(false);
      signupMutation.mutate(sellerData);
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

  const steps = [
    { number: 1, label: 'Create Account' },
    { number: 2, label: 'Setup Shop' },
    { number: 3, label: 'Connect Bank' },
  ];

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-dvh">
      {/* Stepper */}
      <div className="relative w-full max-w-3xl px-4 mb-12">
        {/* Progress Bar */}
        <div className="absolute top-4 left-0 right-0 mx-8 h-1 bg-gray-200 -z-10" />

        {/* Steps */}
        <div className="flex items-start justify-between w-full">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-white font-bold mb-2 ${
                  step.number <= activeStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                {step.number}
              </div>

              {/* Label */}
              <span className="text-xs md:text-sm text-center">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps content */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-center mb-4">
                  Create Account
                </h3>

                {/* Name Input */}
                <div>
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
                </div>

                {/* Email Input */}
                <div>
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
                        value:
                          /[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {String(errors.email.message)}
                    </p>
                  )}
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="block text-start pl-1 text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="81021*****"
                    className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                    {...register('phone_number', {
                      required: 'Phone Number is required',
                      pattern: {
                        value: /^\+?[0-9]\d{1,10}$/,
                        message: 'Invalid phone number',
                      },
                      minLength: {
                        value: 10,
                        message: 'Phone number cannot exceed 15 digits.',
                      },
                    })}
                  />
                  {errors.phone_number && (
                    <p className="text-red-500 text-sm">
                      {String(errors.phone_number.message)}
                    </p>
                  )}
                </div>

                {/* Country Input */}
                <div>
                  <label className="block text-start pl-1 text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                    {...register('country', {
                      required: 'Country is required',
                    })}
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-sm">
                      {String(errors.country.message)}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
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
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 text-lg cursor-pointer bg-black text-white py-2 rounded-lg"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? 'Signing up...' : 'Sign up'}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm mt-2">
                    {serverError.toString()}
                  </p>
                )}

                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {signupMutation.error.response?.data?.message ||
                        signupMutation.error.message}
                    </p>
                  )}

                  <p className='pt-3 text-center'>
                    Already have an account?{" "}
                    <Link href={"/login"} className='text-blue-500 hover:underline'>Login</Link>
                  </p>
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
                  <p className="text-red-500 text-sm mt-2">
                    {serverError.toString()}
                  </p>
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
          </>
        )}

        {activeStep === 2 && (
            <>
            <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
            </>
        )}

        {activeStep === 3 && (
            <ConnectStripe sellerId={sellerId} />
        )}
      </div>
    </div>
  );
};

export default SignupPage;
