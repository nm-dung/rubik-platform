export default function Footer({ dict }: { dict: { rights: string } }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
        <p>© {currentYear} Rubik's Learning Platform. {dict.rights}</p>
      </div>
    </footer>
  );
}