import React from "react";

const Avtar = ({ name, imageUrl }: { name: string; imageUrl?: string }) => {
  return (
    <div className="w-10 h-10 mx-auto rounded-full bg-gray-300 mb-4 text-center flex justify-center items-center overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="profile"
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="text-[50px] font-semibold text-[#3E79D6] ">
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
};

export default Avtar;
