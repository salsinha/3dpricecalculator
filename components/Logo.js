import Image from "next/image";

export default function Logo({ className = "h-16 w-auto" }) {
  return (
    <Image
      src="/logo.jpg"
      alt="3D J.A. Create & Print Studio"
      width={753}
      height={1024}
      className={className}
      priority
      unoptimized
    />
  );
}
