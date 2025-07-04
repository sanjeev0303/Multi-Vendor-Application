import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/utils/categories';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data) => {
      console.log("shop data: ", data);

      try {
        const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`;
        console.log('Sending request to:', url);

        const response = await axios.post(url, data);
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
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: any) => text.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>

        {/* Shop Name Input */}
        <div>
          <label className="block text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            placeholder="shop name"
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

        {/* Bio Input */}
        <div>
          <label className="block text-gray-700 mb-1">
            Bio (Max. 100 words) *
          </label>
          <input
            type="text"
            placeholder="shop bio"
            className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
            {...register('bio', {
              required: 'Bio is required',
              validate: (value) =>
                countWords(value) <= 100 || "Bio can't exceed 100 words",
            })}
          />
          {errors.bio && (
            <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
          )}
        </div>

        {/* Address Input */}
        <div>
          <label className="block text-gray-700 mb-1">Address *</label>
          <input
            type="text"
            placeholder="shop location"
            className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
            {...register('address', {
              required: 'Address is required',
            })}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">
              {String(errors.address.message)}
            </p>
          )}
        </div>

        {/* Shop Opening Hours Input */}
        <div>
          <label className="block text-gray-700 mb-1">Opening Hours *</label>
          <input
            type="text"
            placeholder="e.g., Mon-Fri 9AM - 6PM"
            className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
            {...register('opening_hours', {
              required: 'Opening Hours are required',
            })}
          />
          {errors.opening_hours && (
            <p className="text-red-500 text-sm">
              {String(errors.opening_hours.message)}
            </p>
          )}
        </div>

        {/* Website Input */}
        <div>
          <label className="block text-gray-700 mb-1">Website</label>
          <input
            type="text"
            placeholder="https://example.com"
            className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
            {...register('website', {
              pattern: {
                value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
                message: 'Enter a valid URL',
              },
            })}
          />
          {errors.website && (
            <p className="text-red-500 text-sm">
              {String(errors.website.message)}
            </p>
          )}
        </div>

        {/* Shop Categories Input */}
        <div>
          <label className="block text-gray-700 mb-1">Category *</label>
          <select
            className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
            {...register('category', {
              required: 'Category is required',
            })}
          >
            <option value="">Select a category</option>
            {shopCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm">
              {String(errors.category.message)}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-4 text-lg cursor-pointer bg-black text-white py-2 rounded-lg"
          disabled={shopCreateMutation.isPending}
        >
          {shopCreateMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
