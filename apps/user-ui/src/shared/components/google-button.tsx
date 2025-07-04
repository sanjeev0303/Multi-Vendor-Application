import React from 'react';
import { FcGoogle } from 'react-icons/fc';

const GoogleButton = () => {
  return (
    <div className="w-full flex justify-center ">
      <div className="h-[46px] cursor-pointer border border-blue-100 flex  items-center gap-2 px-3 rounded-md my-2 bg-[rgba(210, 227, 252, 0.3)]">
        <FcGoogle className="h-6 w-6" />
        <span className="text-[16px] opacity-[0.8] font-Poppins">
          Sign In with Google
        </span>
      </div>
    </div>
  );
};

export default GoogleButton;
