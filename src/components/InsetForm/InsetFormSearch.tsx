import SearchField, { type SearchFieldProps } from "../Field/SearchField";

export type InsetFormSearchProps = Omit<SearchFieldProps, "size">;

/**
 * Inset Form / Search — the separate glass capsule above a group (44 tall). It is `SearchField` at `size="sm"`;
 * the inset frames draw no error icon in it, only the danger rim.
 */
const InsetFormSearch = (props: InsetFormSearchProps) => <SearchField {...props} size="sm" />;

export default InsetFormSearch;
