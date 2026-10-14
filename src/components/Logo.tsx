import Image from "next/image";
import Link from "next/link";
import logo from "../../public/brand/cfn-logo.png";
import logoWhite from "../../public/brand/cfn-logo-white.png";

export function Logo({ light = false, className = "h-12 w-auto" }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Central Florida Network home" className="shrink-0">
      <Image
        src={light ? logoWhite : logo}
        alt="Central Florida Network"
        className={className}
        loading="eager"
      />
    </Link>
  );
}
