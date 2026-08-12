import { QueryBase, Op, QueryParam } from "../query-base";

describe("query-base", () => {
  beforeEach(async () => {});
  describe("handle conditions", () => {
    const base = new QueryBase();
    const query: QueryParam = {
      conditions: [
        {
          value: "",
        },
        {
          op: Op.like,
        },
        {
          key: "name",
        },
        {
          key: "age",
          value: "18",
        },
        {
          key: "type",
          op: Op.eq,
          value: "small",
        },
        {
          key: "no",
          op: Op.gt,
          value: "0",
        },
        {
          key: "no",
          op: Op.gte,
          value: "12",
        },
        {
          key: "no",
          op: Op.lt,
          value: "100",
        },
        {
          key: "no",
          op: Op.lte,
          value: "99",
        },
        {
          key: "name",
          op: Op.like,
          value: "lili",
        },
        {
          key: "name",
          op: Op.notLike,
          value: "haha",
        },
        {
          key: "classNo",
          op: Op.in,
          values: ["1", "2", "3"],
        },
        {
          key: "classNo",
          op: Op.notIn,
          values: ["4", "5", "6"],
        },
        {
          key: "teacher",
          op: Op.not,
        },
        {
          key: "address",
          op: Op.is,
        },
      ],
    };
    it("query-base handleConditions method is ok", () => {
      const result = `q=age=18&q=type=small&q=no>0&q=no>=12&q=no<100&q=no<=99&q=name~=%25lili%25&q=name!~=%25haha%25&q=classNo?=1,2,3&q=classNo!?=4,5,6&q=teacher!=null&q=address=null`;
      expect(base.handleConditions(query.conditions)).toBe(result);
    });
  });
});
