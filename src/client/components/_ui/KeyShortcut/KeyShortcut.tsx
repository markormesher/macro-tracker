import { PureComponent, ReactNode } from "react";

interface IKeyShortcutProps {
  readonly targetStr: string;
  readonly onTrigger: () => void;
}

class KeyShortcut extends PureComponent<IKeyShortcutProps> {
  private latestStr = "";

  constructor(props: IKeyShortcutProps) {
    super(props);

    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  public componentDidMount(): void {
    document.addEventListener("keypress", this.handleKeyPress);
  }

  public componentWillUnmount(): void {
    document.removeEventListener("keypress", this.handleKeyPress);
  }

  public render(): ReactNode {
    return this.props.children || null;
  }

  private handleKeyPress(evt: KeyboardEvent): void {
    const target = evt.target;
    const disallowed = [HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement];
    if (disallowed.some((t) => target instanceof t)) {
      return;
    }

    const { targetStr } = this.props;
    const key = evt.key;
    this.latestStr = (this.latestStr + key).slice(-1 * targetStr.length);

    if (this.latestStr === targetStr) {
      evt.preventDefault();
      this.props.onTrigger();
    }
  }
}

export { KeyShortcut };
