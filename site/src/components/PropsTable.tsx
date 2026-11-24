import type { ApiTable } from "@site/content/types";
import { md } from "@site/lib/inline";
import styles from "./ui.module.scss";

const PLATFORM_TAG = { ios: "iOS only", "android-web": "Android + Web only" } as const;

/** One API table (props of one export). On phones the rows turn into stacked cards. */
export function PropsTable({ table }: { table: ApiTable }) {
  const id = `api-${table.component.replace(/[^A-Za-z0-9]+/g, "-")}`;
  return (
    <section className={styles.api} aria-labelledby={id}>
      <div className={styles.apiHead}>
        <h3 id={id} className={styles.apiTitle}>
          <code>{table.component}</code>
        </h3>
        {table.description && <p className={styles.apiDescription}>{md(table.description)}</p>}
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Prop</th>
              <th scope="col">Type</th>
              <th scope="col">Default</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            {table.props.map((prop) => (
              <tr key={prop.name}>
                <th scope="row" data-label="Prop">
                  <span className={styles.propName}>
                    {prop.name}
                    {prop.required && (
                      <span className={styles.required} title="Required">
                        *
                      </span>
                    )}
                  </span>
                </th>
                <td data-label="Type">
                  <code className={styles.type}>{prop.type}</code>
                </td>
                <td data-label="Default">{prop.default ? <code className={styles.type}>{prop.default}</code> : <span className={styles.none}>—</span>}</td>
                <td data-label="Description">
                  {md(prop.description)}
                  {prop.platform && <span className={styles.platformTag}>{PLATFORM_TAG[prop.platform]}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.extends && <p className={styles.apiExtends}>{table.extends}</p>}
    </section>
  );
}
