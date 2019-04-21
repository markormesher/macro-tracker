import * as React from "react";
import { KeyboardEvent, MouseEvent, PureComponent, ReactNode } from "react";
import { levenshteinDistance } from "../../../helpers/levenshtein-distance";
import { combine } from "../../../helpers/style-helpers";
import { UIConstants } from "../../_commons/ui-constants";
import { ControlledTextInput, IControlledTextInputProps } from "../ControlledInputs/ControlledTextInput";
import * as styles from "./SuggestionTextInput.scss";

interface ISuggestionTextInputProps extends IControlledTextInputProps {
	readonly suggestionOptions?: string[];
}

interface ISuggestionTextInputState {
	readonly userInput?: string;
	readonly suggestions?: string[];
	readonly selectedSuggestion?: string;
	readonly selectedSuggestionIndex?: number;
}

class SuggestionTextInput extends PureComponent<ISuggestionTextInputProps, ISuggestionTextInputState> {

	private static MAX_SUGGESTIONS_SHOWN = 10;

	private static removeRegexChars(str: string): string {
		return str.replace(/[\^$\\+*?.(){}\[\]]/g, "");
	}

	private static formatSuggestion(suggestion: string, input: string): ReactNode {
		const output: ReactNode[] = [];
		const suggestionChars = suggestion.split("");
		let consumedInputIndex = 0;
		for (const c of suggestionChars) {
			if (c.length && c.toLowerCase() === input.charAt(consumedInputIndex).toLowerCase()) {
				output.push(<span className={styles.highlight} key={`${consumedInputIndex}-${c}`}>{c}</span>);
				++consumedInputIndex;
			} else {
				output.push(c);
			}
		}
		return <>{output}</>;
	}

	constructor(props: ISuggestionTextInputProps, context: any) {
		super(props, context);
		this.state = {
			userInput: undefined,
			suggestions: [],
			selectedSuggestion: undefined,
			selectedSuggestionIndex: -1,
		};

		this.renderSuggestions = this.renderSuggestions.bind(this);
		this.handleValueChange = this.handleValueChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleSuggestionClick = this.handleSuggestionClick.bind(this);
		this.clearSuggestions = this.clearSuggestions.bind(this);
		this.generateSuggestions = this.generateSuggestions.bind(this);
	}

	public render(): ReactNode {
		const { suggestionOptions, ...inputProps } = this.props;
		const innerInputProps = inputProps && inputProps.inputProps || {};
		const { suggestions } = this.state;

		return (
				<>
					<ControlledTextInput
							{...inputProps}
							inputProps={{
								...innerInputProps,
								onBlur: this.handleBlur,
								onKeyDown: this.handleKeyDown,
							}}
							onValueChange={this.handleValueChange}
					/>
					{suggestions && suggestions.length > 0 && this.renderSuggestions()}
				</>
		);
	}

	private renderSuggestions(): ReactNode {
		const { userInput, suggestions, selectedSuggestionIndex } = this.state;
		const hasOverflow = suggestions.length > SuggestionTextInput.MAX_SUGGESTIONS_SHOWN;
		return (
				<div className={styles.suggestionWrapper}>
					<ul>
						{suggestions.slice(0, SuggestionTextInput.MAX_SUGGESTIONS_SHOWN).map((s, i) => (
								<li
										key={s}
										title={s}
										className={combine(selectedSuggestionIndex === i && styles.active)}
										onMouseDown={this.handleSuggestionClick}
								>
									{SuggestionTextInput.formatSuggestion(s, userInput)}
								</li>
						))}
						{hasOverflow && <li key={"..."} className={styles.overflow}>...</li>}
					</ul>
				</div>
		);
	}

	private handleValueChange(value: string, id: string): void {
		this.generateSuggestions(value);

		if (this.props.onValueChange) {
			this.props.onValueChange(value, id);
		}
	}

	private handleKeyDown(evt: KeyboardEvent<HTMLInputElement>): void {
		const { id } = this.props;
		const { suggestions, selectedSuggestion } = this.state;
		let { selectedSuggestionIndex } = this.state;

		switch (evt.keyCode) {
			case UIConstants.keys.UP:
				selectedSuggestionIndex = Math.max(0, selectedSuggestionIndex - 1);
				this.setState({
					selectedSuggestionIndex,
					selectedSuggestion: suggestions[selectedSuggestionIndex],
				});
				evt.preventDefault();
				break;

			case UIConstants.keys.DOWN:
				selectedSuggestionIndex = Math.min(
						SuggestionTextInput.MAX_SUGGESTIONS_SHOWN - 1,
						Math.min(suggestions.length - 1, selectedSuggestionIndex + 1),
				);
				this.setState({
					selectedSuggestionIndex,
					selectedSuggestion: suggestions[selectedSuggestionIndex],
				});
				evt.preventDefault();
				break;

			case UIConstants.keys.ENTER:
				if (suggestions && suggestions.length && selectedSuggestion) {
					if (this.props.onValueChange) {
						this.props.onValueChange(selectedSuggestion, id);
					}
					this.clearSuggestions();
					evt.preventDefault();
				}
				break;

			case UIConstants.keys.ESC:
				if (suggestions && suggestions.length) {
					this.clearSuggestions();
					evt.preventDefault();
					evt.stopPropagation();
				}
				break;
		}
	}

	private handleSuggestionClick(evt: MouseEvent<HTMLLIElement>): void {
		const { id } = this.props;
		const value = (evt.target as HTMLLIElement).title;
		if (this.props.onValueChange) {
			this.props.onValueChange(value, id);
		}
		this.clearSuggestions();
	}

	private handleBlur(): void {
		this.clearSuggestions();
	}

	private clearSuggestions(): void {
		this.setState({
			suggestions: undefined,
			selectedSuggestionIndex: -1,
			selectedSuggestion: undefined,
		});
	}

	private generateSuggestions(value: string): void {
		if (!value || value === "") {
			this.clearSuggestions();
			return;
		}

		const { suggestionOptions } = this.props;
		const { selectedSuggestion } = this.state;

		const regex = new RegExp(".*" + SuggestionTextInput.removeRegexChars(value).split("").join(".*") + ".*", "i");
		const scores: { [key: string]: number } = {};
		const suggestions = suggestionOptions
				.filter((s) => regex.test(s))
				.sort((a, b) => {
					scores[a] = scores[a] || levenshteinDistance(value, a);
					scores[b] = scores[b] || levenshteinDistance(value, b);
					return scores[a] - scores[b];
				});

		// if the previously-selected suggestion is still in the list, keep it selected
		const newSelectedSuggestionIndex = suggestions.indexOf(selectedSuggestion);
		const newSelectedSuggestion = newSelectedSuggestionIndex >= 0 ? suggestions[newSelectedSuggestionIndex] : undefined;

		this.setState({
			userInput: value,
			suggestions,
			selectedSuggestion: newSelectedSuggestion,
			selectedSuggestionIndex: newSelectedSuggestionIndex,
		});
	}
}

export {
	ISuggestionTextInputProps,
	SuggestionTextInput,
};
