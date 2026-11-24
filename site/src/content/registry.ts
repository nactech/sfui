/**
 * Every component page, in the order the index shows them inside each group.
 * To add a page: create `components/<slug>.tsx` exporting a `ComponentDoc` and add it here.
 */
import type { ComponentDoc } from "./types";
import { GROUP_ORDER } from "./types";
import button from "./components/button";
import switchDoc from "./components/switch";
import checkbox from "./components/checkbox";
import radio from "./components/radio";
import segmented from "./components/segmented";
import textField from "./components/text-field";
import insetForm from "./components/inset-form";
import slider from "./components/slider";
import scrubber from "./components/scrubber";
import list from "./components/list";
import tabbar from "./components/tabbar";
import header from "./components/header";
import selectionBar from "./components/selection-bar";
import selectionToolbar from "./components/selection-toolbar";
import menu from "./components/menu";

export const COMPONENTS: ComponentDoc[] = [
  button,
  switchDoc,
  checkbox,
  radio,
  segmented,
  textField,
  insetForm,
  slider,
  scrubber,
  list,
  tabbar,
  header,
  selectionBar,
  selectionToolbar,
  menu,
];

export const componentBySlug = (slug: string | undefined) => COMPONENTS.find((doc) => doc.slug === slug);

/** Components grouped in GROUP_ORDER, keeping registry order inside a group. */
export const componentsByGroup = () =>
  GROUP_ORDER.map((group) => ({ group, docs: COMPONENTS.filter((doc) => doc.group === group) })).filter((g) => g.docs.length > 0);
