import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import { sendEmail } from './sendMail';
import { NextFunction, Request, Response } from 'express';
import redis from '@packages/lib/radis';
import prisma from '@packages/lib/prisma';

const emailRegex = /[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/;

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError('Missing required fields!');
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        'Account locked due to multiple failed attempts! Try again after 30 minutes'
      )
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        'Too many OTP requests! Please wait 1 hour before requesting again.'
      )
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError('Please wait 1 minute before requesting a new OTP!')
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600);
    return next(
      new ValidationError(
        'Too many OTP requests. Please wait 1 hour before requesting again.'
      )
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600); // Tracking request for 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, 'Verify Your Email', template, { name, otp });

  await redis.set(`otp:${email}`, otp, 'EX', 300);

  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    return next(new ValidationError('Invalid or expired OTP!'));
  }

  const failedAttemptsKey = `opt_attempts:${email}`;

  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
      await redis.del(`otp:${email}`, failedAttemptsKey);
      return next(
        new ValidationError(
          'Too many failed attempts. Your account is locked for 30 minutes!'
        )
      );
    }

    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
    return next(
      new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`)
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: 'user' | 'seller'
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw next(new ValidationError('Email is required'));
    }

    // Find user/seller in DB
    const user =
      userType === 'user'
        ? await prisma.users.findUnique({ where: { email } })
        : await prisma.sellers.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError(`${userType} not found!`);
    }

    // Check otp restictions
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    // Generate OTP and send Email
    await sendOtp(
      user.name,
      email,
      userType === 'user'
        ? 'forgot-password-user-mail'
        : 'forgot-password-seller-mail'
    );

    res.status(200).json({
      message: 'OTP send to email. Please verify your account.',
    });
  } catch (error) {}
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw next(new ValidationError('Email and OTP are required!'));
    }

    await verifyOtp(email, otp, next);

    res.status(200).json({
      message: 'OTP verified. You can now reset your password.',
    });
  } catch (error) {
    return next(error);
  }
};
