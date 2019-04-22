import * as chai from "chai";
import { should } from "chai";
import * as chaiString from "chai-string";
import * as Enzyme from "enzyme";
import { ReactWrapper } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });
chai.use(chaiString);
should();

const testGlobals = {
	mountWrapper: null as ReactWrapper,
};

afterEach(() => {
	if (testGlobals.mountWrapper) {
		try {
			testGlobals.mountWrapper.unmount();
		} catch (e) {
			// this is fine
		} finally {
			// this is fine
		}
	}
});

export {
	testGlobals,
};
