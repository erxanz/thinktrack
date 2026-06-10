import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Pilihan gaya tampilan tombol */
  variant?: "default" | "outline" | "ghost" | "destructive";
  /** Pilihan ukuran tombol */
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "default", size = "default", ...props },
    ref,
  ) => {
    // Kumpulan class dasar yang selalu ada di setiap tombol
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50";

    // Class khusus berdasarkan varian warna/gaya
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
      outline:
        "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-900",
      ghost:
        "hover:bg-gray-100 hover:text-gray-900 text-gray-700 bg-transparent",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    };

    // Class khusus berdasarkan ukuran
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-md px-8 text-base",
      icon: "h-10 w-10",
    };

    // Menggabungkan semua class menjadi satu string
    const combinedClassName =
      `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim();

    return <button ref={ref} className={combinedClassName} {...props} />;
  },
);

Button.displayName = "Button";

export { Button };
