import { expect } from "chai";
import { isTest } from "../commons/utils/env";
import { testGlobals } from "../test-utils/global.tests";

// blank placeholder to keep output folder structure aligned with source

describe("dummy tests - api server", () => {
	expect(isTest()).to.equal(true);
});
