'use client';

import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ImagePlaceholder from './_components/image-placeholder';
import Input from '@packages/components/input';
import ColorSelector from '@packages/components/color-selector';
import CustomSpecification from '@packages/components/custom-specification';
import CustomProperties from '@packages/components/custom-properties';

const CreateProduct = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const onSubmit = (data: any) => {
    console.log('Create product data: ', data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];

    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }

    setImages(updatedImages);
    setValue('images', updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setValue('images', updatedImages);
      return updatedImages;
    });
  };

  return (
    <div className="w-full mx-auto p-8 bg-[#121212] shadow-md rounded-lg">
      {/* Heading and breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>

      <div className="flex items-center mb-6">
        <span className="text-[#80DEEA] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[0.8] text-gray-400" />
        <span className="text-gray-300">Create Product</span>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Image upload section */}
          <div className="md:w-[35%] space-y-4">
            {/* Main image placeholder */}
            <div className="w-full">
              <ImagePlaceholder
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                small={false}
                index={0}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            </div>

            {/* Grid of smaller images */}
            <div className="grid grid-cols-2 gap-3">
              {images.slice(1).map((_, index) => (
                <ImagePlaceholder
                  setOpenImageModal={setOpenImageModal}
                  size="765 x 850"
                  key={index}
                  small={true}
                  index={index + 1}
                  onImageChange={handleImageChange}
                  onRemove={handleRemoveImage}
                />
              ))}
            </div>
          </div>

          {/* Right side - form inputs */}
          <div className="md:w-[65%]">
            <div className="space-y-4">
              {/* Product title Input */}
              <div className="w-full md:w-2/3">
                <Input
                  label="Product Title *"
                  placeholder="Enter product title"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message as string}
                  </p>
                )}
              </div>

              {/* Product discription textarea */}
              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Descripiton * (Mas 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register('description', {
                    required: 'Descriptionis required',
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              {/* Product tags input */}
              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="apple, flagship"
                  {...register('tags', {
                    required: 'Seperate related products tags with a coma,',
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              {/* Product warrenty input */}
              <div className="mt-2">
                <Input
                  label="Warranty *"
                  placeholder="1 Year / No Warrenty"
                  {...register('warranty', {
                    required: 'Warranty is required!',
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.warranty.message as string}
                  </p>
                )}
              </div>

              {/* Product slug input */}
              <div className="mt-2">
                <Input
                  label="Slug *"
                  placeholder="product_slug"
                  {...register('slug', {
                    required: 'Slug is required',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        'Invalid slug format! User only lowercase letters and numbers',
                    },
                    minLength: {
                      value: 3,
                      message: 'Slug must be at least 3 characters long.',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Slug cannot be longer than 50 characters.',
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.slug.message as string}
                  </p>
                )}
              </div>

              {/* Product Brand name input */}
              <div className="mt-2">
                <Input
                  label="Brand"
                  placeholder="Apple"
                  {...register('brand')}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.brand.message as string}
                  </p>
                )}
              </div>

              {/* Product Color selector  */}
              <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              {/* Product Custom Specification */}
              <div className="mt-2">
                <CustomSpecification control={control} errors={errors} />
              </div>

              {/* Product Custom Properties */}
              <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>

              {/* Submit button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="bg-[#80DEEA] text-black font-medium py-2 px-6 rounded-md hover:bg-[#4DD0E1] transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
