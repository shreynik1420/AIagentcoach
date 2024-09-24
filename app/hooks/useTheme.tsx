import { useEffect, useState } from "react";

const useTheme = () => {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    // Apply the saved theme to the document body
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  return { theme, toggleTheme };
};

export default useTheme;


// import { useEffect, useState } from "react";

// const useTheme = () => {
//   const [theme, setTheme] = useState<string>(() => {
//     // Check for the user's system preference for dark mode
//     if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
//       return "dark";
//     }
//     return "light";
//   });

//   useEffect(() => {
//     // Apply the default theme to the document body
//     document.documentElement.classList.remove("light", "dark");
//     document.documentElement.classList.add(theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     const newTheme = theme === "light" ? "dark" : "light";
//     setTheme(newTheme);

//     document.documentElement.classList.remove("light", "dark");
//     document.documentElement.classList.add(newTheme);
//   };

//   return { theme, toggleTheme };
// };

// export default useTheme;
