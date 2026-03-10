import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    poems: i.entity({
      title: i.string(),
      body: i.string(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    poemAuthors: {
      forward: { on: "poems", has: "one", label: "author" },
      reverse: { on: "$users", has: "many", label: "poems" },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
