import axios from 'axios';
import React from 'react';

const ConnectStripe = ({ sellerId }: { sellerId: string }) => {
  const connectStripe = async () => {
    try {
      // Make sure this URL points to where your API route is actually located
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-stripe-link`, { sellerId });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.log("Stripe Connection Error: ", error);
      // You might want to add user-friendly error handling here
      alert("Failed to connect to Stripe. Please try again later.");
    }
  };

  return (
    <div className='text-center'>
      <h3 className='text-2xl font-semibold'>Withdraw Method</h3>
      <br />
      <button
        className='w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg'
        onClick={connectStripe}
      >
        Connect Stripe
      </button>
    </div>
  );
};

export default ConnectStripe;
