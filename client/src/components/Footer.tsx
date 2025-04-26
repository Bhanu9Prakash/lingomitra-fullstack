export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>© {currentYear} LingoMitra. Master languages naturally through pattern recognition.</p>
        </div>
      </div>
    </footer>
  );
}
