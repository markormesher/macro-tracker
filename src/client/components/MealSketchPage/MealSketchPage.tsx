import { faCheck, faPencil } from "@fortawesome/pro-light-svg-icons";
import * as React from "react";
import { PureComponent, ReactNode } from "react";
import { getDefaultDiaryEntry, IDiaryEntry } from "../../../commons/models/IDiaryEntry";
import { IFoodItem } from "../../../commons/models/IFoodItem";
import { generateMacroSummary } from "../../../commons/models/IMacroSummary";
import { IServingSize } from "../../../commons/models/IServingSize";
import { getDefaultTarget } from "../../../commons/models/ITarget";
import { formatLargeNumber, formatMeasurement } from "../../../commons/utils/formatters";
import { getNutritionBaseAmount, getTotalDiaryEntryMeasurement } from "../../../commons/utils/helpers";
import * as bs from "../../global-styles/Bootstrap.scss";
import * as gs from "../../global-styles/Global.scss";
import { combine } from "../../helpers/style-helpers";
import { ContentWrapper } from "../_ui/ContentWrapper/ContentWrapper";
import { DeleteBtn } from "../_ui/DeleteBtn/DeleteBtn";
import { IconBtn } from "../_ui/IconBtn/IconBtn";
import { FoodItemPicker } from "../FoodItemPicker/FoodItemPicker";
import { ServingPicker } from "../ServingPicker/ServingPicker";
import * as style from "./MealSketchPage.scss";

interface IMealSketchPageState {
	readonly diaryEntries: IDiaryEntry[];
	readonly activeEditPositions: number[];
}

class MealSketchPage extends PureComponent<any, IMealSketchPageState> {

	constructor(props: any, context: any) {
		super(props, context);

		this.state = {
			diaryEntries: [],
			activeEditPositions: [],
		};

		this.renderSummary = this.renderSummary.bind(this);
		this.renderContents = this.renderContents.bind(this);
		this.renderPicker = this.renderPicker.bind(this);
		this.renderDiaryEntry = this.renderDiaryEntry.bind(this);
		this.handleAddFoodItem = this.handleAddFoodItem.bind(this);
		this.handleToggleEditFoodItem = this.handleToggleEditFoodItem.bind(this);
		this.handleDeleteFoodItem = this.handleDeleteFoodItem.bind(this);
		this.handleServingQtyChange = this.handleServingQtyChange.bind(this);
		this.handleServingSizeChange = this.handleServingSizeChange.bind(this);
	}

	public render(): ReactNode {
		return (
				<div className={style.outerWrapper}>
					{this.renderSummary()}
					{this.renderContents()}
					{this.renderPicker()}
				</div>
		);
	}

	private renderSummary(): ReactNode {
		const { diaryEntries } = this.state;

		// we don't care about the target at this point
		const summary = generateMacroSummary(diaryEntries, [], getDefaultTarget());

		return (
				<div className={style.summaryWrapper}>
					<div className={style.summaryItem}>
						<span className={bs.mr2}>
							{formatLargeNumber(summary.totalCalories)}
						</span>
						calories
					</div>
					<div className={style.summaryItem}>
						<span className={bs.mr2}>
							{formatMeasurement(summary.totalCarbohydrates, "g")}
						</span>
						carbohydrates
					</div>
					<div className={style.summaryItem}>
						<span className={bs.mr2}>
							{formatMeasurement(summary.totalFat, "g")}
						</span>
						fat
					</div>
					<div className={style.summaryItem}>
						<span className={bs.mr2}>
							{formatMeasurement(summary.totalProtein, "g")}
						</span>
						protein
					</div>
				</div>
		);
	}

	private renderContents(): ReactNode {
		const { diaryEntries } = this.state;

		if (diaryEntries.length === 0) {
			return (
					<div className={style.contentWrapper}>
						<ContentWrapper>
							<p className={combine(bs.textMuted, bs.textCenter)}>
								Select some food to get started.
							</p>
						</ContentWrapper>
					</div>
			);
		} else {
			return (
					<div className={style.contentWrapper}>
						<ContentWrapper>
							{diaryEntries.map(this.renderDiaryEntry)}
						</ContentWrapper>
					</div>
			);
		}
	}

	private renderPicker(): ReactNode {
		return (
				<div className={style.pickerWrapper}>
					<ContentWrapper disableBottomPadding={true}>
						<FoodItemPicker
								onValueChange={this.handleAddFoodItem}
						/>
					</ContentWrapper>
				</div>
		);
	}

	private renderDiaryEntry(entry: IDiaryEntry, index: number): ReactNode {
		// TODO: de-dupe code between here and diary page

		const { activeEditPositions } = this.state;
		const { foodItem, servingSize } = entry;

		if (activeEditPositions.indexOf(index) >= 0) {
			return (
					<div className={bs.dFlex} key={index}>
						<div className={combine(bs.flexGrow1, bs.my1, bs.mr2)}>
							<ServingPicker
									foodItem={foodItem}
									servingQty={entry.servingQty}
									servingSize={entry.servingSize}
									payload={index}
									onServingQtyChange={this.handleServingQtyChange}
									onServingSizeChange={this.handleServingSizeChange}
							/>
						</div>
						<div
								className={combine(bs.dInlineBlock, bs.flexGrow0, bs.myAuto)}
						>
							<IconBtn
									icon={faCheck}
									text={"Done"}
									payload={index}
									onClick={this.handleToggleEditFoodItem}
									btnProps={{
										className: combine(bs.btnOutlineDark, gs.btnMini),
									}}
							/>
						</div>
					</div>
			);
		} else {
			const totalMeasurement = getTotalDiaryEntryMeasurement(entry);
			const infoChunks: ReactNode[] = [];

			infoChunks.push((
					<span key={`info-chunk-brand`} className={combine(bs.textMuted, bs.small)}>
					{foodItem.brand}
				</span>
			));

			if (foodItem.measurementUnit === "single_serving") {
				infoChunks.push((
						<span key={`info-chunk-serving-size`} className={combine(bs.textMuted, bs.small)}>
						{entry.servingQty} serving
					</span>
				));
			} else if (servingSize) {
				infoChunks.push((
						<span key={`info-chunk-serving-size`} className={combine(bs.textMuted, bs.small)}>
						{entry.servingQty} {servingSize.label}
					</span>
				));
			} else {
				infoChunks.push((
						<span key={`info-chunk-serving-measurement`} className={combine(bs.textMuted, bs.small)}>
					{formatMeasurement(totalMeasurement, foodItem.measurementUnit)}
				</span>
				));
			}

			infoChunks.push((
					<span key={`info-chunk-calories`} className={combine(bs.textMuted, bs.small)}>
					{formatLargeNumber(totalMeasurement * foodItem.caloriesPerBaseAmount / getNutritionBaseAmount(foodItem))} kcal
				</span>
			));

			for (let i = 1; i < infoChunks.length; i += 2) {
				infoChunks.splice(i, 0, (
						<span key={`spacer-${i}`} className={combine(bs.textMuted, bs.small, bs.mx1)}>
						&bull;
					</span>
				));
			}

			return (
					<div className={bs.dFlex} key={index}>
						<p className={combine(bs.flexGrow1, bs.mb1)}>
							{foodItem.name}
							<br/>
							{infoChunks}
						</p>
						<div
								className={combine(bs.dInlineBlock, bs.btnGroup, bs.btnGroupSm, bs.flexGrow0, bs.myAuto)}
								style={{ whiteSpace: "nowrap" }}
						>
							<IconBtn
									icon={faPencil}
									text={"Edit"}
									payload={index}
									onClick={this.handleToggleEditFoodItem}
									btnProps={{
										className: combine(bs.btnOutlineDark, gs.btnMini),
									}}
							/>
							<DeleteBtn
									payload={index}
									onConfirmedClick={this.handleDeleteFoodItem}
									btnProps={{
										className: combine(bs.btnOutlineDark, gs.btnMini),
									}}
							/>
						</div>
					</div>
			);
		}
	}

	private handleAddFoodItem(foodItem: IFoodItem): void {
		const diaryEntry = {
			...getDefaultDiaryEntry(),
			foodItem,
		};

		const diaryEntries = [...this.state.diaryEntries, diaryEntry];
		this.setState({ diaryEntries });
	}

	private handleToggleEditFoodItem(index: number): void {
		const { activeEditPositions } = this.state;
		if (activeEditPositions.indexOf(index) >= 0) {
			// remove from the array
			this.setState({
				activeEditPositions: activeEditPositions.filter((i) => i !== index),
			});
		} else {
			// insert into the array
			this.setState({
				activeEditPositions: [...activeEditPositions, index],
			});
		}
	}

	private handleDeleteFoodItem(index: number): void {
		this.setState({
			diaryEntries: this.state.diaryEntries.filter((v, i) => i !== index),
		});
	}

	private handleServingQtyChange(servingQty: number, index: number): void {
		const { diaryEntries } = this.state;
		this.setState({
			diaryEntries: diaryEntries.map((originalEntry, idx) => {
				if (idx === index) {
					return {
						...originalEntry,
						servingQty,
					};
				} else {
					return originalEntry;
				}
			}),
		});
	}

	private handleServingSizeChange(servingSize: IServingSize, index: number): void {
		const { diaryEntries } = this.state;
		this.setState({
			diaryEntries: diaryEntries.map((originalEntry, idx) => {
				if (idx === index) {
					return {
						...originalEntry,
						servingSize,
					};
				} else {
					return originalEntry;
				}
			}),
		});
	}
}

export {
	MealSketchPage,
};
