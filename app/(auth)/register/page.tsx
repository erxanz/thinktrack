// // app/(auth)/register/page.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { toast } from "react-hot-toast";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [form, setForm] = useState({ name: "", email: "", password: "" });
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrors({});

//     try {
//       const res = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         toast.success("Akun berhasil dibuat! Silakan login.");
//         router.push("/login");
//       } else {
//         const errorMessage = data.error || "Gagal mendaftar";
//         toast.error(errorMessage);

//         // Set field-specific errors
//         if (data.error.includes("email")) {
//           setErrors({ email: errorMessage });
//         } else if (data.error.includes("password")) {
//           setErrors({ password: errorMessage });
//         } else if (data.error.includes("Name")) {
//           setErrors({ name: errorMessage });
//         }
//       }
//     } catch (error) {
//       toast.error("Terjadi kesalahan sistem");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e] px-4">
//       <div className="w-full max-w-md p-8 rounded-2xl bg-[#161616]/80 backdrop-blur-md border border-gray-800 shadow-2xl">
//         <div className="mb-8 text-center">
//           <h1 className="text-3xl font-bold text-white mb-2">Buat Akun</h1>
//           <p className="text-gray-400 text-sm">
//             Mulai tulis ide brilian Anda hari ini
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-gray-400 mb-1">
//               Nama Lengkap
//             </label>
//             <input
//               type="text"
//               required
//               className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white focus:outline-none focus:ring-1 transition-all ${
//                 errors.name
//                   ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                   : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
//               }`}
//               placeholder="John Doe"
//               value={form.name}
//               onChange={(e) => {
//                 setForm({ ...form, name: e.target.value });
//                 setErrors({ ...errors, name: "" });
//               }}
//             />
//             {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-400 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               required
//               className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white focus:outline-none focus:ring-1 transition-all ${
//                 errors.email
//                   ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                   : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
//               }`}
//               placeholder="nama@email.com"
//               value={form.email}
//               onChange={(e) => {
//                 setForm({ ...form, email: e.target.value });
//                 setErrors({ ...errors, email: "" });
//               }}
//             />
//             {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-400 mb-1">
//               Password
//             </label>
//             <input
//               type="password"
//               required
//               minLength={6}
//               className={`w-full px-4 py-3 rounded-xl bg-black/50 border text-white focus:outline-none focus:ring-1 transition-all ${
//                 errors.password
//                   ? "border-red-500 focus:border-red-500 focus:ring-red-500"
//                   : "border-gray-700 focus:border-blue-500 focus:ring-blue-500"
//               }`}
//               placeholder="••••••••"
//               value={form.password}
//               onChange={(e) => {
//                 setForm({ ...form, password: e.target.value });
//                 setErrors({ ...errors, password: "" });
//               }}
//             />
//             {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
//             {loading ? "Mendaftar..." : "Daftar Sekarang"}
//           </button>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-400">
//           Sudah punya akun?{" "}
//           <Link href="/login" className="text-white hover:underline">
//             Masuk di sini
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

import { notFound } from "next/navigation";

export default function RegisterPage() {
  notFound();
}