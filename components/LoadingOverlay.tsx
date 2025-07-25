import { trailLoading } from "@/assets";
import Image from "next/image";

const LoadingOverlay = () => {
  return (
    <div className="w-full h-full  left-0 fixed top-0 z-[9999] bg-black opacity-[0.7] backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <Image src={trailLoading} alt="Loading..." className="w-20 h-20" />
    </div>
  );
};

export default LoadingOverlay;
