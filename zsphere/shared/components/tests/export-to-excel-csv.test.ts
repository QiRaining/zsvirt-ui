import { describe, expect, it } from "vitest";

import { serializeCsv } from "../src/a-cloud-old-components/table-list/components/export-to-excel/csv";

describe("serializeCsv", () => {
  it("matches the SheetJS 0.20.3 CSV bytes for supported export values", () => {
    const columns = [
      "plain",
      "comma",
      "quote",
      "lf",
      "cr",
      "crlf",
      "empty",
      "null",
      "undefined",
      "spaces",
      "formula",
      "plus",
      "at",
      "number",
      "negative",
      "decimal",
      "true",
      "false",
      "date",
      "object",
      "array",
      "nan",
      "positiveInfinity",
      "negativeInfinity",
    ];
    const rows = [
      Object.fromEntries(columns.map((column) => [column, column])),
      {
        plain: "中文",
        comma: "a,b",
        quote: 'a"b',
        lf: "a\nb",
        cr: "a\rb",
        crlf: "a\r\nb",
        empty: "",
        null: null,
        undefined,
        spaces: " a ",
        formula: "=1+1",
        plus: "+1",
        at: "@cmd",
        number: 42,
        negative: -7,
        decimal: 1.25,
        true: true,
        false: false,
        date: new Date(2026, 7, 7),
        object: { a: 1 },
        array: [1, 2],
        nan: Number.NaN,
        positiveInfinity: Number.POSITIVE_INFINITY,
        negativeInfinity: Number.NEGATIVE_INFINITY,
      },
    ];

    const bytes = new TextEncoder().encode(serializeCsv(columns, rows));

    expect(btoa(String.fromCharCode(...Array.from(bytes)))).toBe(
      "77u/cGxhaW4sY29tbWEscXVvdGUsbGYsY3IsY3JsZixlbXB0eSxudWxsLHVuZGVmaW5lZCxzcGFjZXMsZm9ybXVsYSxwbHVzLGF0LG51bWJlcixuZWdhdGl2ZSxkZWNpbWFsLHRydWUsZmFsc2UsZGF0ZSxvYmplY3QsYXJyYXksbmFuLHBvc2l0aXZlSW5maW5pdHksbmVnYXRpdmVJbmZpbml0eQrkuK3mlocsImEsYiIsImEiImIiLCJhCmIiLGENYiwiYQ0KYiIsLCwsIGEgLD0xKzEsKzEsQGNtZCw0MiwtNywxLjI1LFRSVUUsRkFMU0UsOC83LzI2LCwsI05VTSEsI0RJVi8wISwjRElWLzAh",
    );
  });
});
