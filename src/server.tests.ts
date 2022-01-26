import { expect } from "chai";
import { testGlobals } from "./test-utils/global.tests";
import { isTest } from "./utils/env";

// blank placeholder to keep output folder structure aligned with source

testGlobals.init();

describe(__filename, () => {
  it("dummy test", () => {
    expect(isTest()).to.equal(true);
  });
});
