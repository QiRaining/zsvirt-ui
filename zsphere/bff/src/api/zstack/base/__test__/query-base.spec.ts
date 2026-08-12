import { Op, QueryBase } from "../query-base";

describe("query-base", () => {
  describe("Op 枚举", () => {
    it("应包含所有基本操作符", () => {
      expect(Op.eq).toBe("eq");
      expect(Op.ne).toBe("ne");
      expect(Op.gt).toBe("gt");
      expect(Op.gte).toBe("gte");
      expect(Op.lt).toBe("lt");
      expect(Op.lte).toBe("lte");
      expect(Op.like).toBe("like");
      expect(Op.notLike).toBe("notLike");
      expect(Op.in).toBe("in");
      expect(Op.notIn).toBe("notIn");
      expect(Op.is).toBe("is");
      expect(Op.not).toBe("not");
      expect(Op.has).toBe("has");
      expect(Op.notHas).toBe("notHas");
      expect(Op.and).toBe("and");
      expect(Op.or).toBe("or");
    });
  });

  describe("QueryBase.handleConditions", () => {
    let qb: QueryBase;

    beforeEach(() => {
      qb = new (QueryBase as any)();
    });

    it("空数组返回空字符串", () => {
      expect(qb.handleConditions([])).toBe("");
    });

    it("eq 条件", () => {
      const result = qb.handleConditions([
        { key: "name", op: Op.eq, value: "test" },
      ]);
      expect(result).toBe("q=name=test");
    });

    it("ne 条件", () => {
      const result = qb.handleConditions([
        { key: "state", op: Op.ne, value: "Destroyed" },
      ]);
      expect(result).toBe("q=state!=Destroyed");
    });

    it("gt / lt 条件", () => {
      const result = qb.handleConditions([
        { key: "cpuNum", op: Op.gt, value: "8" },
        { key: "memorySize", op: Op.lt, value: "1024" },
      ]);
      expect(result).toContain("q=cpuNum>8");
      expect(result).toContain("q=memorySize<1024");
    });

    it("like 条件（自动加 %25）", () => {
      const result = qb.handleConditions([
        { key: "name", op: Op.like, value: "vm" },
      ]);
      expect(result).toBe("q=name~=%25vm%25");
    });

    it("in 条件使用 values", () => {
      const result = qb.handleConditions([
        { key: "uuid", op: Op.in, values: ["a", "b", "c"] },
      ]);
      expect(result).toBe("q=uuid?=a,b,c");
    });

    it("notIn 条件", () => {
      const result = qb.handleConditions([
        { key: "type", op: Op.notIn, values: ["ApplianceVm"] },
      ]);
      expect(result).toBe("q=type!?=ApplianceVm");
    });

    it("is null 条件", () => {
      const result = qb.handleConditions([
        { key: "hostUuid", op: Op.is },
      ]);
      expect(result).toBe("q=hostUuid is null");
    });

    it("not null 条件", () => {
      const result = qb.handleConditions([
        { key: "hostUuid", op: Op.not },
      ]);
      expect(result).toBe("q=hostUuid not null");
    });

    it("多条件用 & 连接", () => {
      const result = qb.handleConditions([
        { key: "name", op: Op.eq, value: "vm1" },
        { key: "state", op: Op.eq, value: "Running" },
      ]);
      expect(result).toBe("q=name=vm1&q=state=Running");
    });

    it("自定义 connector", () => {
      const result = qb.handleConditions(
        [{ key: "name", op: Op.eq, value: "test" }],
        "filter",
      );
      expect(result).toBe("filter=name=test");
    });

    it("特殊字符应被 encodeURIComponent", () => {
      const result = qb.handleConditions([
        { key: "name", op: Op.eq, value: "hello world" },
      ]);
      expect(result).toBe("q=name=hello%20world");
    });

    it("无效 key 应跳过", () => {
      const result = qb.handleConditions([
        { key: "", op: Op.eq, value: "test" },
      ]);
      expect(result).toBe("");
    });

    it("默认 op 为 eq", () => {
      const result = qb.handleConditions([
        { key: "uuid", value: "abc" },
      ]);
      expect(result).toBe("q=uuid=abc");
    });
  });
});
