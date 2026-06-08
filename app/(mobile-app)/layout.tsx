export default function MobileAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      {/* Container ini membatasi lebar agar terlihat seperti HP meski di laptop */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative pb-20">
        {children}

        {/* Placeholder untuk Mobile Bottom Navigation */}
        <div className="absolute bottom-0 w-full h-16 bg-white border-t flex justify-around items-center text-xs font-medium text-gray-500">
          <div>Home</div>
          <div>Progress</div>
          <div>Profile</div>
        </div>
      </div>
    </div>
  );
}
