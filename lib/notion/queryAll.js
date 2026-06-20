import { notion } from "./client";

export async function queryAll(database_id, filter) {
  let results = [];
  let cursor = undefined;
  do {
    const resp = await notion.databases.query({
      database_id,
      filter,
      start_cursor: cursor,
      page_size: 100,
    });
    results = results.concat(resp.results);
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  return results;
}
