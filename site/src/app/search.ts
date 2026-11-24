import { createContext, useContext } from "react";

/** Opens the ⌘K search dialog from anywhere in the site. */
export const SearchContext = createContext<() => void>(() => {});
export const useOpenSearch = () => useContext(SearchContext);
