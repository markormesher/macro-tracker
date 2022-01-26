import { mount } from "enzyme";
import { describe, it } from "mocha";
import * as React from "react";
import { testGlobals } from "../test-utils/global.tests";

describe(__filename, () => {
  let { mountWrapper } = testGlobals;

  it("dummy test", () => {
    mountWrapper = mount(<span>hello</span>);
    mountWrapper.text().should.equal("hello");
  });
});
